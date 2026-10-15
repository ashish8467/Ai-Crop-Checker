from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


def test_register_and_farm_profile_endpoints():
    with TestClient(app) as client:
        registration = client.post("/api/v1/auth/register", json={
            "name": "Test Farmer", "email": f"{uuid4()}@example.com", "password": "long-test-password",
        })
        assert registration.status_code == 201
        token = registration.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        created = client.post("/api/v1/farms", headers=headers, json={
            "name": "North field", "state": "Uttar Pradesh", "district": "Lucknow", "area_acres": 2.5,
        })
        assert created.status_code == 201
        assert created.json()["area_acres"] == 2.5
        listing = client.get("/api/v1/farms", headers=headers)
        assert listing.status_code == 200
        assert listing.json()[0]["name"] == "North field"
