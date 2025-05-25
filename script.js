const toggleBtn = document.getElementById("toggle-btn");
const icon = document.getElementById("icon");
const body = document.body;

// Check saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  body.className = savedTheme;
  icon.textContent = savedTheme === "dark" ? "🌚" : "🌞";
}

toggleBtn.addEventListener("click", () => {
  const isDark = body.classList.contains("dark");
  body.className = isDark ? "light" : "dark";
  icon.textContent = isDark ? "🌞" : "🌚";
  localStorage.setItem("theme", isDark ? "light" : "dark");
});
