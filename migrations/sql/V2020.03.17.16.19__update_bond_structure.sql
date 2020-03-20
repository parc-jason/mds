ALTER TABLE bond ADD COLUMN institution_name varchar,
ADD COLUMN institution_street varchar,
ADD COLUMN institution_city varchar,
ADD COLUMN institution_province varchar,
ADD COLUMN institution_postal_code varchar,
ADD COLUMN note varchar,
ADD COLUMN issue_date timestamp,
DROP CONSTRAINT bond_institution_party_guid_fkey,
DROP COLUMN institution_party_guid;