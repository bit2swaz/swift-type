const themeBtn = document.getElementById("theme-toggle-btn");
const themeIcon = document.getElementById("theme-icon");
const body = document.body;

themeBtn.addEventListener("click", () => {
  body.classList.toggle("dark");

  const isDark = body.classList.contains("dark");
  themeIcon.textContent = isDark ? "🌙" : "🌞";
});
