const wordsDisplay = document.getElementById('words-display');
const textInput = document.getElementById('text-input');
const timerElement = document.getElementById('timer');
const wordsContainer = document.getElementById('words-container');
const timeButtons = document.querySelectorAll('.time-btn');
// CHANGED: Select buttons by their new IDs
const includeNumbersBtn = document.getElementById('include-numbers-btn');
const includePunctuationBtn = document.getElementById('include-punctuation-btn');
const resultsScreen = document.getElementById('results-screen');
const wpmValue = document.getElementById('wpm-value');
const accuracyValue = document.getElementById('accuracy-value');
const rawWpmValue = document.getElementById('raw-wpm-value');
const restartBtn = document.getElementById('restart-btn');
const themeToggle = document.getElementById('theme-toggle');
const liveWpmElement = document.getElementById('live-wpm');
const liveAccuracyElement = document.getElementById('live-accuracy');

// --- Configuration and State Variables ---
const baseWordList = [
    "the", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog",
    "apple", "banana", "orange", "grape", "kiwi", "melon", "peach", "plum",
    "keyboard", "mouse", "monitor", "speaker", "headphone", "microphone",
    "program", "code", "develop", "debug", "compile", "execute", "function",
    "variable", "array", "object", "string", "number", "boolean", "null",
    "undefined", "loop", "condition", "statement", "element", "attribute",
    "galaxy", "universe", "planet", "star", "rocket", "shuttle", "comet",
    "travel", "adventure", "explore", "journey", "destination", "voyage",
    "serene", "tranquil", "peaceful", "calm", "relax", "meditate", "breathe",
    "wisdom", "knowledge", "learn", "teach", "educate", "understand", "insight",
    "computer", "science", "algorithm", "data", "structure", "network", "internet",
    "website", "frontend", "backend", "database", "server", "client", "framework",
    "javascript", "html", "css", "python", "java", "ruby", "csharp", "php", "swift",
    "typescript", "react", "angular", "vue", "node", "express", "django", "rails",
    "spring", "flask", "laravel", "bootstrap", "tailwind", "material", "design",
    "responsive", "mobile", "desktop", "application", "software", "hardware", "firmware",
    "promise", "async", "await", "closure", "scope", "hosting", "inheritance", "polymorphism",
    "abstraction", "encapsulation", "interface", "class", "module", "package", "library",
    "framework", "component", "render", "state", "props", "lifecycle", "hook", "context",
    "reducer", "memo", "callback", "effect", "ref", "portal", "fragment", "suspense",
    "error", "boundary", "storybook", "webpack", "babel", "eslint", "prettier", "jest",
    "cypress", "selenium", "docker", "kubernetes", "cloud", "aws", "azure", "gcp",
    "serverless", "lambda", "api", "rest", "graphql", "websocket", "http", "https",
    "security", "authentication", "authorization", "encryption", "decryption", "hashing",
    "algorithm", "cryptography", "blockchain", "ethereum", "bitcoin", "nft", "smart", "contract"
];
const numbers = "0123456789";
const symbols = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";

let words = [];
let wordElements = [];
let currentWordIndex = 0;
let currentCharIndex = 0;
let timerId = null;
let timeLeft = 60;
let typingStarted = false;
let totalCorrectChars = 0;
let totalIncorrectChars = 0;
let rawCharsTyped = 0;
let startTime = 0;
let generatedWordCount = 0;

// NEW: Variables for Numbers/Punctuation state
let includeNumbers = false;
let includePunctuation = false;


// Get the computed line height from CSS variable for scrolling calculations
const lineHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--calculated-line-height'));

// --- Game Initialization & Reset ---

function initGame() {
    // Reset state
    currentWordIndex = 0;
    currentCharIndex = 0;
    typingStarted = false;
    totalCorrectChars = 0;
    totalIncorrectChars = 0;
    rawCharsTyped = 0;
    clearInterval(timerId);
    timerElement.textContent = timeLeft;
    liveWpmElement.textContent = 'WPM: 0';
    liveAccuracyElement.textContent = 'Acc: 0%';

    resultsScreen.classList.add('hidden');
    wordsContainer.style.display = 'block';
    textInput.style.display = 'block';
    textInput.disabled = false;
    textInput.value = '';

    generatedWordCount = 0;
    generateWords(true); // Generate new words (true for initial clear)
    textInput.focus();
    scrollWordsDisplay(true); // Reset scroll to top
}

// --- Word Generation ---

