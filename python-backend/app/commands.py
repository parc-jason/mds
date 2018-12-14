from datetime import datetime
import random
from concurrent.futures import ThreadPoolExecutor, as_completed

import click
import names
from sqlalchemy.exc import DBAPIError

from .api.mines.location.models.mine_location import MineLocation
from .api.mines.region.models.region import MineRegionCode
from .api.mines.mine.models.mine_type import MineType
from .api.constants import (
        PERMIT_STATUS_CODE,
        MINE_OPERATION_STATUS,
        MINE_OPERATION_STATUS_REASON,
        MINE_OPERATION_STATUS_SUB_REASON,
        MINE_REGION_OPTIONS
)
from .api.mines.mine.models.mine_identity import MineIdentity
from .api.mines.mine.models.mine_detail import MineDetail
from .api.mines.mine.models.mineral_tenure_xref import MineralTenureXref
from .api.mines.mine.models.mine_tenure_type_code import MineTenureTypeCode
from .api.parties.party.models.party import Party
from .api.parties.party.models.party_type_code import PartyTypeCode
from .api.permits.permit.models.permit import Permit
from .api.permits.permit.models.permit_status_code import PermitStatusCode
from .api.permits.permittee.models.permittee import Permittee
from .api.mines.status.models.mine_operation_status_code import MineOperationStatusCode
from .api.mines.status.models.mine_operation_status_reason_code import MineOperationStatusReasonCode
from .api.mines.status.models.mine_operation_status_sub_reason_code import MineOperationStatusSubReasonCode
from .api.utils.random import generate_mine_no, generate_mine_name, random_geo, random_key_gen, random_date,random_region,random_mine_category

from .extensions import db


def register_commands(app):
    DUMMY_USER_KWARGS = {'create_user': 'DummyUser', 'update_user': 'DummyUser'}

    def create_multiple_mine_tenure(num, mine_identity):
        for _ in range(num):
            MineralTenureXref.create_mine_tenure(mine_identity, random_key_gen(key_length=7, letters=False), DUMMY_USER_KWARGS)

    def create_multiple_permit_permittees(num, mine_identity, party, prev_party_guid):
        for _ in range(num):
            mine_permit = Permit.create_mine_permit(mine_identity, random_key_gen(key_length=12), random.choice(PERMIT_STATUS_CODE['choices']), random_date(), DUMMY_USER_KWARGS)
            permittee_party = random.choice([party.party_guid, prev_party_guid]) if prev_party_guid else party.party_guid
            Permittee.create_mine_permittee(mine_permit, permittee_party, random_date(), DUMMY_USER_KWARGS)



    # in terminal you can run $flask <cmd> <arg>
    @app.cli.command()
    @click.argument('num')
    @click.argument('threading', default=True)
    def create_data(num, threading):
        """
        Creates dummy data in the database. If threading=True
        Use Threading and multiprocessing to create records in chunks of 100.

        :param num: number of records create
        :param threading: use threading or not
        :return: None
        """
        if threading:
            with ThreadPoolExecutor() as executor:
                batch_size = 100
                num = int(num)

                # Break num into a list of ints of size batch_size, then append remainder. E.g. 520 -> [100, 100, 100, 100, 100, 20]
                full_batches = int(num / batch_size)
                batches = [batch_size] * full_batches
                batches.append(num % batch_size)

                task_list = []
                for batch in batches:
                    task_list.append(executor.submit(_create_data, batch))
                for task in as_completed(task_list):
                    try:
                        data = task.result()
                    except Exception as exc:
                        print(f'generated an exception: {exc}')
        else:
            _create_data(num)

    def _create_data(num):
        with app.app_context():
            party = None
            mine_tenure_type_codes = list(map(
                lambda x: x['value'],
                MineTenureTypeCode.all_options()
            ))
            for _ in range(int(num)):
                # Ability to add previous party to have multiple permittee
                prev_party_guid = party.party_guid if party else None
                mine_identity = MineIdentity.create_mine_identity(DUMMY_USER_KWARGS)
                MineDetail.create_mine_detail(mine_identity, generate_mine_no(), generate_mine_name(),
                                              random_mine_category(),random_region(),
                                              DUMMY_USER_KWARGS)
                MineType.create_mine_type(
                    mine_identity.mine_guid,
                    random.choice(mine_tenure_type_codes),
                    DUMMY_USER_KWARGS)
                MineLocation.create_mine_location(mine_identity, random_geo(), DUMMY_USER_KWARGS)
                party = Party.create_party(names.get_first_name(), names.get_last_name(), DUMMY_USER_KWARGS)

                create_multiple_mine_tenure(random.randint(0, 4), mine_identity)
                create_multiple_permit_permittees(random.randint(0, 6), mine_identity, party, prev_party_guid)

            try:
                db.session.commit()
                print(f'Created {num} random mines with tenure, permits, and permittee.')
            except DBAPIError:
                db.session.rollback()
                raise

    @app.cli.command()
    def delete_data():
        meta = db.metadata
        for table in reversed(meta.sorted_tables):
            if 'view' in table.name:
                continue
            db.session.execute(table.delete())
        # Reseed Mandatory Data
        PermitStatusCode.create_mine_permit_status_code('O', 'Open permit', 10, DUMMY_USER_KWARGS)
        PermitStatusCode.create_mine_permit_status_code('C', 'Closed permit', 20, DUMMY_USER_KWARGS)
        PartyTypeCode.create_party_type_code('PER', 'Person', 10, DUMMY_USER_KWARGS)
        PartyTypeCode.create_party_type_code('ORG', 'Organzation', 20, DUMMY_USER_KWARGS)

        for k, v in MINE_OPERATION_STATUS.items():
            MineOperationStatusCode.create_mine_operation_status_code(v['value'], v['label'], 1, DUMMY_USER_KWARGS)

        for k, v in MINE_OPERATION_STATUS_REASON.items():
            MineOperationStatusReasonCode.create_mine_operation_status_reason_code(v['value'], v['label'], 1, DUMMY_USER_KWARGS)

        for k, v in MINE_OPERATION_STATUS_SUB_REASON.items():
            MineOperationStatusSubReasonCode.create_mine_operation_status_sub_reason_code(v['value'], v['label'], 1, DUMMY_USER_KWARGS)

        display_order = 10
        for item in MINE_REGION_OPTIONS:
            MineRegionCode.create_mine_region_code(item['value'], item['label'], display_order, random_date(), random_date(), DUMMY_USER_KWARGS)
            display_order += 10

        try:
            db.session.commit()
            click.echo(f'Database has been cleared.')
        except DBAPIError:
            db.session.rollback()
            click.echo(f'Error, failed on commit.')
            raise