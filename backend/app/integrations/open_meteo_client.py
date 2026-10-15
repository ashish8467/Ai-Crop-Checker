import httpx

from app.core.config import settings


async def forecast(latitude: float, longitude: float) -> dict:
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "timezone": "auto",
        "forecast_days": 7,
        "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m",
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max",
    }
    async with httpx.AsyncClient(timeout=settings.open_meteo_timeout_seconds) as client:
        response = await client.get(settings.open_meteo_base_url, params=params)
        response.raise_for_status()
        return response.json()