function getRandomWordBasedOnSettings() {
    const r = Math.random();
    if (includeNumbers && r < 0.1) { // 10% chance for a number
        return numbers[Math.floor(Math.random() * numbers.length)];
    }
    if (includePunctuation && r < 0.2) { // 20% chance for a symbol (if not a number)
        return symbols[Math.floor(Math.random() * symbols.length)];
    }
    return baseWordList[Math.floor(Math.random() * baseWordList.length)];
}

function generateWords(clearExisting = false) {
    if (clearExisting) {
        wordsDisplay.innerHTML = '';
        words = [];
        wordElements = [];
    }

    const wordsToGenerate = 50;
    for (let i = 0; i < wordsToGenerate; i++) {
        const word = getRandomWordBasedOnSettings(); // Use the new function
        words.push(word);

        const wordSpan = document.createElement('span');
        wordSpan.classList.add('word');
        word.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.classList.add('char');
            charSpan.textContent = char;
            wordSpan.appendChild(charSpan);
        });
        wordsDisplay.appendChild(wordSpan);
        wordElements.push(wordSpan);
    }
    generatedWordCount += wordsToGenerate;

    if (wordElements[currentWordIndex] && wordElements[currentWordIndex].children[currentCharIndex]) {
        wordElements[currentWordIndex].children[currentCharIndex].classList.add('current');
    }
}

// --- Live Stats Update ---
function updateLiveStats() {
    if (!typingStarted || rawCharsTyped === 0) { // Check rawCharsTyped instead of sum for accuracy
        liveWpmElement.textContent = 'WPM: 0';
        liveAccuracyElement.textContent = 'Acc: 0%';
        return;
    }

    const timeElapsed = (Date.now() - startTime) / 1000;
    if (timeElapsed === 0) return;

    const currentWPM = (totalCorrectChars / 5) / (timeElapsed / 60);
    let currentAccuracy = 0;
    if (rawCharsTyped > 0) {
        currentAccuracy = (totalCorrectChars / rawCharsTyped) * 100;
    }

    liveWpmElement.textContent = `WPM: ${Math.max(0, currentWPM).toFixed(0)}`;
    liveAccuracyElement.textContent = `Acc: ${Math.max(0, currentAccuracy).toFixed(0)}%`;
}

// --- Timer Logic ---

function startTimer() {
    startTime = Date.now();
    timerId = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const remainingTime = timeLeft - elapsedTime;
        timerElement.textContent = remainingTime > 0 ? remainingTime : 0;

        updateLiveStats();

        if (remainingTime <= 0) {
            clearInterval(timerId);
            endTest();
        }
    }, 1000);
}

// --- End Test Logic ---

function endTest() {
    textInput.disabled = true;
    textInput.value = '';
    typingStarted = false;
    clearInterval(timerId);

    wordsContainer.style.display = 'none';
    textInput.style.display = 'none';

    const finalTimeTaken = timeLeft;
    const grossWPM = (rawCharsTyped / 5) / (finalTimeTaken / 60);
    const netWPM = (totalCorrectChars / 5) / (finalTimeTaken / 60);

    let accuracy = 0;
    if (rawCharsTyped > 0) {
        accuracy = (totalCorrectChars / rawCharsTyped) * 100;
    }

    wpmValue.textContent = Math.max(0, netWPM).toFixed(0);
    accuracyValue.textContent = `${Math.max(0, accuracy).toFixed(0)}%`;
    rawWpmValue.textContent = Math.max(0, grossWPM).toFixed(0);

    resultsScreen.classList.remove('hidden');
}

// --- Scrolling Logic ---

function scrollWordsDisplay(reset = false) {
    if (reset) {
        wordsDisplay.style.transform = `translateY(0px)`;
        return;
    }

    if (currentWordIndex >= wordElements.length) return;

    const currentWordElement = wordElements[currentWordIndex];
    const wordTopRelativeToDisplay = currentWordElement.offsetTop;

    // Target the current line to be at the top of the container (0 lines offset)
    // Or, for a slightly more natural feel, the second line (1 line offset)
    const targetScrollPosition = lineHeight * 1; // Keep the current word's line roughly at the 2nd line

    const requiredTranslateY = -(wordTopRelativeToDisplay - targetScrollPosition);

    wordsDisplay.style.transform = `translateY(${requiredTranslateY}px)`;
}


// --- Event Handlers ---

