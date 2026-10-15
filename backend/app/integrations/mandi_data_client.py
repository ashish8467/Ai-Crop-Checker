import httpx

from app.core.config import settings


async def fetch_prices(commodity: str | None, state: str | None, district: str | None, limit: int = 50) -> dict:
    if not settings.agmarknet_api_url or not settings.agmarknet_api_key:
        return {"status": "not_configured", "source": None, "records": [],
                "message": "Configure AGMARKNET_API_URL and AGMARKNET_API_KEY for a data.gov.in Agmarknet resource."}
    params: dict[str, str | int] = {"api-key": settings.agmarknet_api_key, "format": "json", "limit": limit}
    for key, value in (("commodity", commodity), ("state", state), ("district", district)):
        if value:
            params[f"filters[{key}]" ] = value
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(settings.agmarknet_api_url, params=params)
            response.raise_for_status()
            payload = response.json()
        records = payload.get("records", []) if isinstance(payload, dict) else []
        return {"status": "ok", "source": "Agmarknet via data.gov.in", "records": records,
                "message": None if records else "The configured source returned no matching records."}
    except (httpx.HTTPError, ValueError) as exc:
        return {"status": "unavailable", "source": "Agmarknet via data.gov.in", "records": [],
                "message": f"Market source is temporarily unavailable ({type(exc).__name__})."}
