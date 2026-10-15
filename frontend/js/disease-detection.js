const diseaseInput = document.getElementById("leaf-image");
const preview = document.getElementById("image-preview");
const diseaseForm = document.getElementById("disease-form");
const safeDisease = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

diseaseInput?.addEventListener("change", () => {
  const file = diseaseInput.files[0];
  if (!file) { preview.classList.add("hidden"); return; }
  if (file.size > 5 * 1024 * 1024) {
    diseaseInput.value = "";
    preview.textContent = "Image must be under 5 MB.";
    preview.classList.remove("hidden");
    return;
  }
  if (preview.dataset.objectUrl) URL.revokeObjectURL(preview.dataset.objectUrl);
  const objectUrl = URL.createObjectURL(file);
  preview.dataset.objectUrl = objectUrl;
  preview.innerHTML = `<img alt="Leaf preview" src="${objectUrl}"><span>${safeDisease(file.name)}</span>`;
  preview.classList.remove("hidden");
});

function diseaseList(title, items) {
  if (!items?.length) return "";
  return `<section class="disease-report-section"><h3>${safeDisease(title)}</h3><ul>${items.map((item) => `<li>${safeDisease(item)}</li>`).join("")}</ul></section>`;
}

function renderDiseaseReport(report) {
  const hindi = document.getElementById("disease-language").value === "hi";
  const labels = hindi ? {
    complete: "प्रारंभिक दृश्य संकेत", uncertain: "अनिश्चित — अधिक जानकारी चाहिए", poor: "फोटो साफ़ नहीं है", notPlant: "फसल का पत्ता पहचान में नहीं आया",
    issue: "इस फोटो से एक कारण तय नहीं किया जा सकता।", other: "अन्य संभावित कारण:", crop: "फसल", confidence: "दृश्य मिलान का भरोसा", severity: "गंभीरता",
    visible: "फोटो में क्या दिख रहा है", today: "आज क्या करें", week: "अगले 7 दिनों की योजना", yield: "स्वस्थ पौधों और उपज की रक्षा", avoid: "इनसे बचें", expert: "स्थानीय कृषि विशेषज्ञ से संपर्क करें यदि", follow: "आगे के लिए उपयोगी जानकारी",
  } : {
    complete: "Preliminary visual match", uncertain: "Uncertain — more information needed", poor: "Photo needs improvement", notPlant: "No crop leaf recognized",
    issue: "No single cause can be identified from this photo.", other: "Other possible causes:", crop: "Crop", confidence: "Visual match confidence", severity: "severity",
    visible: "What is visible in the photo", today: "What to do today", week: "Plan for the next 7 days", yield: "Protect healthy growth and yield", avoid: "Avoid", expert: "Get local agriculture help if", follow: "Helpful follow-up details",
  };
  const status = {
    analysis_complete: labels.complete,
    uncertain: labels.uncertain,
    poor_image: labels.poor,
    not_a_plant: labels.notPlant,
  }[report.status] || labels.complete;
  const issue = report.likely_issue || labels.issue;
  const alternatives = report.possible_alternatives?.length
    ? `<p class="disease-alternatives"><strong>${safeDisease(labels.other)}</strong> ${report.possible_alternatives.map(safeDisease).join(" · ")}</p>` : "";
  return `<article class="disease-report">
    <div class="disease-report-head"><div><span class="source-pill">${safeDisease(status)}</span><h2>${safeDisease(issue)}</h2><p class="muted">${safeDisease(labels.crop)}: ${safeDisease(report.crop_name)} · ${safeDisease(labels.confidence)}: ${safeDisease(report.confidence_percent)}%</p></div><span class="disease-severity severity-${safeDisease(report.severity)}">${safeDisease(report.severity)} ${safeDisease(labels.severity)}</span></div>
    ${alternatives}
    ${diseaseList(labels.visible, report.observations)}
    ${diseaseList(labels.today, report.actions_today)}
    ${diseaseList(labels.week, report.plan_next_7_days)}
    ${diseaseList(labels.yield, report.protect_yield)}
    ${diseaseList(labels.avoid, report.avoid)}
    ${diseaseList(labels.expert, report.ask_local_expert_when)}
    ${diseaseList(labels.follow, report.follow_up_questions)}
    <p class="disease-disclaimer">${safeDisease(report.disclaimer)}</p>
  </article>`;
}

diseaseForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const output = document.getElementById("disease-result");
  const button = diseaseForm.querySelector("button[type=submit]");
  if (!diseaseInput.files[0]) return;
  button.disabled = true;
  output.innerHTML = '<div class="loading-line"></div><p class="muted">Checking the photo and preparing practical next steps…</p>';
  const data = new FormData();
  data.append("image", diseaseInput.files[0]);
  data.append("crop_name", document.getElementById("crop-name").value.trim());
  data.append("language", document.getElementById("disease-language").value);
  try {
    const report = await API.request("/disease/detect", { method: "POST", body: data });
    output.innerHTML = renderDiseaseReport(report);
  } catch (error) {
    if (error.code === "AUTH_REQUIRED") {
      const signIn = new URL("../pages/farm-profile.html", window.location.href);
      signIn.searchParams.set("return", `${window.location.pathname}${window.location.search}${window.location.hash}`);
      signIn.hash = "login-form";
      output.innerHTML = `<div class="notice"><strong>Sign in required</strong><p>Your session ended before the image could be checked. Sign in, return here, and upload the photo again.</p><a href="${safeDisease(signIn.href)}">Sign in / फिर साइन इन करें</a></div>`;
      return;
    }
    const setupMissing = error.message.toLowerCase().includes("groq_api_key") || error.message.toLowerCase().includes("not configured");
    output.innerHTML = `<div class="notice ${setupMissing ? "" : "notice-error"}"><strong>${setupMissing ? "Image analysis needs setup" : "Image check unavailable"}</strong><p>${safeDisease(error.message)}</p><p class="fine-print">No diagnosis was made. If the symptoms are spreading quickly, ask your local agriculture officer to inspect the crop.</p></div>`;
  } finally {
    button.disabled = false;
  }
});