function handleKeyDown(e) {
    if (textInput.disabled) return;

    if (!typingStarted && e.key.length === 1 && e.key !== ' ') {
        typingStarted = true;
        startTimer();
    }

    const currentWordElement = wordElements[currentWordIndex];
    const targetWord = words[currentWordIndex];

    if (e.key === ' ') {
        e.preventDefault();

        const typedValue = textInput.value;

        // Mark any untyped characters as incorrect on spacebar press
        for (let i = typedValue.length; i < targetWord.length; i++) {
            const charEl = currentWordElement.children[i];
            if (charEl) {
                if (!charEl.classList.contains('correct') && !charEl.classList.contains('incorrect')) {
                    charEl.classList.add('incorrect');
                    totalIncorrectChars++;
                }
            }
        }
        // Count extra characters typed beyond the word length as incorrect
        if (typedValue.length > targetWord.length) {
             totalIncorrectChars += (typedValue.length - targetWord.length);
        }

        currentWordElement.classList.add('typed'); // Apply 'typed' class for visual fading

        if (currentWordElement.children[currentCharIndex]) {
            currentWordElement.children[currentCharIndex].classList.remove('current');
        } else if (currentCharIndex > 0 && currentWordElement.children[currentCharIndex - 1]) {
            currentWordElement.children[currentCharIndex - 1].classList.remove('current');
        }

        currentWordIndex++;
        currentCharIndex = 0;
        textInput.value = '';

        if (currentWordIndex >= generatedWordCount - 20) {
            generateWords();
        }

        if (currentWordIndex < wordElements.length) {
            wordElements[currentWordIndex].children[0].classList.add('current');
            scrollWordsDisplay();
        } else {
            endTest();
        }
    } else if (e.key === 'Backspace') {
        e.preventDefault();

        const typedText = textInput.value;

        if (currentCharIndex > 0) {
            const charEl = currentWordElement.children[currentCharIndex - 1];
            charEl.classList.remove('current', 'correct', 'incorrect', 'extra');
            
            currentCharIndex--;
            textInput.value = typedText.substring(0, typedText.length - 1);
            charEl.classList.add('current');
            currentWordElement.classList.remove('typed');
            rawCharsTyped = Math.max(0, rawCharsTyped - 1); // Decrement raw typed count
            // Recalculate correct/incorrect chars based on current textInput content (simplification)
            recalculateCharStatesAndCounts();
            
        } else if (currentWordIndex > 0) {
            if (currentWordElement.children[0]) {
                currentWordElement.children[0].classList.remove('current');
            }
            currentWordIndex--;
            const prevWordElement = wordElements[currentWordIndex];
            const prevWord = words[currentWordIndex];
            currentCharIndex = prevWord.length;

            prevWordElement.classList.remove('typed');
            for (let i = 0; i < prevWord.length; i++) {
                prevWordElement.children[i].classList.remove('correct', 'incorrect', 'extra');
                prevWordElement.children[i].classList.add('current');
            }
            if (prevWordElement.children[prevWord.length - 1]) {
                prevWordElement.children[prevWord.length - 1].classList.add('current');
            }
            textInput.value = prevWord;
            scrollWordsDisplay();
            // Recalculate for the word we backed into
            recalculateCharStatesAndCounts();
        }
        updateLiveStats();
    } else if (e.key.length > 1 && e.key !== 'Enter' && e.key !== 'Tab' && e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Meta') {
        e.preventDefault();
    }
}

function handleInput(e) {
    if (textInput.disabled) return;

    if (e.inputType === 'deleteContentBackward') {
        return;
    }

    const currentWordElement = wordElements[currentWordIndex];
    const targetWord = words[currentWordIndex];
    const typedValue = textInput.value;
    rawCharsTyped++;

    if (typedValue.length < currentCharIndex) {
        return;
    }

    // Remove 'current' class from the character that *was* current (if any)
    if (currentWordElement.children[currentCharIndex] && currentCharIndex > 0) {
        currentWordElement.children[currentCharIndex].classList.remove('current');
    } else if (currentCharIndex > 0 && currentWordElement.children[currentCharIndex - 1]) {
        currentWordElement.children[currentCharIndex - 1].classList.remove('current');
    }

    if (typedValue.length > targetWord.length) {
        if (targetWord.length > 0 && currentWordElement.children[targetWord.length - 1]) {
            const lastCharOfWord = currentWordElement.children[targetWord.length - 1];
            if (!lastCharOfWord.classList.contains('incorrect')) {
                lastCharOfWord.classList.add('incorrect', 'extra');
            }
        }
        totalIncorrectChars++;
        updateLiveStats();
        return;
    }

    if (currentCharIndex < targetWord.length) {
        const charEl = currentWordElement.children[currentCharIndex];
        const targetChar = targetWord[currentCharIndex];
        const typedChar = typedValue[typedValue.length - 1];

        if (!typedChar) return;

        if (typedChar === targetChar) {
            charEl.classList.remove('current', 'incorrect', 'extra');
            charEl.classList.add('correct');
            totalCorrectChars++;
        } else {
            charEl.classList.remove('current', 'correct', 'extra');
            charEl.classList.add('incorrect');
            totalIncorrectChars++;
        }
        currentCharIndex++;

        if (currentCharIndex < targetWord.length) {
            charEl.classList.remove('current');
            currentWordElement.children[currentCharIndex].classList.add('current');
        } else {
            charEl.classList.remove('current');
        }
    }
    updateLiveStats();
}

