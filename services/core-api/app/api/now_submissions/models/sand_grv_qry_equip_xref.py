from app.api.utils.models_mixins import Base
from app.extensions import db


class SandGrvQryEquipXref(Base):
    __tablename__ = "sand_grv_qry_equip_xref"
    __table_args__ = {"schema": "now_submissions"}
    messageid = db.Column(db.Integer,
                          db.ForeignKey('now_submissions.application.messageid'),
                          primary_key=True)
    equipmentid = db.Column(db.Integer,
                            db.ForeignKey('now_submissions.equipment.equipmentid'),
                            primary_key=True)

    def __repr__(self):
        return '<SandGrvQryEquipXref %r>' % self.messageid
