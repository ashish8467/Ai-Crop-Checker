from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints.dependencies import get_current_user
from app.database.database import get_db
from app.models.farm import Farm
from app.models.user import User
from app.repositories.farm_repository import get_for_owner, list_for_owner
from app.schemas.farm import FarmCreate, FarmResponse

router = APIRouter()


@router.get("", response_model=list[FarmResponse])
def list_farms(skip: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=100),
               db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return list_for_owner(db, user.id, skip, limit)


@router.post("", response_model=FarmResponse, status_code=status.HTTP_201_CREATED)
def create_farm(payload: FarmCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    farm = Farm(**payload.model_dump(), owner_id=user.id)
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return farm


@router.get("/{farm_id}", response_model=FarmResponse)
def get_farm(farm_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    farm = get_for_owner(db, farm_id, user.id)
    if farm is None:
        raise HTTPException(status_code=404, detail="Farm not found.")
    return farm
