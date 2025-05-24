let allWords = [];
const numbers = [];
const punctuations = [
    '.', ',', '!', '?', ':', ';', "'", '"', '/', '\\', '|',
    '(', ')', '[', ']', '{', '}', '-', '_', '=', '+', '&',
    '*', '^', '%', '$', '#', '@', '~', '`'
];

let currentTestContent = [];
let currentWordIndex = 0;
let currentCharIndex = 0;

let testActive = false;
let testFinished = false;
let timerId = null;
let timeLeft = 60;
let initialTestTime = 60;
let currentTime = 60; // Correctly declared and initialized

let correctChars = 0;
let incorrectChars = 0;
let totalTypedChars = 0; // All characters user tried to type
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

// NEW DOM elements for smoother transitions and loading
const appWrapper = document.getElementById('app-wrapper'); // Added this ID to your main content div
const loadingOverlay = document.getElementById('loading-overlay'); // New loading overlay element
const appHeader = document.querySelector('.app-header');
const controlsSection = document.getElementById('controls-section');
const infoSections = document.getElementById('info-sections');
const footer = document.querySelector('.footer');


// Updated for flexible modes
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
    // Show loading overlay
    loadingOverlay.classList.remove('hidden');
    appWrapper.style.opacity = '0'; // Hide main content during loading

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
        // Hide loading overlay and show content after initialization
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

// Renders the words/content into the display area with proper spacing
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

        // Add a space character as a separate span *after* each word, except the last one
        if (wordIndex < currentTestContent.length - 1) {
            const spaceSpan = document.createElement('span');
            spaceSpan.classList.add('letter', 'space');
            spaceSpan.textContent = ' '; // Actual space character
            wordSpan.appendChild(spaceSpan); // Append space *inside* the wordSpan for easier selection/traversal
        }
        wordsDisplay.appendChild(wordSpan); // Append the wordSpan (which now includes its trailing space)
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
    appHeader.classList.remove('hidden'); // Ensure these are not 'hidden' in HTML
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
    const actualTimeTaken = initialTestTime - timeLeft; // If timeLeft is 0, timeTaken is initialTestTime

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
    // Calculate minutes based on actual time elapsed, not just initialTestTime
    const actualElapsedSeconds = initialTestTime - timeLeft;
    const minutes = actualElapsedSeconds / 60;
    if (minutes <= 0) return 0;
    return Math.round((typedCorrectlyOnce / 5) / minutes);
}

