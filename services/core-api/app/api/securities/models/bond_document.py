import uuid

from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from datetime import datetime

from app.extensions import db
from app.api.mines.documents.models.mine_document import MineDocument


class BondDocument(MineDocument):
    __tablename__ = 'bond_document'
    __mapper_args__ = {
        'polymorphic_identity': 'bond',          ## type code
    }

    mine_document_id = db.Column(
        db.Integer, db.ForeignKey('mine_document.mine_document_id'), primary_key=True)
    bond_id = db.Column(db.Integer, db.ForeignKey('bond.bond_id'))

    bond = db.relationship('Bond', lazy='joined')