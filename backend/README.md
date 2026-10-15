# Kisan Saathi API

FastAPI backend for farm profiles, crop screening, weather, mandi prices, and preliminary AI crop-health screening.

## Run locally

Use Python 3.11 or newer. From this directory:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

For a quick local start, use `DATABASE_URL=sqlite:///./smart_farming.db` in `.env`. Set a separate PostgreSQL URL if you want to run with PostgreSQL.

Set `SECRET_KEY` to a long random value before using accounts and keep it stable between restarts; changing it invalidates existing sign-in tokens. If it changes, users must sign in again. Optional integrations:

- `GROQ_API_KEY`: enables the authenticated crop explanation and image screening endpoints. Use a newly rotated key in `backend/.env`; never put it in frontend JavaScript or commit it.
- `GROQ_VISION_MODEL`: defaults to `qwen/qwen3.8-27b`, Groq's currently documented vision model with JSON mode.
- `GROQ_TIMEOUT_SECONDS`: image-analysis request timeout; defaults to 45 seconds.
- `AGMARKNET_API_URL` and `AGMARKNET_API_KEY`: a data.gov.in Agmarknet resource URL and access key. The service returns a clear status when these are absent or unavailable.
- `OPEN_METEO_BASE_URL`: defaults to Open-Meteo's forecast API and requires no key for this use.

The app always reads `backend/.env` relative to its source files, even if the shell starts in another folder. After changing `.env`, restart the backend so settings reload. Start the API from `backend/`:

```powershell
uvicorn app.main:app --reload
```

API documentation is at `http://127.0.0.1:8000/docs`; health is at `http://127.0.0.1:8000/api/v1/health`.

Database tables are created at startup for local development. The repository also includes an Alembic baseline. From `backend/`, apply versioned migrations with `alembic upgrade head`; create later revisions with `alembic revision --autogenerate -m "describe change"`, review the generated migration, then apply it with `alembic upgrade head`. Do not use automatic `create_all` as a production migration strategy.

Run the included calculation and API checks with:

```powershell
pip install -r requirements-dev.txt
pytest
```

## Example requests

Register, then send the returned bearer token on farm, crop, and disease endpoints:

```http
POST /api/v1/auth/register
Content-Type: application/json

{"name":"Asha Verma","email":"asha@example.com","password":"choose-a-long-password"}
```

```http
POST /api/v1/farms
Authorization: Bearer <access_token>
Content-Type: application/json

{"name":"North field","state":"Uttar Pradesh","district":"Lucknow","area_acres":2.5,"soil_type":"alluvial","soil_ph":6.5,"irrigation":"canal","latitude":26.85,"longitude":80.95}
```

```http
POST /api/v1/crops/recommend
Authorization: Bearer <access_token>
Content-Type: application/json

{"state":"Uttar Pradesh","district":"Lucknow","area_acres":2.5,"season":"rabi","soil_type":"alluvial","soil_ph":6.5,"irrigation":"canal","latitude":26.85,"longitude":80.95}
```

For other endpoint request and response schemas, use the generated OpenAPI page at `/docs`.

## Current boundaries

- Crop recommendations are an explicitly labeled, transparent screening heuristic over a small starter crop catalog. Regional crop-calendar validation and soil test data are needed for operational recommendations.
- Crop costs and returns stay blank in rankings. The profit endpoint calculates only when the caller provides yield, price, and cost assumptions; it labels the result as an estimate.
- Weather uses live Open-Meteo forecast responses when reachable. A 7-day forecast is not used as a seasonal outlook.
- Market endpoints return records only from a configured authorized Agmarknet/data.gov.in resource. Trend calculations need dated source records.
- Disease uploads are validated and sent to Groq's vision API when configured. The response is a preliminary visual screen with cautious next steps, not a confirmed diagnosis. The photo is not saved by this app, but it is sent to Groq for analysis.
- Do not treat model suggestions as pesticide prescriptions. Confirm uncertain or spreading symptoms with a local agriculture officer, and follow crop-approved product labels.
- Registration/login and farm APIs are implemented. Access tokens are signed with `SECRET_KEY`; use HTTPS and managed secrets when deployed.
