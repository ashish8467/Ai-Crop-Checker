window.Auth = {
  currentUser() {
    if (!API.token()) {
      localStorage.removeItem("kisan_user");
      localStorage.removeItem("kisan_active_farm");
      return null;
    }
    try { return JSON.parse(localStorage.getItem("kisan_user") || "null"); }
    catch { return null; }
  },
  clearSession() {
    localStorage.removeItem("kisan_access_token");
    localStorage.removeItem("kisan_token_expires_at");
    localStorage.removeItem("kisan_user");
    localStorage.removeItem("kisan_active_farm");
    window.dispatchEvent(new CustomEvent("kisan-session-changed", { detail: null }));
  },
  signOut() {
    this.clearSession();
  },
  async register(payload) {
    const result = await API.signIn("/auth/register", payload);
    window.dispatchEvent(new CustomEvent("kisan-session-changed", { detail: result.user }));
    return result;
  },
  async login(payload) {
    const result = await API.signIn("/auth/login", payload);
    window.dispatchEvent(new CustomEvent("kisan-session-changed", { detail: result.user }));
    return result;
  },
};
