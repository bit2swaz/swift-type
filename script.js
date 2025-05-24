const wordsDisplay = document.getElementById('words-display');
const textInput = document.getElementById('text-input');
const timerElement = document.getElementById('timer');
const wordsContainer = document.getElementById('words-container');
const timeButtons = document.querySelectorAll('.time-btn');
const includeNumbersBtn = document.getElementById('include-numbers-btn');
const includePunctuationBtn = document.getElementById('include-punctuation-btn');
const resultsScreen = document.getElementById('results-screen'); // Make sure this is correctly linked to your HTML results-screen div
const wpmValue = document.getElementById('wpm-value');
const accuracyValue = document.getElementById('accuracy-value');
const rawWpmValue = document.getElementById('raw-wpm-value');
const restartBtn = document.getElementById('restart-btn');
const themeToggle = document.getElementById('theme-toggle');
const liveWpmElement = document.getElementById('live-wpm');
const liveAccuracyElement = document.getElementById('live-accuracy');
const caret = document.getElementById('caret');

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
let totalExtraChars = 0;
let rawCharsTyped = 0;
let startTime = 0;
let generatedWordCount = 0;

let includeNumbers = false;
let includePunctuation = false;


const lineHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--calculated-line-height'));

// --- Game Initialization & Reset ---

function initGame() {
    // Reset state
    currentWordIndex = 0;
    currentCharIndex = 0;
    typingStarted = false;
    totalCorrectChars = 0;
    totalIncorrectChars = 0;
    totalExtraChars = 0;
    rawCharsTyped = 0;
    clearInterval(timerId);
    timerElement.textContent = timeLeft;
    liveWpmElement.textContent = 'WPM: 0';
    liveAccuracyElement.textContent = 'Acc: 0%';

    resultsScreen.classList.add('hidden'); // Ensure it's hidden on init
    wordsContainer.style.display = 'block';
    textInput.style.display = 'block';
    textInput.disabled = false;
    textInput.value = '';

    generatedWordCount = 0;
    generateWords(true); // Generate new words (true for initial clear)
    textInput.focus();
    scrollWordsDisplay(true); // Reset scroll to top
    positionCaret(); // CRITICAL: Position caret on game start
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
        // CRITICAL FIX: Ensure caret is appended back to wordsDisplay if cleared
        wordsDisplay.appendChild(caret); // The caret needs to be in the DOM!
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

    // Initial highlight for the first word and caret placement
    if (currentWordIndex === 0 && wordElements[0]) {
        wordElements[0].classList.add('current-word-highlight');
        if (wordElements[0].children[0]) {
            wordElements[0].children[0].classList.add('current');
        }
    }
}

// --- Live Stats Update ---
function updateLiveStats() {
    if (!typingStarted && rawCharsTyped === 0) { // If not started and no chars typed, show 0
        liveWpmElement.textContent = 'WPM: 0';
        liveAccuracyElement.textContent = 'Acc: 0%';
        return;
    }
    if (!typingStarted && rawCharsTyped > 0) { // If started but timer hasn't begun (e.g., first char)
        // do nothing, wait for timer to start for WPM
    }


    const timeElapsed = (Date.now() - startTime) / 1000;
    // Only update WPM if time has elapsed
    const currentWPM = (timeElapsed > 0) ? (totalCorrectChars / 5) / (timeElapsed / 60) : 0;
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
    caret.style.display = 'none'; // Hide caret on test end

    // Remove current word highlight
    if (currentWordIndex < wordElements.length) {
        wordElements[currentWordIndex].classList.remove('current-word-highlight');
    }

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

    // CRITICAL FIX: Ensure accuracyDetailsContainer is properly appended *inside* resultsScreen
    let accuracyDetailsContainer = resultsScreen.querySelector('.accuracy-details');

    if (!accuracyDetailsContainer) { // Create if it doesn't exist
        accuracyDetailsContainer = document.createElement('div');
        accuracyDetailsContainer.className = 'accuracy-details';
        // Append it as a child of resultsScreen, perhaps after result-stats
        // This ensures it's always INSIDE the overlay
        resultsScreen.appendChild(accuracyDetailsContainer);
    } else {
        accuracyDetailsContainer.innerHTML = ''; // Clear previous content if it already existed
    }

    // Now populate the new container with the detail items
    const correctCharsResult = document.createElement('div');
    correctCharsResult.className = 'detail-item';
    correctCharsResult.innerHTML = `<span class="detail-label">Correct</span><span class="detail-value correct">${totalCorrectChars}</span>`;

    const incorrectCharsResult = document.createElement('div');
    incorrectCharsResult.className = 'detail-item';
    incorrectCharsResult.innerHTML = `<span class="detail-label">Incorrect</span><span class="detail-value incorrect">${totalIncorrectChars}</span>`;

    const extraCharsResult = document.createElement('div');
    extraCharsResult.className = 'detail-item';
    extraCharsResult.innerHTML = `<span class="detail-label">Extra</span><span class="detail-value extra">${totalExtraChars}</span>`;

    accuracyDetailsContainer.appendChild(correctCharsResult);
    accuracyDetailsContainer.appendChild(incorrectCharsResult);
    accuracyDetailsContainer.appendChild(extraCharsResult);

    // Final step: Make the results screen visible
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

    const targetScrollPosition = lineHeight * 1;

    const requiredTranslateY = -(wordTopRelativeToDisplay - targetScrollPosition);

    wordsDisplay.style.transform = `translateY(${requiredTranslateY}px)`;
}

