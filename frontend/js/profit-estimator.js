document.addEventListener("DOMContentLoaded", () => {
  const results = document.getElementById("crop-results");
  if (!results) return;
  const section = document.createElement("section");
  section.className = "panel profit-panel";
  section.innerHTML = `<div class="form-intro"><span class="panel-icon market-icon">₹</span><div><h2>Estimate using your own assumptions</h2><p>Enter expected yield, a current sale price and total growing costs. This is arithmetic from your inputs, not a price forecast.</p></div></div><form id="profit-form" class="profit-form"><label class="field"><span>Crop</span><input name="crop" required placeholder="e.g. wheat"></label><label class="field"><span>Land area (acres)</span><input name="area_acres" required type="number" min="0.1" step="0.1" placeholder="2"></label><label class="field"><span>Expected yield per acre (quintals)</span><input name="expected_yield_per_acre" required type="number" min="0.1" step="0.1"></label><label class="field"><span>Sale price (₹ / quintal)</span><input name="price_per_quintal" required type="number" min="1" step="1"></label><label class="field"><span>Growing cost (₹ / acre)</span><input name="cost_per_acre" required type="number" min="0" step="100"></label><button class="primary-button" type="submit">Calculate estimate</button></form><div id="profit-result" class="profit-result" aria-live="polite"></div>`;
  results.parentElement.insertAdjacentElement("afterend", section);
  const farm = JSON.parse(localStorage.getItem("kisan_active_farm") || "null");
  if (farm?.area_acres) section.querySelector('[name="area_acres"]').value = farm.area_acres;
  section.querySelector("#profit-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    for (const key of ["area_acres", "expected_yield_per_acre", "price_per_quintal", "cost_per_acre"]) payload[key] = Number(payload[key]);
    const output = section.querySelector("#profit-result");
    output.textContent = "Calculating…";
    try {
      const response = await API.request("/crops/profit-estimate", { method: "POST", body: JSON.stringify(payload) });
      const estimate = response.estimate;
      output.innerHTML = `<div class="profit-metrics"><div><span>Gross revenue</span><strong>₹${estimate.gross_revenue_inr.toLocaleString("en-IN")}</strong></div><div><span>Total cost</span><strong>₹${estimate.total_cost_inr.toLocaleString("en-IN")}</strong></div><div><span>Estimated net return</span><strong>₹${estimate.net_return_inr.toLocaleString("en-IN")}</strong></div></div><p class="fine-print">${estimate.estimate_basis} Actual outcomes depend on yield, quality, sale price and all farm costs.</p>`;
    } catch (error) { output.textContent = error.message; }
  });
});
