from fastapi import APIRouter

from app.api.v1.endpoints import auth, crops, disease, farms, market, weather

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(farms.router, prefix="/farms", tags=["farms"])
api_router.include_router(disease.router, prefix="/disease", tags=["disease"])
api_router.include_router(crops.router, prefix="/crops", tags=["crops"])
api_router.include_router(weather.router, prefix="/weather", tags=["weather"])
api_router.include_router(market.router, prefix="/market", tags=["market"])
