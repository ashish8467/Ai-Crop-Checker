from fastapi import APIRouter, Query

from app.services.market_service import prices, trends

router = APIRouter()


@router.get("/prices")
async def get_prices(commodity: str | None = None, state: str | None = None, district: str | None = None,
                     limit: int = Query(50, ge=1, le=100)):
    return await prices(commodity, state, district, limit)


@router.get("/trends")
async def get_trends(commodity: str | None = None, state: str | None = None, district: str | None = None,
                     limit: int = Query(100, ge=1, le=200)):
    return await trends(commodity, state, district, limit)
