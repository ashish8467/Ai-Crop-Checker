import httpx

from app.core.cache import cache_get, cache_set
from app.integrations.open_meteo_client import forecast


async def get_forecast(latitude: float, longitude: float) -> dict:
    cache_key = f"weather:{latitude:.3f}:{longitude:.3f}"
    cached = cache_get(cache_key)
    if cached is not None:
        return cached
    try:
        result = await forecast(latitude, longitude)
        cache_set(cache_key, result, ttl_seconds=600)
        return result
    except (httpx.HTTPError, ValueError) as exc:
        raise RuntimeError("Weather forecast is temporarily unavailable.") from exc