// --- Caret Positioning ---

function positionCaret() {
    const currentWordElement = wordElements[currentWordIndex];
    if (!currentWordElement) {
        caret.style.display = 'none';
        return;
    }

    let targetElementForCaret;
    let caretLeftOffsetInWord = 0;

    if (currentCharIndex < currentWordElement.children.length) {
        targetElementForCaret = currentWordElement.children[currentCharIndex];
    } else {
        targetElementForCaret = currentWordElement.children[currentWordElement.children.length - 1];
    }

    if (targetElementForCaret) {
        const targetRect = targetElementForCaret.getBoundingClientRect();
        const currentWordRect = currentWordElement.getBoundingClientRect();

        if (currentCharIndex < currentWordElement.children.length) {
            caretLeftOffsetInWord = targetRect.left - currentWordRect.left;
        } else {
            caretLeftOffsetInWord = targetRect.right - currentWordRect.left;
        }
    } else {
        caretLeftOffsetInWord = 0;
    }

    const wordsDisplayRect = wordsDisplay.getBoundingClientRect();
    const currentWordRect = currentWordElement.getBoundingClientRect();

    const finalCaretLeft = (currentWordRect.left - wordsDisplayRect.left) + caretLeftOffsetInWord;
    const finalCaretTop = currentWordRect.top - wordsDisplayRect.top;

    caret.style.left = `${finalCaretLeft}px`;
    caret.style.top = `${finalCaretTop}px`;
    caret.style.display = 'block'; // Ensure caret is visible
}


function updateWordAndCaretHighlight() {
    if (currentWordIndex > 0 && wordElements[currentWordIndex - 1]) {
        wordElements[currentWordIndex - 1].classList.remove('current-word-highlight');
        const prevWordChildren = wordElements[currentWordIndex - 1].children;
        if (prevWordChildren && prevWordChildren.length > 0) {
            Array.from(prevWordChildren).forEach(charEl => charEl.classList.remove('current'));
        }
    }

    if (wordElements[currentWordIndex]) {
        wordElements[currentWordIndex].classList.add('current-word-highlight');
        if (wordElements[currentWordIndex].children[0]) {
            wordElements[currentWordIndex].children[0].classList.add('current');
        }
    }

    positionCaret();
}


// --- Event Handlers ---