function calculateAccuracy() {
    if (totalTypedChars === 0) return 0;
    // Accuracy is calculated based on correct typed characters vs total attempted characters
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

textInput.addEventListener('keydown', (e) => {
    // Prevent default behavior for space and tab to control it manually
    if (e.key === ' ' || e.key === 'Tab') {
        e.preventDefault();
    }

    // Start test on first valid key press
    if (!testActive && !testFinished && e.key.length === 1 && e.key !== ' ') {
        testActive = true;
        startTimer();
    }
});

textInput.addEventListener('input', (e) => {
    if (testFinished) return;

    const typedText = textInput.value;
    const currentWordSpan = wordsDisplay.children[currentWordIndex];
    if (!currentWordSpan) return;

    const targetWord = currentTestContent[currentWordIndex];
    const targetSequence = targetWord + (currentWordIndex < currentTestContent.length - 1 ? ' ' : '');

    const allLettersInCurrentSpan = currentWordSpan.querySelectorAll('.letter');

    // Remove all previous feedback classes and the current class for this word
    allLettersInCurrentSpan.forEach(charSpan => {
        charSpan.classList.remove('correct', 'incorrect', 'current', 'extra', 'missing');
    });
    // Remove any previously added extra spans
    currentWordSpan.querySelectorAll('.extra').forEach(el => el.remove());


    // Compare typed characters with target sequence and apply classes
    for (let i = 0; i < targetSequence.length; i++) {
        const charSpan = allLettersInCurrentSpan[i];
        if (i < typedText.length) {
            // Character has been typed
            if (typedText[i] === targetSequence[i]) {
                charSpan.classList.add('correct');
            } else {
                charSpan.classList.add('incorrect');
            }
        } else {
            // Character is missing (not yet typed)
            charSpan.classList.add('missing'); // Visual feedback for missing chars
        }
    }

    // Handle "extra" characters (typed beyond target sequence length)
    if (typedText.length > targetSequence.length) {
        for (let i = targetSequence.length; i < typedText.length; i++) {
            const extraCharSpan = document.createElement('span');
            extraCharSpan.classList.add('letter', 'extra');
            extraCharSpan.textContent = typedText[i];
            currentWordSpan.appendChild(extraCharSpan);
        }
    }

    // Update currentCharIndex and apply current-char highlight
    currentCharIndex = typedText.length;
    let charToHighlight = allLettersInCurrentSpan[currentCharIndex];
    
    if (!charToHighlight && typedText.length > targetSequence.length) {
        charToHighlight = currentWordSpan.lastElementChild;
    }
    
    if (charToHighlight) {
        charToHighlight.classList.add('current');
    }

    // Live stats update only if test is active
    if (testActive) {
        updateLiveStats();
    }

    // Check if the word (and its trailing space) is completed
    if (typedText.length > 0 && typedText[typedText.length - 1] === ' ') {
        advanceWord();
    }
});


function advanceWord() {
    const typedText = textInput.value;
    const targetWord = currentTestContent[currentWordIndex];
    const targetSequence = targetWord + (currentWordIndex < currentTestContent.length - 1 ? ' ' : '');

    let wordCorrectCount = 0;
    let wordTypedCorrectlyOnceFlag = true;

    // Compare character by character for the word and its trailing space
    for (let i = 0; i < targetSequence.length; i++) {
        totalTypedChars++; // Each target character is counted as attempted
        if (i < typedText.length && typedText[i] === targetSequence[i]) {
            correctChars++;
            wordCorrectCount++;
        } else {
            incorrectChars++;
            wordTypedCorrectlyOnceFlag = false;
        }
    }

    // Account for extra characters typed beyond the target sequence
    if (typedText.length > targetSequence.length) {
        incorrectChars += (typedText.length - targetSequence.length);
        totalTypedChars += (typedText.length - targetSequence.length); // Count extra chars as attempted
        wordTypedCorrectlyOnceFlag = false;
    }

    // If the word was typed perfectly (including space) on the first attempt
    if (wordTypedCorrectlyOnceFlag && typedText.length === targetSequence.length) {
        typedCorrectlyOnce += targetSequence.length;
    }

    // Clear input for next word
    textInput.value = '';

    // Deactivate current word, move to next
    const currentWordSpan = wordsDisplay.children[currentWordIndex];
    if (currentWordSpan) {
        currentWordSpan.classList.remove('active');
        // Remove 'current' class from any child letter in the just-completed word
        currentWordSpan.querySelectorAll('.letter').forEach(charSpan => charSpan.classList.remove('current'));
    }

    currentWordIndex++;
    currentCharIndex = 0;

    // Move to the next word or end test
    if (currentWordIndex < currentTestContent.length) {
        const nextWordSpan = wordsDisplay.children[currentWordIndex];
        const nextFirstLetter = nextWordSpan ? nextWordSpan.querySelector('.letter') : null;

        if (nextWordSpan) nextWordSpan.classList.add('active');
        if (nextFirstLetter) nextFirstLetter.classList.add('current');

        scrollWordsDisplay();
    } else {
        endTest();
    }
}


function scrollWordsDisplay() {
    const activeWordSpan = wordsDisplay.querySelector('.word.active');
    if (!activeWordSpan) return;

    const displayRect = wordsDisplay.getBoundingClientRect();
    const activeWordRect = activeWordSpan.getBoundingClientRect();

    // Calculate if the current word is out of view (below the bottom or above the top)
    const isBelow = activeWordRect.bottom > displayRect.bottom;
    const isAbove = activeWordRect.top < displayRect.top;

    if (isBelow || isAbove) {
        wordsDisplay.scrollTop = activeWordRect.top - displayRect.top + wordsDisplay.scrollTop - (wordsDisplay.offsetHeight / 3);
    }
}


modeSelector.addEventListener('click', (e) => {
    if (e.target.classList.contains('mode-button')) {
        const mode = e.target.dataset.mode;
        activeModes[mode] = !activeModes[mode];

        if (!activeModes.words && !activeModes.numbers && !activeModes.punctuation) {
            activeModes.words = true;
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

    if (wpm > currentMaxWPM) {
        localStorage.setItem(LOCAL_STORAGE_MAX_WPM_KEY, wpm);
        maxWPM.textContent = wpm;
    }
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
    if (history.length > 10) {
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

loadAllWords();

document.addEventListener('click', (e) => {
    if (!testFinished && !e.target.closest('.controls') && !e.target.closest('#results-screen')) {
        textInput.focus();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Escape' && testFinished) {
        restartButton.click();
    }
    if (e.key === 'Enter' && testFinished && !resultsScreen.classList.contains('hidden')) { // Ensure results screen is visible
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