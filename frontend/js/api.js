function readTokenExpiry(token) {
  try {
    let encoded = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    encoded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    return Number.isFinite(Number(payload.exp)) ? Number(payload.exp) * 1000 : null;
  } catch { return null; }
}

function clearInvalidSession() {
  if (window.Auth?.clearSession) window.Auth.clearSession();
  else {
    localStorage.removeItem("kisan_access_token");
    localStorage.removeItem("kisan_token_expires_at");
    localStorage.removeItem("kisan_user");
    localStorage.removeItem("kisan_active_farm");
    window.dispatchEvent(new CustomEvent("kisan-session-changed", { detail: null }));
  }
  window.dispatchEvent(new CustomEvent("kisan-session-expired"));
}

const API = {
  token() {
    const token = localStorage.getItem("kisan_access_token");
    if (!token) return null;
    const claimExpiry = readTokenExpiry(token);
    const storedExpiryValue = localStorage.getItem("kisan_token_expires_at");
    const storedExpiry = storedExpiryValue ? Number(storedExpiryValue) : null;
    const expiresAt = claimExpiry ?? (Number.isFinite(storedExpiry) ? storedExpiry : null);
    if (expiresAt !== null && expiresAt <= Date.now() + 5000) {
      clearInvalidSession();
      return null;
    }
    if (expiresAt !== null) localStorage.setItem("kisan_token_expires_at", String(expiresAt));
    return token;
  },
  async request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    const authRequest = path.startsWith("/auth/");
    const token = authRequest ? null : API.token();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    else headers.delete("Authorization");
    if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
    let response;
    try {
      response = await fetch(`${window.API_BASE_URL}${path}`, { ...options, headers });
    } catch {
      throw new Error("Can't reach the farming service. Start the backend and try again.");
    }
    const body = await response.json().catch(() => ({}));
    if (response.status === 401 && !authRequest) {
      clearInvalidSession();
      const error = new Error("Your sign-in session expired or became invalid. Sign in again to continue.");
      error.code = "AUTH_REQUIRED";
      error.status = 401;
      throw error;
    }
    if (!response.ok) throw new Error(body.detail || body.message || `Request failed (${response.status}).`);
    return body;
  },
  async signIn(path, payload) {
    const result = await API.request(path, { method: "POST", body: JSON.stringify(payload) });
    let previousUser = null;
    try { previousUser = JSON.parse(localStorage.getItem("kisan_user") || "null"); } catch { /* discard malformed cached profile */ }
    if (previousUser?.id !== result.user.id) localStorage.removeItem("kisan_active_farm");
    localStorage.setItem("kisan_access_token", result.access_token);
    const expiresAt = readTokenExpiry(result.access_token);
    if (expiresAt) localStorage.setItem("kisan_token_expires_at", String(expiresAt));
    else localStorage.removeItem("kisan_token_expires_at");
    localStorage.setItem("kisan_user", JSON.stringify(result.user));
    return result;
  },
};
window.API = API;
