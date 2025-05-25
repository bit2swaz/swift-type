const display = document.getElementById("text-display");
const input = document.getElementById("hidden-input");
const restartBtn = document.getElementById("restart-btn");

const modeTimeBtn = document.getElementById("mode-time");
const modeWordsBtn = document.getElementById("mode-words");

const timeBtns = document.querySelectorAll(".time-btn");
const wordBtns = document.querySelectorAll(".word-btn");

const numbersBtn = document.getElementById("numbers-btn");
const punctuationBtn = document.getElementById("punctuation-btn");

let isTimeMode = true;
let currentIndex = 0;
let wordElements = [];
let timeLimit = 30;
let wordLimit = 50;
let timerStarted = false;
let timer;
let timeLeft = timeLimit;
let useNumbers = false;
let usePunctuation = false;

const baseWords = "the quick brown fox jumps over the lazy dog never give up keep grinding work in silence win loud focus master discipline energy momentum freedom impact clarity".split(" ");
const numberWords = "123 456 789 10 20 30 99 007 1000".split(" ");
const punctuationWords = "hello. what's up? fine! wait, really: yes; okay... done!".split(" ");

function getWords() {
  let words = [...baseWords];
  if (useNumbers) words = words.concat(numberWords);
  if (usePunctuation) words = words.concat(punctuationWords);
  words.sort(() => Math.random() - 0.5);
  return isTimeMode ? words.slice(0, 100) : words.slice(0, wordLimit);
}

function loadWords() {
  display.innerHTML = "";
  const words = getWords();
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
  const currentWord = wordElements[currentIndex]?.textContent || "";
  const typed = input.value.trimEnd();

  if (e.inputType === "insertText" && e.data === " ") {
    if (typed === currentWord) {
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

    if (!isTimeMode && currentIndex >= wordLimit) {
      endTest();
    }

  } else {
    if (typed.length > currentWord.length) {
      wordElements[currentIndex]?.classList.add("extra");
    }
  }
}

function endTest() {
  clearInterval(timer);
  input.disabled = true;
  input.blur();
}

function resetTest() {
  clearInterval(timer);
  timerStarted = false;
  timeLeft = timeLimit;
  currentIndex = 0;
  input.value = "";
  input.disabled = false;
  input.focus();
  loadWords();
}

// Button Interactions
function updateMode(mode) {
  isTimeMode = mode === "time";
  modeTimeBtn.classList.toggle("active", isTimeMode);
  modeWordsBtn.classList.toggle("active", !isTimeMode);

  timeBtns.forEach(btn => btn.classList.toggle("hidden", !isTimeMode));
  wordBtns.forEach(btn => btn.classList.toggle("hidden", isTimeMode));
  resetTest();
}

modeTimeBtn.addEventListener("click", () => updateMode("time"));
modeWordsBtn.addEventListener("click", () => updateMode("words"));

timeBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    timeBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    timeLimit = parseInt(btn.dataset.time);
    timeLeft = timeLimit;
    resetTest();
  });
});

wordBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    wordBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    wordLimit = parseInt(btn.dataset.count);
    resetTest();
  });
});

numbersBtn.addEventListener("click", () => {
  useNumbers = !useNumbers;
  numbersBtn.classList.toggle("active");
  resetTest();
});

punctuationBtn.addEventListener("click", () => {
  usePunctuation = !usePunctuation;
  punctuationBtn.classList.toggle("active");
  resetTest();
});

restartBtn.addEventListener("click", resetTest);
input.addEventListener("input", handleTyping);

// INIT
loadWords();
input.focus();
