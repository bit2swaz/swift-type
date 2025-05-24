let allWords = [];
const numbers = [];
const punctuations = [
    '.', ',', '!', '?', ':', ';', "'", '"', '/', '\\', '|',
    '(', ')', '[', ']', '{', '}', '-', '_', '=', '+', '&',
    '*', '^', '%', '$', '#', '@', '~', '`'
];

let currentTestContent = []; // e.g., ["hello", "world"]
let currentWordIndex = 0; // Index of the current word in currentTestContent
let currentCharIndex = 0; // Index of the current character *within the current word*

let testActive = false;
let testFinished = false;
let timerId = null;
let timeLeft = 60;
let initialTestTime = 60;
let currentTime = 60; // Correctly declared and initialized

let correctChars = 0; // Total correct characters typed (at any attempt)
let incorrectChars = 0; // Total incorrect characters typed (at any attempt)
let totalTypedChars = 0; // Total characters user attempted to type
let typedCorrectlyOnce = 0; // Characters typed correctly *on the first attempt* for WPM
let startTime = 0;

const themeToggle = document.getElementById('theme-toggle');
const timerDisplay = document.getElementById('timer');
const modeSelector = document.getElementById('mode-selector');
const timeSelector = document.getElementById('time-selector');
const wordsDisplay = document.getElementById('words-display');
const textInput = document.getElementById('text-input');
const liveStats = document.getElementById('live-stats');
const liveWPM = document.getElementById('live-wpm');
const liveAccuracy = document.getElementById('live-accuracy');
const resultsScreen = document.getElementById('results-screen');
const finalWPM = document.getElementById('final-wpm');
const finalAccuracy = document.getElementById('final-accuracy');
const charsTyped = document.getElementById('chars-typed');
const timeTaken = document.getElementById('time-taken');
const retryButton = document.getElementById('retry-button');
const restartButton = document.getElementById('restart-button');
const highScoreTracker = document.getElementById('high-score-tracker');
const maxWPM = document.getElementById('max-wpm');
const bestAccuracy = document.getElementById('best-accuracy');
const typingHistorySection = document.getElementById('typing-history');
const toggleHistoryButton = document.getElementById('toggle-history');
const historyList = document.getElementById('history-list');

const appWrapper = document.getElementById('app-wrapper');
const loadingOverlay = document.getElementById('loading-overlay');
const appHeader = document.querySelector('.app-header');
const controlsSection = document.getElementById('controls-section');
const infoSections = document.getElementById('info-sections');
const footer = document.querySelector('.footer');


let activeModes = {
    words: true,
    numbers: false,
    punctuation: false
};

const LOCAL_STORAGE_THEME_KEY = 'monkeytypeCloneTheme';
const LOCAL_STORAGE_MAX_WPM_KEY = 'monkeytypeCloneMaxWPM';
const LOCAL_STORAGE_BEST_ACCURACY_KEY = 'monkeytypeCloneBestAccuracy';
const LOCAL_STORAGE_HISTORY_KEY = 'monkeytypeCloneHistory';
const LOCAL_STORAGE_ACTIVE_MODES_KEY = 'monkeytypeCloneActiveModes';

for (let i = 1; i <= 1000; i++) {
    numbers.push(i.toString());
}

