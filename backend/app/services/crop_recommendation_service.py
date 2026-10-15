from app.schemas.crop import CropRecommendationRequest

# Broad screening ranges for an initial decision aid. This small catalog is not a
# substitute for state-specific crop calendars or advice from a local extension officer.
CROPS = [
    {"name": "Rice", "seasons": ["kharif"], "soils": ["clay", "loam", "alluvial"],
     "ph": (5.5, 7.0), "water": "high", "temp": (20, 35), "duration_days": 130},
    {"name": "Maize", "seasons": ["kharif", "rabi", "zaid"], "soils": ["loam", "alluvial", "black"],
     "ph": (5.5, 7.5), "water": "medium", "temp": (18, 32), "duration_days": 105},
    {"name": "Cotton", "seasons": ["kharif"], "soils": ["black", "loam"],
     "ph": (5.8, 8.0), "water": "medium", "temp": (21, 35), "duration_days": 165},
    {"name": "Chickpea", "seasons": ["rabi"], "soils": ["loam", "clay", "black"],
     "ph": (6.0, 8.0), "water": "low", "temp": (10, 30), "duration_days": 100},
    {"name": "Wheat", "seasons": ["rabi"], "soils": ["loam", "alluvial", "clay"],
     "ph": (6.0, 7.5), "water": "medium", "temp": (10, 25), "duration_days": 120},
]


def _water_fit(crop_water: str, irrigation: str | None) -> int:
    if not irrigation:
        return 0
    irrigation = irrigation.lower()
    if crop_water == "high":
        return 15 if irrigation in {"canal", "borewell", "drip", "reliable"} else -8
    if crop_water == "low":
        return 10 if irrigation in {"rainfed", "limited", "none"} else 5
    return 10 if irrigation in {"canal", "borewell", "drip", "reliable", "rainfed"} else 0


def rank_crops(request: CropRecommendationRequest, weather: dict | None = None) -> dict:
    season = request.season.lower()
    soil = (request.soil_type or "").lower()
    missing = []
    if not request.soil_type:
        missing.append("soil_type")
    if request.soil_ph is None:
        missing.append("soil_ph")
    if not request.irrigation:
        missing.append("irrigation")
    if not weather:
        missing.append("weather_forecast")

    current = weather.get("current", {}) if weather else {}
    temperature = current.get("temperature_2m")
    forecast_rain = weather.get("daily", {}).get("precipitation_sum", []) if weather else []
    weather_rain_mm = sum(value for value in forecast_rain if isinstance(value, (int, float)))

    ranked = []
    for crop in CROPS:
        score = 45
        reasons = []
        risks = []
        if season in crop["seasons"]:
            score += 20
            reasons.append(f"Listed as a {season} crop in the screening guide")
        else:
            score -= 20
            risks.append(f"{season.title()} is outside the listed seasons for this crop")
        if soil:
            if any(item in soil for item in crop["soils"]):
                score += 12
                reasons.append("Soil description matches the broad screening range")
            else:
                score -= 8
                risks.append("Reported soil type is not in this crop's broad screening range")
        if request.soil_ph is not None:
            low, high = crop["ph"]
            if low <= request.soil_ph <= high:
                score += 10
                reasons.append(f"Soil pH {request.soil_ph:g} is within the broad {low:g}–{high:g} screening range")
            else:
                score -= 12
                risks.append(f"Soil pH is outside the broad {low:g}–{high:g} screening range")
        score += _water_fit(crop["water"], request.irrigation)
        if request.irrigation:
            reasons.append(f"Water need is {crop['water']}; compare this with the farm's reported irrigation")
        if any(value is not None for value in (request.nitrogen, request.phosphorus, request.potassium)):
            reasons.append("Soil NPK readings were provided; a local soil-test recommendation is still needed for fertilizer planning")
        if request.previous_crops and crop["name"].lower() in request.previous_crops.lower():
            risks.append("This crop appears in the previous-crops list; check local rotation guidance before repeating it")
        if temperature is not None:
            low, high = crop["temp"]
            if low <= temperature <= high:
                score += 5
                reasons.append("Current temperature is within the broad screening range")
            else:
                score -= 5
                risks.append("Current temperature is outside the broad screening range")
            risks.append("Current conditions are a short-range weather check, not a seasonal climate assessment")
        if weather and len(forecast_rain) > 0:
            reasons.append(f"Open-Meteo 7-day precipitation total: {weather_rain_mm:.1f} mm")
        score = max(0, min(100, score))
        ranked.append({
            "crop": crop["name"], "suitability_score": score,
            "duration_days": crop["duration_days"], "water_need": crop["water"],
            "reasons": reasons, "risks": risks,
            "estimated_cost_inr": None, "estimated_return_inr": None,
            "market_data_status": "unavailable_until_source_is_configured",
        })
    ranked.sort(key=lambda item: item["suitability_score"], reverse=True)
    return {
        "status": "provisional" if missing else "screening_complete",
        "method": "Transparent rule-based screening; score is not a probability or validated yield forecast.",
        "location": {"state": request.state, "district": request.district},
        "season": season, "missing_inputs": missing,
        "data_note": "Confirm crop calendar and input needs with local agricultural extension guidance. "
                     "Costs and returns are omitted until supported by farm-specific or market data.",
        "recommendations": ranked,
    }
