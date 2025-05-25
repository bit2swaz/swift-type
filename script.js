const display = document.getElementById("text-display");
const input = document.getElementById("hidden-input");
const restartBtn = document.getElementById("restart-btn");

let words = "the quick brown fox jumps over the lazy dog never give up keep grinding work in silence win loud".split(" ");
let wordElements = [];
let currentIndex = 0;
let timerStarted = false;
let timeLimit = 30; // default
let timer;
let timeLeft = timeLimit;

function loadWords() {
  display.innerHTML = "";
  wordElements = [];
  words.forEach((word, idx) => {
    const span = document.createElement("span");
    span.textContent = word;
    span.classList.add("word");
    if (idx === 0) span.classList.add("current");
    display.appendChild(span);
    wordElements.push(span);
  });
}

function startTimer() {
  if (timerStarted) return;
  timerStarted = true;
  timer = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) endTest();
  }, 1000);
}

function handleTyping(e) {
  startTimer();
  const currentWord = wordElements[currentIndex].textContent;
  const typed = input.value.trimEnd();

  if (e.inputType === "insertText" && e.data === " ") {
    if (typed === currentWord) {
      wordElements[currentIndex].classList.add("correct");
    } else if (typed.startsWith(currentWord)) {
      wordElements[currentIndex].classList.add("correct");
    } else {
      wordElements[currentIndex].classList.add("incorrect");
    }

    wordElements[currentIndex].classList.remove("current");
    currentIndex++;
    if (currentIndex < wordElements.length) {
      wordElements[currentIndex].classList.add("current");
    }
    input.value = "";
  } else {
    const wordSpan = wordElements[currentIndex];
    if (!wordSpan) return;
    if (typed.length > currentWord.length) {
      wordSpan.classList.add("extra");
    }
  }
}

function endTest() {
  clearInterval(timer);
  input.disabled = true;
  input.blur();
}

function resetTest() {
  currentIndex = 0;
  timerStarted = false;
  timeLeft = timeLimit;
  input.value = "";
  input.disabled = false;
  input.focus();
  loadWords();
}

restartBtn.addEventListener("click", resetTest);
input.addEventListener("input", handleTyping);

// Init
loadWords();
input.focus();
