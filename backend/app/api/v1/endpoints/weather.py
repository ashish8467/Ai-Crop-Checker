from fastapi import APIRouter, HTTPException, Query
import httpx

from app.services.weather_service import get_forecast

router = APIRouter()


@router.get("/forecast")
async def forecast(latitude: float = Query(ge=-90, le=90), longitude: float = Query(ge=-180, le=180)):
    try:
        data = await get_forecast(latitude, longitude)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {"source": "Open-Meteo", "data": data}
