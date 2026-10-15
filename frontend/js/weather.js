const weatherForm = document.getElementById("weather-form");
const safeWeather = (value) => String(value ?? "—").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
weatherForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const output = document.getElementById("weather-results");
  output.innerHTML = '<div class="loading-line"></div><p class="muted">Getting the forecast…</p>';
  const form = new FormData(weatherForm);
  try {
    const result = await API.request(`/weather/forecast?latitude=${Number(form.get("latitude"))}&longitude=${Number(form.get("longitude"))}`);
    const { current, daily } = result.data;
    output.innerHTML = `<div class="weather-current"><div><span class="eyebrow">CURRENT CONDITIONS</span><strong>${Math.round(current.temperature_2m)}°</strong><p>${current.relative_humidity_2m}% humidity · ${current.precipitation} mm precipitation</p></div><span class="source-pill">Source · Open-Meteo</span></div><div class="forecast-grid">${daily.time.map((day, index) => `<article><span>${new Date(`${day}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" })}</span><strong>${Math.round(daily.temperature_2m_max[index])}° / ${Math.round(daily.temperature_2m_min[index])}°</strong><small>${safeWeather(daily.precipitation_sum[index])} mm rain · ${safeWeather(daily.precipitation_probability_max[index])}% chance</small></article>`).join("")}</div><p class="fine-print">A 7-day weather forecast is not a seasonal outlook. Use local crop calendars and agricultural guidance for sowing decisions.</p>`;
  } catch (error) { output.innerHTML = `<div class="notice notice-error">${safeWeather(error.message)}</div>`; }
});
document.addEventListener("DOMContentLoaded", () => {
  const farm = JSON.parse(localStorage.getItem("kisan_active_farm") || "null");
  if (farm?.latitude != null) { weatherForm.elements.latitude.value = farm.latitude; weatherForm.elements.longitude.value = farm.longitude; }
});
