def estimate_profit(area_acres: float, yield_per_acre: float, price_per_quintal: float, cost_per_acre: float) -> dict:
    production_quintals = area_acres * yield_per_acre
    gross_revenue = production_quintals * price_per_quintal
    total_cost = area_acres * cost_per_acre
    return {
        "production_quintals": round(production_quintals, 2),
        "gross_revenue_inr": round(gross_revenue, 2),
        "total_cost_inr": round(total_cost, 2),
        "net_return_inr": round(gross_revenue - total_cost, 2),
        "estimate_basis": "User-provided yield, market price, and cost assumptions; not a market quote.",
    }
