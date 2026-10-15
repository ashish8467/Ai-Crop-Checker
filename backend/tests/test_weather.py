from fastapi.testclient import TestClient

from app.api.v1.endpoints import weather as weather_endpoint
from app.main import app


def test_weather_endpoint_returns_forecast_with_source(monkeypatch):
    async def fake_forecast(latitude, longitude):
        assert latitude == 26.85
        assert longitude == 80.95
        return {"current": {"temperature_2m": 28}, "daily": {"time": ["2026-10-15"]}}

    monkeypatch.setattr(weather_endpoint, "get_forecast", fake_forecast)
    with TestClient(app) as client:
        response = client.get("/api/v1/weather/forecast?latitude=26.85&longitude=80.95")

    assert response.status_code == 200
    assert response.json()["source"] == "Open-Meteo"
    assert response.json()["data"]["current"]["temperature_2m"] == 28
