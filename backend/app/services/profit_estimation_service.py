from app.utils.calculations import estimate_profit


def calculate(area_acres: float, yield_per_acre: float | None, price_per_quintal: float | None,
              cost_per_acre: float | None) -> dict:
    missing = [name for name, value in (("expected_yield_per_acre", yield_per_acre),
                                         ("price_per_quintal", price_per_quintal),
                                         ("cost_per_acre", cost_per_acre)) if value is None]
    if missing:
        return {"status": "incomplete", "missing_inputs": missing, "estimate": None}
    return {"status": "estimated", "missing_inputs": [],
            "estimate": estimate_profit(area_acres, yield_per_acre, price_per_quintal, cost_per_acre)}
