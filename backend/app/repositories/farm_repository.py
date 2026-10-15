from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.farm import Farm


def list_for_owner(db: Session, owner_id: int, skip: int = 0, limit: int = 50) -> list[Farm]:
    return list(db.scalars(select(Farm).where(Farm.owner_id == owner_id).offset(skip).limit(limit)))


def get_for_owner(db: Session, farm_id: int, owner_id: int) -> Farm | None:
    return db.scalar(select(Farm).where(Farm.id == farm_id, Farm.owner_id == owner_id))
