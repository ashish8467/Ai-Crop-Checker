const authMessage = document.getElementById("auth-message");
const farmMessage = document.getElementById("farm-message");
const escapeFarm = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
function returnAfterSignIn() {
  const returnTo = new URLSearchParams(window.location.search).get("return");
  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//")) return false;
  const target = new URL(returnTo, window.location.origin);
  if (target.origin !== window.location.origin) return false;
  window.location.replace(target.href);
  return true;
}
document.getElementById("register-form")?.addEventListener("submit", async (event) => {
  event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries());
  try { await Auth.register(values); if (returnAfterSignIn()) return; authMessage.textContent = `Welcome, ${values.name}. Your account is ready.`; document.getElementById("farm-panel").classList.remove("hidden"); }
  catch (error) { authMessage.textContent = error.message; }
});
document.getElementById("login-form")?.addEventListener("submit", async (event) => {
  event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries());
  try { const result = await Auth.login(values); if (returnAfterSignIn()) return; authMessage.textContent = `Signed in as ${result.user.name}.`; document.getElementById("farm-panel").classList.remove("hidden"); loadExistingFarm(); }
  catch (error) { authMessage.textContent = error.message; }
});
async function loadExistingFarm() {
  if (!API.token()) return;
  try { const farms = await API.request("/farms"); if (!farms.length) return; const farm = farms[0]; localStorage.setItem("kisan_active_farm", JSON.stringify(farm)); const form = document.getElementById("farm-form"); for (const [key, value] of Object.entries(farm)) if (form.elements[key]) form.elements[key].value = value ?? ""; farmMessage.textContent = "Farm details loaded. Edit and save to create another farm."; }
  catch (error) { farmMessage.textContent = error.message; }
}
document.getElementById("farm-form")?.addEventListener("submit", async (event) => {
  event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries());
  for (const key of ["area_acres", "latitude", "longitude", "soil_ph", "nitrogen", "phosphorus", "potassium", "budget_inr"]) values[key] = values[key] === "" ? null : Number(values[key]);
  try { const farm = await API.request("/farms", { method: "POST", body: JSON.stringify(values) }); localStorage.setItem("kisan_active_farm", JSON.stringify(farm)); farmMessage.textContent = "Farm profile saved."; }
  catch (error) { farmMessage.textContent = error.message; }
});
document.getElementById("signout-button")?.addEventListener("click", () => { Auth.signOut(); authMessage.textContent = "You are signed out."; document.getElementById("farm-panel").classList.add("hidden"); });
document.addEventListener("DOMContentLoaded", () => { if (API.token()) { document.getElementById("farm-panel")?.classList.remove("hidden"); loadExistingFarm(); } });