async function loadAllWords() {
    loadingOverlay.classList.remove('hidden');
    appWrapper.style.opacity = '0';

    try {
        const response = await fetch('words.txt');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        allWords = text.split('\n').map(word => word.trim()).filter(word => word.length > 0);
        console.log("All words loaded. Count:", allWords.length);

        applySavedTheme();
        loadActiveModes();
        loadHighScores();
        loadTypingHistory();
        initializeTest();

    } catch (error) {
        console.error("Error loading words.txt:", error);
        wordsDisplay.innerHTML = `<p style="color: ${getComputedStyle(document.body).getPropertyValue('--incorrect-char-color')}">Error loading words. Please ensure 'words.txt' is in the root directory. Check console for details.</p>`;
        textInput.disabled = true;
    } finally {
        loadingOverlay.classList.add('hidden');
        appWrapper.style.opacity = '1';
    }
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateTestContent(count = 50) {
    const generatedContent = [];
    const availableElements = [];

    if (activeModes.words && allWords.length > 0) availableElements.push('word');
    if (activeModes.numbers && numbers.length > 0) availableElements.push('number');
    if (activeModes.punctuation && punctuations.length > 0) availableElements.push('punctuation');

    if (availableElements.length === 0) {
        if (allWords.length > 0) {
            availableElements.push('word');
        } else {
            wordsDisplay.textContent = "No content available for typing. Please check wordlist or mode selections.";
            textInput.disabled = true;
            return [];
        }
    }

    for (let i = 0; i < count; i++) {
        const contentType = getRandomElement(availableElements);
        let element;
        switch (contentType) {
            case 'word':
                element = getRandomElement(allWords);
                break;
            case 'number':
                element = getRandomElement(numbers);
                break;
            case 'punctuation':
                element = getRandomElement(punctuations);
                break;
        }
        generatedContent.push(element);
    }
    return generatedContent;
}

// Renders the words/content into the display area. No separate space spans.
function renderContent() {
    wordsDisplay.innerHTML = '';
    currentTestContent.forEach((word, wordIndex) => {
        const wordSpan = document.createElement('span');
        wordSpan.classList.add('word');
        wordSpan.setAttribute('data-word-index', wordIndex);

        word.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.classList.add('letter');
            charSpan.textContent = char;
            wordSpan.appendChild(charSpan);
        });
        wordsDisplay.appendChild(wordSpan);
    });

    // Highlight the first character of the first word as current
    if (wordsDisplay.children.length > 0) {
        const firstWordSpan = wordsDisplay.children[0];
        const firstLetter = firstWordSpan.querySelector('.letter');
        if (firstLetter) {
            firstLetter.classList.add('current');
        }
    }

    textInput.focus();
}


function initializeTest() {
    currentWordIndex = 0;
    currentCharIndex = 0;
    testActive = false;
    testFinished = false;
    timeLeft = currentTime;
    timerDisplay.textContent = timeLeft;
    timerDisplay.style.setProperty('--timer-progress', '100%');
    textInput.value = '';
    textInput.disabled = false;
    wordsDisplay.classList.remove('blur-on-finish');
    liveStats.classList.remove('visible'); // Hide live stats initially

    correctChars = 0;
    incorrectChars = 0;
    totalTypedChars = 0;
    typedCorrectlyOnce = 0;
    startTime = 0;

    currentTestContent = generateTestContent(50);
    renderContent();

    resultsScreen.classList.add('hidden');
    document.getElementById('typing-test-area').classList.remove('hidden');

    // Show initial UI elements smoothly
    document.body.classList.remove('test-in-progress'); // Triggers CSS transition
    appHeader.classList.remove('hidden');
    controlsSection.classList.remove('hidden');
    infoSections.classList.remove('hidden');
    footer.classList.remove('hidden');

    textInput.focus();
    updateTabTitle();
    console.log("Test initialized. Active Modes:", activeModes, "Time:", currentTime, "s");
}

function startTimer() {
    if (timerId) clearInterval(timerId);
    startTime = Date.now();

    // Hide unnecessary UI elements smoothly
    document.body.classList.add('test-in-progress'); // Triggers CSS transition
    liveStats.classList.add('visible'); // Show live stats

    timerId = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        const progress = (timeLeft / initialTestTime) * 100;
        timerDisplay.style.setProperty('--timer-progress', `${progress}%`);

        updateTabTitle();
        updateLiveStats();

        if (timeLeft <= 0) {
            clearInterval(timerId);
            endTest();
        }
    }, 1000);
}

function endTest() {
    testActive = false;
    testFinished = true;
    clearInterval(timerId);
    textInput.disabled = true;
    wordsDisplay.classList.add('blur-on-finish');

    const finalWPMValue = calculateWPM();
    const finalAccuracyValue = calculateAccuracy();
    const actualTimeTaken = initialTestTime - timeLeft;

    finalWPM.textContent = finalWPMValue;
    finalAccuracy.textContent = `${finalAccuracyValue}%`;
    charsTyped.textContent = totalTypedChars;
    timeTaken.textContent = `${actualTimeTaken}s`;

    resultsScreen.classList.remove('hidden');
    document.getElementById('typing-test-area').classList.add('hidden');

    // Show all UI elements for results screen smoothly
    document.body.classList.remove('test-in-progress');
    appHeader.classList.remove('hidden');
    controlsSection.classList.remove('hidden');
    infoSections.classList.remove('hidden');
    footer.classList.remove('hidden');

    updateHighScores(finalWPMValue, finalAccuracyValue);
    saveTestToHistory(finalWPMValue, finalAccuracyValue, actualTimeTaken);
    updateTabTitle();

    console.log("Test ended!");
    console.log("WPM:", finalWPMValue, "Accuracy:", finalAccuracyValue + "%");
}