function handleKeyDown(e) {
    if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        initGame();
        return;
    }

    if (textInput.disabled) return;

    if (!typingStarted && e.key.length === 1 && e.key !== ' ') {
        typingStarted = true;
        startTimer();
        caret.style.display = 'block';
    }

    const currentWordElement = wordElements[currentWordIndex];
    const targetWord = words[currentWordIndex];

    if (e.key === ' ') {
        e.preventDefault();

        const typedValue = textInput.value;

        for (let i = typedValue.length; i < targetWord.length; i++) {
            const charEl = currentWordElement.children[i];
            if (charEl) {
                if (!charEl.classList.contains('correct') && !charEl.classList.contains('incorrect')) {
                    charEl.classList.add('incorrect');
                    totalIncorrectChars++;
                }
            }
        }
        if (typedValue.length > targetWord.length) {
             totalExtraChars += (typedValue.length - targetWord.length);
        }

        currentWordElement.classList.add('typed');
        currentWordElement.classList.remove('current-word-highlight');

        Array.from(currentWordElement.children).forEach(charEl => charEl.classList.remove('current'));


        currentWordIndex++;
        currentCharIndex = 0;
        textInput.value = '';

        if (currentWordIndex >= generatedWordCount - 20) {
            generateWords();
        }

        if (currentWordIndex < wordElements.length) {
            updateWordAndCaretHighlight();
            scrollWordsDisplay();
        } else {
            endTest();
        }
    } else if (e.key === 'Backspace') {
        e.preventDefault();

        const typedText = textInput.value;

        if (currentCharIndex > 0) {
            if (typedText.length > words[currentWordIndex].length) {
                totalExtraChars--;
            } else {
                const charEl = currentWordElement.children[currentCharIndex - 1];
                if (charEl) {
                    if (charEl.classList.contains('correct')) {
                        totalCorrectChars--;
                    } else if (charEl.classList.contains('incorrect')) {
                        totalIncorrectChars--;
                    }
                    charEl.classList.remove('current', 'correct', 'incorrect', 'extra');
                }
            }

            currentCharIndex--;
            textInput.value = typedText.substring(0, typedText.length - 1);

            if (currentCharIndex >= 0 && currentCharIndex < words[currentWordIndex].length) {
                 currentWordElement.children[currentCharIndex].classList.add('current');
            }


            currentWordElement.classList.remove('typed');
            rawCharsTyped = Math.max(0, rawCharsTyped - 1);
            positionCaret();
        } else if (currentWordIndex > 0) {
            if (currentWordElement.children[0]) {
                currentWordElement.children[0].classList.remove('current');
            }

            currentWordIndex--;
            const prevWordElement = wordElements[currentWordIndex];
            const prevWord = words[currentWordIndex];
            currentCharIndex = prevWord.length;

            prevWordElement.classList.remove('typed');
            updateWordAndCaretHighlight();

            for (let i = 0; i < prevWord.length; i++) {
                prevWordElement.children[i].classList.remove('correct', 'incorrect', 'extra');
            }

            textInput.value = prevWord;
            scrollWordsDisplay();
            recalculateCharStatesAndCounts();
        }
        updateLiveStats();
    } else if (e.key.length > 1 && e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Meta') {
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

    if (currentCharIndex > 0 && currentWordIndex < wordElements.length && currentWordElement.children[currentCharIndex - 1]) {
        currentWordElement.children[currentCharIndex - 1].classList.remove('current');
    }

    if (typedValue.length > targetWord.length) {
        totalExtraChars++;
    } else if (currentCharIndex < targetWord.length) {
        const charEl = currentWordElement.children[currentCharIndex];
        const targetChar = targetWord[currentCharIndex];
        const typedChar = typedValue[typedValue.length - 1];

        if (!typedChar) return;

        if (typedChar === targetChar) {
            charEl.classList.remove('incorrect', 'extra');
            charEl.classList.add('correct');
            totalCorrectChars++;
        } else {
            charEl.classList.remove('correct', 'extra');
            charEl.classList.add('incorrect');
            totalIncorrectChars++;
        }
    }

    currentCharIndex++;

    if (currentCharIndex < targetWord.length && currentWordElement.children[currentCharIndex]) {
        currentWordElement.children[currentCharIndex].classList.add('current');
    } else if (currentWordElement.children[targetWord.length - 1]) {
        currentWordElement.children[targetWord.length - 1].classList.remove('current');
    }

    positionCaret();
    updateLiveStats();
}

function recalculateCharStatesAndCounts() {
    totalCorrectChars = 0;
    totalIncorrectChars = 0;
    totalExtraChars = 0;
    rawCharsTyped = 0;

    for (let i = 0; i <= currentWordIndex; i++) {
        const wordEl = wordElements[i];
        const wordText = words[i];
        let currentTypedValue;

        if (i < currentWordIndex) {
            currentTypedValue = words[i];
        } else if (i === currentWordIndex) {
            currentTypedValue = textInput.value;
        }

        for (let j = 0; j < wordText.length; j++) {
            if (j < currentTypedValue.length) {
                rawCharsTyped++;
                const charEl = wordEl.children[j];
                if (charEl.classList.contains('correct')) {
                    totalCorrectChars++;
                } else if (charEl.classList.contains('incorrect')) {
                    totalIncorrectChars++;
                }
            }
        }

        if (i === currentWordIndex && currentTypedValue.length > wordText.length) {
            totalExtraChars += (currentTypedValue.length - wordText.length);
            rawCharsTyped += (currentTypedValue.length - wordText.length);
        }
    }
}


// --- Settings Persistence ---
function saveSettings() {
    localStorage.setItem('selectedTime', timeLeft);
    localStorage.setItem('includeNumbers', includeNumbers);
    localStorage.setItem('includePunctuation', includePunctuation);
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

    const savedNumbers = localStorage.getItem('includeNumbers');
    if (savedNumbers !== null) {
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

    includeNumbersBtn.addEventListener('click', () => {
        includeNumbers = !includeNumbers;
        includeNumbersBtn.classList.toggle('active', includeNumbers);
        saveSettings();
        initGame();
    });

    includePunctuationBtn.addEventListener('click', () => {
        includePunctuation = !includePunctuation;
        includePunctuationBtn.classList.toggle('active', includePunctuation);
        saveSettings();
        initGame();
    });

    restartBtn.addEventListener('click', initGame);

    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('light-theme');
        document.body.classList.toggle('dark-theme');
        saveSettings();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (document.activeElement === textInput || !resultsScreen.classList.contains('hidden')) {
                e.preventDefault();
                initGame();
            }
        }
    });
}

// --- Initial Game Setup ---
loadSettings();
setupEventListeners();
initGame();