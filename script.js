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

const typingBox = document.getElementById("typing-box");
const input = document.getElementById("hidden-input");
const restartBtn = document.getElementById("restart-btn");

let words = [];
let currentWordIndex = 0;
let currentCharIndex = 0;
let started = false;

const WORDS = [
  "code", "fast", "keyboard", "speed", "swift", "type", "clone", "project", "focus", "break", "build", "flow", "beast", "track", "create", "logic", "grind", "dream", "execute"
];

// Init run
generateWords(30);
input.focus();

// Focus on click
typingBox.addEventListener("click", () => input.focus());

restartBtn.addEventListener("click", () => {
  resetTest();
});

function generateWords(count) {
  typingBox.innerHTML = '';
  words = [];
  for (let i = 0; i < count; i++) {
    const wordText = WORDS[Math.floor(Math.random() * WORDS.length)];
    const wordSpan = document.createElement("span");
    wordSpan.className = "word";

    [...wordText].forEach(char => {
      const charSpan = document.createElement("span");
      charSpan.className = "char";
      charSpan.innerText = char;
      wordSpan.appendChild(charSpan);
    });

    typingBox.appendChild(wordSpan);
    words.push(wordSpan);
  }
  highlightActiveWord();
}

function highlightActiveWord() {
  words.forEach((w, i) => {
    w.classList.toggle("active-word", i === currentWordIndex);
  });
}

input.addEventListener("input", () => {
  if (!started) started = true;

  const wordSpan = words[currentWordIndex];
  const charSpans = wordSpan.querySelectorAll(".char");
  const typed = input.value;

  for (let i = 0; i < charSpans.length; i++) {
    const char = typed[i];
    if (char == null) {
      charSpans[i].classList.remove("correct", "incorrect");
    } else if (char === charSpans[i].innerText) {
      charSpans[i].classList.add("correct");
      charSpans[i].classList.remove("incorrect");
    } else {
      charSpans[i].classList.add("incorrect");
      charSpans[i].classList.remove("correct");
    }
  }

  if (typed.endsWith(" ")) {
    moveToNextWord();
  }
});

function moveToNextWord() {
  input.value = '';
  currentWordIndex++;
  currentCharIndex = 0;
  if (currentWordIndex >= words.length) {
    // End reached
    input.disabled = true;
  } else {
    highlightActiveWord();
  }
}

function resetTest() {
  currentWordIndex = 0;
  currentCharIndex = 0;
  started = false;
  input.disabled = false;
  input.value = '';
  generateWords(30);
  input.focus();
}
