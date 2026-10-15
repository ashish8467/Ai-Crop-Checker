from typing import Literal

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.v1.endpoints.dependencies import get_current_user
from app.core.config import settings
from app.database.database import get_db
from app.models.user import User
from app.repositories.disease_repository import list_for_owner
from app.integrations.groq_client import GroqServiceError
from app.schemas.disease import DiseaseAnalysisResponse, DiseaseReportResponse
from app.services.disease_service import analyze
from app.utils.image_validation import validate_image

router = APIRouter()


@router.post("/detect", response_model=DiseaseAnalysisResponse)
async def detect_disease(
    image: UploadFile = File(...),
    crop_name: str = Form(..., min_length=1, max_length=80),
    language: Literal["en", "hi"] = Form("en"),
    _user: User = Depends(get_current_user),
):
    if image.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=415, detail="Upload a JPEG, PNG, or WebP leaf image.")
    data = await image.read(settings.max_image_bytes + 1)
    if len(data) > settings.max_image_bytes:
        raise HTTPException(status_code=413, detail="Image exceeds the 5 MB upload limit.")
    valid, message = validate_image(data)
    if not valid:
        raise HTTPException(status_code=422, detail=message)
    crop_name = crop_name.strip()
    if not crop_name:
        raise HTTPException(status_code=422, detail="Enter the crop name so the photo can be assessed in context.")
    try:
        return await analyze(data, crop_name, language)
    except GroqServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc


@router.get("/reports", response_model=list[DiseaseReportResponse])
def reports(skip: int = 0, limit: int = 50, db: Session = Depends(get_db),
            user: User = Depends(get_current_user)):
    return list_for_owner(db, user.id, max(skip, 0), min(max(limit, 1), 100))
