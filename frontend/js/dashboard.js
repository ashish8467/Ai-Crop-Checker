const setText = (id, value) => { const node = document.getElementById(id); if (node) node.textContent = value; };
const escapeText = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

async function loadDashboard() {
  const user = window.Auth?.currentUser();
  setText("welcome-name", user?.name?.split(" ")[0] || "there");
  const farmsNode = document.getElementById("farm-summary");
  if (!API.token()) {
    farmsNode.innerHTML = '<p class="muted" data-i18n="noFarm">Sign in and add your farm profile to see a summary.</p><a class="text-link" href="pages/farm-profile.html">Add your farm →</a>';
    setText("farm-count", "—");
    return;
  }
  try {
    const farms = await API.request("/farms");
    setText("farm-count", String(farms.length));
    if (!farms.length) {
      farmsNode.innerHTML = '<p class="muted">Add your land details to get started.</p><a class="text-link" href="pages/farm-profile.html">Create a farm profile →</a>';
      return;
    }
    const farm = farms[0];
    localStorage.setItem("kisan_active_farm", JSON.stringify(farm));
    farmsNode.innerHTML = `<div class="farm-summary-main"><span class="farm-icon">⌂</span><div><strong>${escapeText(farm.name)}</strong><p>${escapeText(farm.village ? `${farm.village}, ` : "")}${escapeText(farm.district)}, ${escapeText(farm.state)}</p></div></div><div class="summary-stats"><div><span>Land</span><strong>${farm.area_acres} ac</strong></div><div><span>Soil</span><strong>${escapeText(farm.soil_type || "Not added")}</strong></div><div><span>Water</span><strong>${escapeText(farm.irrigation || "Not added")}</strong></div></div><a class="text-link" href="pages/farm-profile.html">View farm profile →</a>`;
    setText("area-value", `${farms.reduce((sum, item) => sum + Number(item.area_acres || 0), 0).toLocaleString()} ac`);
    if (farm.latitude != null && farm.longitude != null) {
      const weather = await API.request(`/weather/forecast?latitude=${farm.latitude}&longitude=${farm.longitude}`);
      const today = weather.data.current;
      setText("weather-value", `${Math.round(today.temperature_2m)}°`);
      setText("weather-note", `${today.relative_humidity_2m}% humidity · Open-Meteo`);
    } else setText("weather-note", "Add farm coordinates for local weather.");
  } catch (error) {
    farmsNode.innerHTML = `<p class="notice notice-error">${escapeText(error.message)}</p>`;
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const date = document.getElementById("today-date");
  if (date) date.textContent = new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date()).toUpperCase();
  loadDashboard();
});
