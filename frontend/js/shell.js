document.addEventListener("DOMContentLoaded", () => {
  const content = document.querySelector("[data-page-content]");
  const page = document.body.dataset.page || "dashboard";
  if (!content) return;
  const root = page === "dashboard" ? "" : "../";
  const entries = [
    ["dashboard", "◫", "Dashboard", `${root}index.html`],
    ["crops", "✳", "Crop planner", `${root}pages/crop-recommendation.html`],
    ["disease", "⌕", "Disease check", `${root}pages/disease-detection.html`],
    ["weather", "☼", "Weather", `${root}pages/weather.html`],
    ["market", "₹", "Mandi prices", `${root}pages/market-analysis.html`],
  ];
  const nav = entries.map(([key, icon, label, href]) => `<a class="nav-item ${page === key ? "active" : ""}" href="${href}"><span class="nav-icon">${icon}</span><span data-i18n="${key}">${label}</span></a>`).join("");
  const topLabel = page === "dashboard" ? "Dashboard" : entries.find(([key]) => key === page)?.[2] || "My farm";
  const shell = document.createElement("div");
  shell.className = "app-shell";
  shell.innerHTML = `<aside class="sidebar"><a class="brand" href="${root}index.html"><span class="brand-mark">क</span><span><strong>Kisan Saathi</strong><small>SMART FARMING</small></span></a><div class="nav-label">WORKSPACE</div><nav class="main-nav" aria-label="Main navigation">${nav}</nav><div class="sidebar-bottom"><div class="help-card"><span class="help-spark">✦</span><strong>Grow with clarity</strong><p>Bring your farm details together to plan the next season.</p><a href="${root}pages/farm-profile.html">Set up your farm <span>→</span></a></div><a class="profile-link" href="${root}pages/farm-profile.html"><span class="avatar">KS</span><span><strong>Farmer profile</strong><small data-i18n="farm">My farm</small></span><span class="more">···</span></a></div></aside><main class="main-content"><header class="topbar"><div class="breadcrumb">Your workspace <span>/</span> <strong data-i18n="${page}">${topLabel}</strong></div><div class="topbar-actions"><button class="language-button" data-language-toggle>हिंदी</button><a class="top-profile" href="${root}pages/farm-profile.html"><span class="online-dot"></span><span id="top-user">My farm</span></a></div></header><div class="page-content-host"></div></main>`;
  shell.querySelector(".page-content-host").append(content);
  document.body.replaceChildren(shell);
  const topUser = document.getElementById("top-user");
  window.addEventListener("kisan-session-changed", (event) => {
    if (topUser) topUser.textContent = event.detail?.name || "My farm";
  });
  window.addEventListener("kisan-session-expired", () => {
    const host = shell.querySelector(".page-content-host");
    if (!host || host.querySelector(".session-expired-notice")) return;
    const notice = document.createElement("section");
    notice.className = "session-expired-notice";
    notice.style.cssText = "display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin:14px 24px;padding:12px 16px;border:1px solid #eed8ae;border-radius:10px;background:#fffaf0;color:#725c36;font-size:11px;line-height:1.5";
    const message = document.createElement("p");
    message.textContent = "Your sign-in session expired or became invalid. Sign in again to continue. / आपका सत्र समाप्त हो गया है। आगे जारी रखने के लिए फिर से साइन इन करें।";
    message.style.margin = "0";
    const link = document.createElement("a");
    const signIn = new URL(`${root}pages/farm-profile.html`, window.location.href);
    signIn.searchParams.set("return", `${window.location.pathname}${window.location.search}${window.location.hash}`);
    signIn.hash = "login-form";
    link.href = signIn.href;
    link.textContent = "Sign in / फिर साइन इन करें";
    link.style.cssText = "color:#2d6d4d;font-weight:700;text-decoration:underline";
    notice.append(message, link);
    host.prepend(notice);
  });
  const user = window.Auth?.currentUser();
  if (user && topUser) topUser.textContent = user.name;
  window.applyLanguage?.(localStorage.getItem("kisan_language") || "en");
});