function calculateWPM() {
    if (typedCorrectlyOnce === 0 || (!testActive && !testFinished)) return 0;
    const actualElapsedSeconds = initialTestTime - timeLeft;
    const minutes = actualElapsedSeconds / 60;
    if (minutes <= 0) return 0;
    return Math.round((typedCorrectlyOnce / 5) / minutes);
}

function calculateAccuracy() {
    if (totalTypedChars === 0) return 0;
    return Math.round((correctChars / totalTypedChars) * 100);
}

function updateLiveStats() {
    if (testActive) {
        liveWPM.textContent = `WPM: ${calculateWPM()}`;
        liveAccuracy.textContent = `Accuracy: ${calculateAccuracy()}%`;
        liveStats.classList.add('visible');
    } else {
        liveStats.classList.remove('visible');
    }
}

// **CRITICAL CHANGE: Keydown handles Spacebar and Backspace**
textInput.addEventListener('keydown', (e) => {
    // Start test on first valid key press (non-space, non-tab, single char)
    if (!testActive && !testFinished && e.key.length === 1 && e.key !== ' ' && e.key !== 'Tab') {
        testActive = true;
        startTimer();
    }

    // Handle Spacebar
    if (e.key === ' ') {
        e.preventDefault(); // PREVENT DEFAULT SPACE BEHAVIOR (adding to input.value)
        if (testActive && textInput.value.length > 0) { // Only advance if test active and something is typed
            advanceWord();
        }
        // If test not active or input is empty, space does nothing.
    }

    // Handle Backspace
    // `e.preventDefault()` is usually NOT needed for backspace, let browser handle value change
    // The `input` event listener will handle visual updates
});


// **CRITICAL CHANGE: Input event handles character feedback and currentCharIndex**
textInput.addEventListener('input', (e) => {
    if (testFinished) return;

    const typedText = textInput.value; // Get the current content of the input field
    const currentWordSpan = wordsDisplay.children[currentWordIndex];
    if (!currentWordSpan) return;

    const targetWord = currentTestContent[currentWordIndex]; // The actual word to type

    const allLettersInCurrentWord = currentWordSpan.querySelectorAll('.letter');

    // Remove all previous feedback classes and the current class for this word
    allLettersInCurrentWord.forEach(charSpan => {
        charSpan.classList.remove('correct', 'incorrect', 'current', 'missing');
    });
    // Remove any previously added extra spans
    currentWordSpan.querySelectorAll('.extra').forEach(el => el.remove());


    // Apply feedback (correct/incorrect/missing) for characters currently in input
    for (let i = 0; i < targetWord.length; i++) { // Iterate only through the target word's length
        const charSpan = allLettersInCurrentWord[i];
        if (i < typedText.length) {
            // Character has been typed by the user
            if (typedText[i] === targetWord[i]) {
                charSpan.classList.add('correct');
            } else {
                charSpan.classList.add('incorrect');
            }
        } else {
            // Character is in the target word but not yet typed
            charSpan.classList.add('missing');
        }
    }

    // Handle extra characters typed beyond the target word length
    if (typedText.length > targetWord.length) {
        for (let i = targetWord.length; i < typedText.length; i++) {
            const extraCharSpan = document.createElement('span');
            extraCharSpan.classList.add('letter', 'extra');
            extraCharSpan.textContent = typedText[i];
            currentWordSpan.appendChild(extraCharSpan);
        }
    }

    // Update currentCharIndex (position within the *current word*)
    currentCharIndex = typedText.length; // The next character to type

    // Highlight the `current` (next) character to be typed
    let charToHighlight = allLettersInCurrentWord[currentCharIndex];
    if (!charToHighlight && typedText.length > targetWord.length) {
        // If typing extra characters, highlight the last extra character
        charToHighlight = currentWordSpan.lastElementChild;
    }
    
    if (charToHighlight) {
        charToHighlight.classList.add('current');
    }

    // Update live stats as user types (accuracy calculation simplified for live update)
    if (testActive) {
        // For live stats, calculate based on current word typed so far.
        // Final stats will be calculated in advanceWord/endTest.
        // This is a simplification; a truly accurate live WPM/Accuracy needs more complex state tracking.
        // For now, these functions are fine if they rely on the `totalTypedChars` and `correctChars` only being updated upon word completion.
        updateLiveStats();
    }
});


