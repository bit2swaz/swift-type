// Theme already locked to dark mode, but keeping the icon toggle just for fun
const themeBtn = document.getElementById("theme-toggle-btn");
const themeIcon = document.getElementById("theme-icon");

themeBtn.addEventListener("click", () => {
  const icon = themeIcon.textContent;
  themeIcon.textContent = icon === "🌙" ? "🌞" : "🌙";
});
