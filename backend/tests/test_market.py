from fastapi.testclient import TestClient

from app.api.v1.endpoints import market as market_endpoint
from app.main import app


def test_market_prices_endpoint_preserves_explicit_source_status(monkeypatch):
    async def fake_prices(commodity, state, district, limit):
        return {"status": "not_configured", "source": None, "records": [], "message": "source not configured"}

    monkeypatch.setattr(market_endpoint, "prices", fake_prices)
    with TestClient(app) as client:
        response = client.get("/api/v1/market/prices?commodity=Wheat")

    assert response.status_code == 200
    assert response.json()["status"] == "not_configured"
    assert response.json()["records"] == []
