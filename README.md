<<<<<<< HEAD
# Kisan Saathi · AI Smart Farming

A responsive farmer dashboard with a FastAPI service for farm profiles, weather forecasts, crop screening, mandi data integration, and crop-image validation.

## Start the backend

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

For the quickest local run, set `DATABASE_URL=sqlite:///./smart_farming.db` in `backend/.env`. For PostgreSQL, run `docker compose up -d db` from the project root and use the database URL already shown in `backend/.env.example`. Set a unique `SECRET_KEY` in `.env` before registering accounts.

```powershell
uvicorn app.main:app --reload
```

The API docs are available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) and health at [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health).

## Start the frontend

In another terminal, from the project root:

```powershell
py -m http.server 5500 --directory frontend
```

Open [http://127.0.0.1:5500](http://127.0.0.1:5500). The API address is configurable in `frontend/js/config.js`.

## Implemented

- Responsive dashboard and English/Hindi interface toggle.
- Account registration/login, signed access tokens, farm profile storage, and paginated farm listing.
- Open-Meteo current conditions and 7-day forecast with source labels.
- Rule-based crop suitability screening with reasons, risks, missing-input warnings, and optional weather context.
- Profit arithmetic when expected yield, sale price, and costs are provided by the user.
- Market-price/trend integration interface for a configured Agmarknet/data.gov.in resource.
- Image type, integrity, and size validation for disease-image submissions.
- Optional Groq explanation button on crop screening; it uses only supplied recommendation data and a server-side key.

## Dependencies still needed for agricultural claims

No disease classifier weights or compatible model adapter are included, so the app makes no disease prediction. The crop catalog is a starter screening aid, not a regionally validated model. Mandi prices and arrivals require a configured authorized source. Groq, if enabled, explains only supplied recommendation data. These limits are visible in the API and UI; live market values, diagnoses, and profit assumptions are not fabricated.

See [backend/README.md](backend/README.md) for endpoint examples, environment variables, and database notes. Never place API keys in frontend files or commit `.env`.

## Run backend checks

From `backend/`, install the development requirements and run `pytest`. The test suite covers crop calculations, farm registration/profile APIs, image validation, weather, and market response behavior.
=======
# Smart-Farming
>>>>>>> c7ad601320116bffe53f5811e4d9a3ecd4be1cd3
