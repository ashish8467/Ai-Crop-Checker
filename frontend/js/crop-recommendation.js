const escapeCropText = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const cropForm = document.getElementById("crop-form");
document.addEventListener("DOMContentLoaded", () => {
  const farm = JSON.parse(localStorage.getItem("kisan_active_farm") || "null");
  if (!farm || !cropForm) return;
  for (const key of ["state", "district", "area_acres", "soil_type", "soil_ph", "season", "nitrogen", "phosphorus", "potassium", "irrigation", "previous_crops", "latitude", "longitude"]) {
    if (farm[key] != null && cropForm.elements[key]) cropForm.elements[key].value = farm[key];
  }
});
cropForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = cropForm.querySelector("button[type=submit]");
  const output = document.getElementById("crop-results");
  button.disabled = true;
  button.textContent = "Checking farm details…";
  output.innerHTML = '<div class="loading-line"></div><p class="muted">Comparing season, soil, water and forecast.</p>';
  const values = Object.fromEntries(new FormData(cropForm).entries());
  for (const key of ["area_acres", "soil_ph", "latitude", "longitude", "nitrogen", "phosphorus", "potassium", "budget_inr"]) values[key] = values[key] === "" ? null : Number(values[key]);
  try {
    const farm = JSON.parse(localStorage.getItem("kisan_active_farm") || "null");
    if (farm) values.farm_id = farm.id;
    const result = await API.request("/crops/recommend", { method: "POST", body: JSON.stringify(values) });
    output.innerHTML = `<div class="result-heading"><div><span class="eyebrow">${result.status === "provisional" ? "PROVISIONAL SCREENING" : "FARM SCREENING"}</span><h2>Suitable crops to explore</h2></div><span class="method-pill">Rule based</span></div><p class="muted">${escapeCropText(result.method)}</p>${result.missing_inputs.length ? `<div class="notice">To improve this screening, add: ${result.missing_inputs.map(escapeCropText).join(", ")}.</div>` : ""}<div class="crop-results-grid">${result.recommendations.map((item, index) => `<article class="crop-result-card"><div class="crop-result-top"><span class="rank">0${index + 1}</span><span class="score">${item.suitability_score}<small>/100</small></span></div><h3>${escapeCropText(item.crop)}</h3><p class="muted">${item.duration_days} days · ${escapeCropText(item.water_need)} water need</p><h4>Why it appears here</h4><ul>${item.reasons.map((reason) => `<li>${escapeCropText(reason)}</li>`).join("")}</ul>${item.risks.length ? `<h4>Check before sowing</h4><ul class="risk-list">${item.risks.map((risk) => `<li>${escapeCropText(risk)}</li>`).join("")}</ul>` : ""}<div class="economics-unavailable">Cost and return not estimated · market source not connected</div></article>`).join("")}</div><div class="assistant-explain"><button class="secondary-button" id="explain-crops" type="button">Explain shortlist with Groq</button><span id="explain-status" class="fine-print">Optional · requires a server-side Groq key</span></div><p class="fine-print">${escapeCropText(result.data_note)}</p>`;
    document.getElementById("explain-crops").addEventListener("click", async (clickEvent) => {
      const button = clickEvent.currentTarget;
      const status = document.getElementById("explain-status");
      button.disabled = true; status.textContent = "Preparing explanation…";
      try {
        const explanation = await API.request("/crops/explain", { method: "POST", body: JSON.stringify({ recommendations: result.recommendations }) });
        status.textContent = explanation.explanation;
      } catch (error) { status.textContent = error.message; }
      finally { button.disabled = false; }
    });
  } catch (error) { output.innerHTML = `<div class="notice notice-error">${escapeCropText(error.message)} <a href="farm-profile.html">Sign in or add farm details</a></div>`; }
  finally { button.disabled = false; button.textContent = "Find suitable crops"; }
});
