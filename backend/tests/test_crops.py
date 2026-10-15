from app.schemas.crop import CropRecommendationRequest
from app.services.crop_recommendation_service import rank_crops
from app.utils.calculations import estimate_profit


def test_crop_screening_explains_missing_inputs_and_orders_recommendations():
    request = CropRecommendationRequest(
        state="Uttar Pradesh", district="Lucknow", area_acres=2,
        season="rabi", soil_type="alluvial", soil_ph=6.5, irrigation="canal",
    )
    result = rank_crops(request)

    assert result["status"] == "provisional"
    assert "weather_forecast" in result["missing_inputs"]
    assert result["recommendations"][0]["suitability_score"] >= result["recommendations"][1]["suitability_score"]
    assert all("reasons" in item and "risks" in item for item in result["recommendations"])
    assert all(item["estimated_return_inr"] is None for item in result["recommendations"])


def test_profit_calculation_uses_only_given_assumptions():
    estimate = estimate_profit(area_acres=2, yield_per_acre=18, price_per_quintal=2200, cost_per_acre=25000)

    assert estimate["production_quintals"] == 36
    assert estimate["gross_revenue_inr"] == 79200
    assert estimate["total_cost_inr"] == 50000
    assert estimate["net_return_inr"] == 29200
    assert "User-provided" in estimate["estimate_basis"]
