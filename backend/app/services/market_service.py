from app.core.cache import cache_get, cache_set
from app.integrations.mandi_data_client import fetch_prices


async def prices(commodity: str | None = None, state: str | None = None,
                 district: str | None = None, limit: int = 50) -> dict:
    key = f"market:{commodity or ''}:{state or ''}:{district or ''}:{limit}"
    cached = cache_get(key)
    if cached is not None:
        return cached
    result = await fetch_prices(commodity, state, district, limit)
    cache_set(key, result, ttl_seconds=300 if result["status"] == "ok" else 45)
    return result


async def trends(commodity: str | None, state: str | None, district: str | None, limit: int = 100) -> dict:
    result = await prices(commodity, state, district, limit)
    result["trend_note"] = "Trend calculations require dated price records from the configured source."
    return result