// **CRITICAL CHANGE: Advance Word function is called ONLY by Spacebar or End of Test**
function advanceWord() {
    const typedText = textInput.value; // Capture the content of the input field for the completed word
    const targetWord = currentTestContent[currentWordIndex]; // The target word

    // **CRITICAL: Clear input field IMMEDIATELY to prevent "multiplication"**
    textInput.value = '';

    let wordWasCorrect = true; // Flag to track if the word was typed perfectly (for WPM)

    // Calculate stats for the *just completed word*
    // Iterate through the target word's characters
    for (let i = 0; i < targetWord.length; i++) {
        totalTypedChars++; // Each target char is counted as attempted
        if (i < typedText.length && typedText[i] === targetWord[i]) {
            correctChars++;
        } else {
            incorrectChars++;
            wordWasCorrect = false; // Mark word as incorrect if any mismatch
        }
    }

    // Account for extra characters typed beyond the target word
    if (typedText.length > targetWord.length) {
        incorrectChars += (typedText.length - targetWord.length); // Extra chars are incorrect
        totalTypedChars += (typedText.length - targetWord.length); // Count extra chars as attempted
        wordWasCorrect = false; // Mark word as incorrect if extras exist
    }

    // If the word was typed perfectly on the first attempt (no errors, no extras)
    if (wordWasCorrect && typedText.length === targetWord.length) {
        typedCorrectlyOnce += targetWord.length + 1; // +1 for the space that was successfully "typed" to advance
    } else {
        typedCorrectlyOnce += typedText.length; // Count all characters typed, but not if they were errors
    }


    // Visual cleanup for the just completed word
    const currentWordSpan = wordsDisplay.children[currentWordIndex];
    if (currentWordSpan) {
        // Remove 'current' class from any child letter in the just-completed word
        currentWordSpan.querySelectorAll('.letter').forEach(charSpan => charSpan.classList.remove('current', 'missing'));
        // Correct/incorrect classes remain as visual history
    }

    // Advance to the next word
    currentWordIndex++;
    currentCharIndex = 0; // Reset char index for the new word

    // Check if test is finished
    if (currentWordIndex < currentTestContent.length) {
        const nextWordSpan = wordsDisplay.children[currentWordIndex];
        if (nextWordSpan) {
            // Highlight the first character of the next word
            const nextFirstLetter = nextWordSpan.querySelector('.letter');
            if (nextFirstLetter) {
                nextFirstLetter.classList.add('current');
            }
        }
        scrollWordsDisplay();
    } else {
        endTest();
    }
    // Ensure text input remains focused for continuous typing
    textInput.focus();
}


function scrollWordsDisplay() {
    const currentWordSpan = wordsDisplay.children[currentWordIndex];
    if (!currentWordSpan) return;

    const displayRect = wordsDisplay.getBoundingClientRect();
    const currentWordRect = currentWordSpan.getBoundingClientRect();

    const isBelow = currentWordRect.bottom > displayRect.bottom;
    const isAbove = currentWordRect.top < displayRect.top;

    if (isBelow || isAbove) {
        // Scroll to make the current word visible, ideally at the top of the display area
        // or a bit higher to reveal the next line fully.
        wordsDisplay.scrollTop = currentWordRect.top - displayRect.top + wordsDisplay.scrollTop - (wordsDisplay.offsetHeight / 3);
    }
}