// NEW: Helper to recalculate char states and counts on backspace/word-back
function recalculateCharStatesAndCounts() {
    totalCorrectChars = 0;
    totalIncorrectChars = 0;
    // Iterate through all typed words up to currentWordIndex
    for (let i = 0; i <= currentWordIndex; i++) {
        const wordEl = wordElements[i];
        const wordText = words[i];
        let currentTypedChars = (i === currentWordIndex) ? textInput.value.length : wordText.length;

        for (let j = 0; j < wordText.length; j++) {
            const charEl = wordEl.children[j];
            if (charEl.classList.contains('correct')) {
                totalCorrectChars++;
            } else if (charEl.classList.contains('incorrect')) {
                totalIncorrectChars++;
            }
        }
        // Account for extra characters if the word was fully typed (or partially typed on current word)
        if (i === currentWordIndex) {
            if (currentTypedChars > wordText.length) {
                 totalIncorrectChars += (currentTypedChars - wordText.length);
            }
        } else { // For previously completed words, assume correct completion if not marked incorrect
            // This simplification might need more robust tracking if skipping words is common.
            // For now, if a word was "typed" (marked as .typed), count its errors based on its elements.
            // A truly accurate approach needs to track errors per character.
            // For speedrun, we'll rely on the class lists for simplicity.
        }
    }
    // Update rawCharsTyped based on characters actually rendered as typed
    rawCharsTyped = totalCorrectChars + totalIncorrectChars;
}


// --- Settings Persistence ---
function saveSettings() {
    localStorage.setItem('selectedTime', timeLeft);
    localStorage.setItem('includeNumbers', includeNumbers); // Save boolean directly
    localStorage.setItem('includePunctuation', includePunctuation); // Save boolean directly
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
}

function loadSettings() {
    const savedTime = localStorage.getItem('selectedTime');
    if (savedTime) {
        timeLeft = parseInt(savedTime);
        timeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.time) === timeLeft) {
                btn.classList.add('active');
            }
        });
    }

    // NEW: Load boolean values for numbers/punctuation
    const savedNumbers = localStorage.getItem('includeNumbers');
    if (savedNumbers !== null) { // Check for null as 'false' string is truthy
        includeNumbers = (savedNumbers === 'true');
        if (includeNumbers) {
            includeNumbersBtn.classList.add('active');
        } else {
            includeNumbersBtn.classList.remove('active');
        }
    }

    const savedPunctuation = localStorage.getItem('includePunctuation');
    if (savedPunctuation !== null) {
        includePunctuation = (savedPunctuation === 'true');
        if (includePunctuation) {
            includePunctuationBtn.classList.add('active');
        } else {
            includePunctuationBtn.classList.remove('active');
        }
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        themeToggle.checked = true;
    } else {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        themeToggle.checked = false;
    }
}


// --- Event Listeners Setup ---

function setupEventListeners() {
    textInput.addEventListener('keydown', handleKeyDown);
    textInput.addEventListener('input', handleInput);

    timeButtons.forEach(button => {
        button.addEventListener('click', () => {
            timeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            timeLeft = parseInt(button.dataset.time);
            saveSettings();
            initGame();
        });
    });

    // NEW: Event listeners for the new type-buttons
    includeNumbersBtn.addEventListener('click', () => {
        includeNumbers = !includeNumbers; // Toggle the state
        includeNumbersBtn.classList.toggle('active', includeNumbers); // Toggle active class
        saveSettings();
        initGame();
    });

    includePunctuationBtn.addEventListener('click', () => {
        includePunctuation = !includePunctuation; // Toggle the state
        includePunctuationBtn.classList.toggle('active', includePunctuation); // Toggle active class
        saveSettings();
        initGame();
    });

    restartBtn.addEventListener('click', initGame);

    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('light-theme');
        document.body.classList.toggle('dark-theme');
        saveSettings();
    });
}

// --- Initial Game Setup ---
loadSettings();
setupEventListeners();
initGame();