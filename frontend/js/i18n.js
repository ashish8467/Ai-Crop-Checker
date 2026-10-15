const copy = {
  en: { dashboard: "Dashboard", disease: "Disease check", crops: "Crop planner", weather: "Weather", market: "Mandi prices", farm: "My farm", signIn: "Sign in", signOut: "Sign out", language: "हिंदी", greeting: "Plan your next season with confidence", subtitle: "Your farm details, local weather and crop planning in one place.", myFarm: "My farm", farmArea: "Land area", forecast: "7-day forecast", cropPlan: "Crop planning", diseaseCheck: "Crop health check", marketPrices: "Market prices", noFarm: "Add your farm profile to see your farm summary.", noData: "No live data is available yet.", open: "Open", saveFarm: "Save farm details", state: "State", district: "District", area: "Farm area (acres)", soil: "Soil type", soilPh: "Soil pH", irrigation: "Water access", season: "Season", recommend: "Find suitable crops", recentPrices: "Recent mandi prices", sourceNote: "Data appears only when a live source is configured.", upload: "Choose a leaf photo", analyze: "Check image", credentials: "Create an account or sign in", name: "Full name", email: "Email", password: "Password", createAccount: "Create account", signInButton: "Sign in", location: "Farm coordinates", latitude: "Latitude", longitude: "Longitude", getForecast: "Get forecast", crop: "Crop", filter: "Search prices", error: "Something went wrong" },
  hi: { dashboard: "डैशबोर्ड", disease: "रोग जाँच", crops: "फसल योजना", weather: "मौसम", market: "मंडी भाव", farm: "मेरा खेत", signIn: "साइन इन", signOut: "साइन आउट", language: "English", greeting: "अगले मौसम की योजना आत्मविश्वास से बनाएँ", subtitle: "आपके खेत की जानकारी, स्थानीय मौसम और फसल योजना एक जगह।", myFarm: "मेरा खेत", farmArea: "भूमि क्षेत्र", forecast: "7 दिन का पूर्वानुमान", cropPlan: "फसल योजना", diseaseCheck: "फसल स्वास्थ्य जाँच", marketPrices: "मंडी भाव", noFarm: "अपने खेत की जानकारी देखने के लिए प्रोफ़ाइल जोड़ें।", noData: "अभी लाइव डेटा उपलब्ध नहीं है।", open: "खोलें", saveFarm: "खेत की जानकारी सहेजें", state: "राज्य", district: "ज़िला", area: "खेत का क्षेत्र (एकड़)", soil: "मिट्टी का प्रकार", soilPh: "मिट्टी का pH", irrigation: "सिंचाई सुविधा", season: "मौसम", recommend: "उपयुक्त फसलें देखें", recentPrices: "हाल के मंडी भाव", sourceNote: "लाइव स्रोत कॉन्फ़िगर होने पर ही डेटा दिखेगा।", upload: "पत्ते की तस्वीर चुनें", analyze: "तस्वीर जाँचें", credentials: "खाता बनाएँ या साइन इन करें", name: "पूरा नाम", email: "ईमेल", password: "पासवर्ड", createAccount: "खाता बनाएँ", signInButton: "साइन इन", location: "खेत के निर्देशांक", latitude: "अक्षांश", longitude: "देशांतर", getForecast: "पूर्वानुमान देखें", crop: "फसल", filter: "भाव खोजें", error: "कुछ गड़बड़ हुई" }
};
function applyLanguage(language) {
  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (copy[language][key]) element.textContent = copy[language][key];
  });
  localStorage.setItem("kisan_language", language);
  document.querySelectorAll("[data-language-toggle]").forEach((button) => button.textContent = copy[language].language);
}
document.addEventListener("DOMContentLoaded", () => {
  const initial = localStorage.getItem("kisan_language") || "en";
  applyLanguage(initial);
  document.querySelectorAll("[data-language-toggle]").forEach((button) => button.addEventListener("click", () => applyLanguage(document.documentElement.lang === "en" ? "hi" : "en")));
});
window.applyLanguage = applyLanguage;