modeSelector.addEventListener('click', (e) => {
    if (e.target.classList.contains('mode-button')) {
        const mode = e.target.dataset.mode;
        activeModes[mode] = !activeModes[mode];

        if (!activeModes.words && !activeModes.numbers && !activeModes.punctuation) {
            activeModes.words = true; // Ensure at least one mode is always active
        }

        modeSelector.querySelectorAll('.mode-button').forEach(btn => {
            if (activeModes[btn.dataset.mode]) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        localStorage.setItem(LOCAL_STORAGE_ACTIVE_MODES_KEY, JSON.stringify(activeModes));
        initializeTest();
    }
});

function loadActiveModes() {
    const savedModes = localStorage.getItem(LOCAL_STORAGE_ACTIVE_MODES_KEY);
    if (savedModes) {
        activeModes = JSON.parse(savedModes);
    } else {
        activeModes = { words: true, numbers: false, punctuation: false };
    }

    modeSelector.querySelectorAll('.mode-button').forEach(btn => {
        if (activeModes[btn.dataset.mode]) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

timeSelector.addEventListener('click', (e) => {
    if (e.target.classList.contains('time-button')) {
        timeSelector.querySelectorAll('.time-button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentTime = parseInt(e.target.dataset.time);
        initialTestTime = currentTime;
        initializeTest();
    }
});

retryButton.addEventListener('click', () => {
    initializeTest();
});

restartButton.addEventListener('click', () => {
    activeModes = { words: true, numbers: false, punctuation: false };
    currentTime = 60;
    initialTestTime = 60;

    modeSelector.querySelector('[data-mode="words"]').classList.add('active');
    modeSelector.querySelectorAll('.mode-button:not([data-mode="words"])').forEach(btn => btn.classList.remove('active'));
    timeSelector.querySelector('[data-time="60"]').classList.add('active');
    timeSelector.querySelectorAll('.time-button:not([data-time="60"])').forEach(btn => btn.classList.remove('active'));

    localStorage.setItem(LOCAL_STORAGE_ACTIVE_MODES_KEY, JSON.stringify(activeModes));
    initializeTest();
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, isDarkMode ? 'dark' : 'light');
    themeToggle.textContent = isDarkMode ? '🌙' : '☀️';
});

function applySavedTheme() {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '🌙';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.textContent = '☀️';
    }
}

function loadHighScores() {
    const savedMaxWPM = localStorage.getItem(LOCAL_STORAGE_MAX_WPM_KEY);
    const savedBestAccuracy = localStorage.getItem(LOCAL_STORAGE_BEST_ACCURACY_KEY);

    if (savedMaxWPM) maxWPM.textContent = savedMaxWPM;
    if (savedBestAccuracy) bestAccuracy.textContent = `${savedBestAccuracy}%`;
}

function updateHighScores(wpm, accuracy) {
    let currentMaxWPM = parseInt(localStorage.getItem(LOCAL_STORAGE_MAX_WPM_KEY) || '0');
    let currentBestAccuracy = parseInt(localStorage.getItem(LOCAL_STORAGE_BEST_ACCURACY_KEY) || '0');

    // Update Max WPM
    if (wpm > currentMaxWPM) {
        localStorage.setItem(LOCAL_STORAGE_MAX_WPM_KEY, wpm);
        maxWPM.textContent = wpm;
    }
    // Update Best Accuracy only if WPM is equal to or greater than current max WPM, or if it's the very first entry
    if (wpm >= currentMaxWPM && accuracy > currentBestAccuracy || (currentMaxWPM === 0 && wpm > 0)) {
        localStorage.setItem(LOCAL_STORAGE_BEST_ACCURACY_KEY, accuracy);
        bestAccuracy.textContent = `${accuracy}%`;
    }
}

function loadTypingHistory() {
    const history = JSON.parse(localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY) || '[]');
    renderHistory(history);
}

function saveTestToHistory(wpm, accuracy, time) {
    const history = JSON.parse(localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY) || '[]');
    const newEntry = {
        wpm: wpm,
        accuracy: accuracy,
        time: time,
        date: new Date().toLocaleString()
    };
    history.unshift(newEntry);
    if (history.length > 10) { // Keep only the last 10 entries
        history.pop();
    }
    localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
    renderHistory(history);
}

function renderHistory(history) {
    historyList.innerHTML = '';
    if (history.length === 0) {
        historyList.innerHTML = '<p>No tests yet.</p>';
        return;
    }
    history.forEach((entry, index) => {
        const item = document.createElement('div');
        item.classList.add('history-item');
        item.innerHTML = `
            <span>WPM: ${entry.wpm}</span>
            <span>Acc: ${entry.accuracy}%</span>
            <span>Time: ${entry.time}s</span>
            <span>${entry.date}</span>
        `;
        historyList.appendChild(item);
    });
}

toggleHistoryButton.addEventListener('click', () => {
    historyList.classList.toggle('hidden');
});

loadAllWords(); // Initiate the loading process on page load

document.addEventListener('click', (e) => {
    // Keep focus on text input unless clicking controls or results
    if (!testFinished && !e.target.closest('.controls') && !e.target.closest('#results-screen')) {
        textInput.focus();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Escape' && testFinished) {
        restartButton.click();
    }
    if (e.key === 'Enter' && testFinished && !resultsScreen.classList.contains('hidden')) {
        e.preventDefault();
        restartButton.click();
    } else if (e.key === 'Tab' && !testActive && !testFinished && document.activeElement !== textInput) {
        e.preventDefault();
        textInput.focus();
    }
});

function updateTabTitle() {
    if (testActive) {
        document.title = `Typing... (${timeLeft}s) | SwiftType by bit2swaz`;
    } else if (testFinished) {
        document.title = `Results! | SwiftType by bit2swaz`;
    } else {
        document.title = `SwiftType by bit2swaz`;
    }
}