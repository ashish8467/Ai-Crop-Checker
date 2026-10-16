window.SMART_FARMING_CONFIG = window.SMART_FARMING_CONFIG || {};
const configuredApiBaseUrl = String(
  window.SMART_FARMING_CONFIG.apiBaseUrl || "https://ai-crop-checker.onrender.com",
).trim().replace(/\/+$/, "");

// The backend mounts all application routes beneath /api/v1. Accept either a
// Render origin or a complete API base URL in the Netlify runtime config.
window.API_BASE_URL = /\/api\/v1$/i.test(configuredApiBaseUrl)
  ? configuredApiBaseUrl
  : `${configuredApiBaseUrl}/api/v1`;
