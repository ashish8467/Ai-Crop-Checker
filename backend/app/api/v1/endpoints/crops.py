from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.endpoints.dependencies import get_current_user
from app.database.database import get_db
from app.core.config import settings
from app.integrations.groq_client import explain_recommendations
from app.models.crop_recommendation import CropRecommendation
from app.models.farm import Farm
from app.models.user import User
from app.schemas.crop import CropRecommendationRequest, ProfitEstimateRequest
from app.services.crop_recommendation_service import rank_crops
from app.services.profit_estimation_service import calculate
from app.services.weather_service import get_forecast

router = APIRouter()


@router.post("/recommend")
async def recommend(payload: CropRecommendationRequest, db: Session = Depends(get_db),
                    user: User = Depends(get_current_user)):
    if payload.farm_id is not None:
        farm = db.get(Farm, payload.farm_id)
        if farm is None or farm.owner_id != user.id:
            raise HTTPException(status_code=404, detail="Farm not found.")
    weather = None
    if payload.latitude is not None and payload.longitude is not None:
        try:
            weather = await get_forecast(payload.latitude, payload.longitude)
        except RuntimeError:
            weather = None
    result = rank_crops(payload, weather)
    saved = CropRecommendation(owner_id=user.id, farm_id=payload.farm_id, results=result)
    db.add(saved)
    db.commit()
    result["recommendation_id"] = saved.id
    return result


@router.post("/profit-estimate")
def profit_estimate(payload: ProfitEstimateRequest, _user: User = Depends(get_current_user)):
    return {"crop": payload.crop, **calculate(payload.area_acres, payload.expected_yield_per_acre,
                                               payload.price_per_quintal, payload.cost_per_acre)}


@router.post("/explain")
async def explain(payload: dict, _user: User = Depends(get_current_user)):
    recommendations = payload.get("recommendations")
    if not isinstance(recommendations, list):
        raise HTTPException(status_code=422, detail="Provide a recommendations array from the crop screening result.")
    try:
        explanation = await explain_recommendations(recommendations)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Groq is temporarily unavailable.") from exc
    return {"explanation": explanation, "generated_by": "Groq", "source_data": "Provided screening results"}
