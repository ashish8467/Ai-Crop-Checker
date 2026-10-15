from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.disease_report import DiseaseReport


def list_for_owner(db: Session, owner_id: int, skip: int = 0, limit: int = 50) -> list[DiseaseReport]:
    query = select(DiseaseReport).where(DiseaseReport.owner_id == owner_id).order_by(DiseaseReport.created_at.desc())
    return list(db.scalars(query.offset(skip).limit(limit)))
