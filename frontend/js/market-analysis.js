const marketForm = document.getElementById("market-form");
const safeMarket = (value) => String(value ?? "—").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
async function searchMarket() {
  const output = document.getElementById("market-results");
  output.innerHTML = '<div class="loading-line"></div><p class="muted">Looking for mandi records…</p>';
  const values = Object.fromEntries(new FormData(marketForm).entries());
  const params = new URLSearchParams(Object.entries(values).filter(([, value]) => value));
  try {
    const result = await API.request(`/market/prices?${params}`);
    if (!result.records?.length) {
      output.innerHTML = `<div class="empty-state"><div class="empty-symbol">₹</div><h2>No price records available</h2><p>${safeMarket(result.message || "The source returned no matching data.")}</p><p class="fine-print">Live mandi prices are shown only when an authorized Agmarknet data source is configured.</p></div>`;
      return;
    }
    const records = result.records;
    const keys = Object.keys(records[0]);
    output.innerHTML = `<div class="table-wrap"><table><thead><tr>${keys.map((key) => `<th>${safeMarket(key.replaceAll("_", " "))}</th>`).join("")}</tr></thead><tbody>${records.map((row) => `<tr>${keys.map((key) => `<td>${safeMarket(row[key])}</td>`).join("")}</tr>`).join("")}</tbody></table></div><p class="fine-print">Source: ${safeMarket(result.source)}. Prices and arrivals are source records, not forecasts.</p>`;
  } catch (error) { output.innerHTML = `<div class="notice notice-error">${safeMarket(error.message)}</div>`; }
}
marketForm?.addEventListener("submit", (event) => { event.preventDefault(); searchMarket(); });
document.addEventListener("DOMContentLoaded", searchMarket);
