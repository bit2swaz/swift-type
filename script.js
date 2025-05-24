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
// >>>>>>>>>>>>> THE CRUCIAL LINE WAS MISSING HERE <<<<<<<<<<<<<
let currentTime = 60; // <--- ADD THIS LINE HERE!

let correctChars = 0;
let incorrectChars = 0;
let totalTypedChars = 0;
let typedCorrectlyOnce = 0;
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
    }
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Generates the sequence of words/numbers/punctuation for the test
function generateTestContent(count = 50) {
    const generatedContent = [];
    const availableElements = [];

    if (activeModes.words && allWords.length > 0) availableElements.push('word');
    if (activeModes.numbers && numbers.length > 0) availableElements.push('number');
    if (activeModes.punctuation && punctuations.length > 0) availableElements.push('punctuation');

    if (availableElements.length === 0) {
        // Fallback to words if no modes are active or lists are empty
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
        const wordWrapper = document.createElement('span');
        wordWrapper.classList.add('word-wrapper');

        const wordSpan = document.createElement('span');
        wordSpan.classList.add('word');
        wordSpan.setAttribute('data-word-index', wordIndex);

        if (wordIndex === 0) {
            wordSpan.classList.add('active');
        }

        word.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.classList.add('letter');
            charSpan.textContent = char;
            wordSpan.appendChild(charSpan);
        });

        wordWrapper.appendChild(wordSpan);

        // Add a space character AFTER the word, inside the word-wrapper
        if (wordIndex < currentTestContent.length - 1) {
            const spaceSpan = document.createElement('span');
            spaceSpan.classList.add('letter', 'space');
            spaceSpan.textContent = ' ';
            wordWrapper.appendChild(spaceSpan);
        }
        wordsDisplay.appendChild(wordWrapper);
    });

    // Highlight the first character of the first word as current
    if (wordsDisplay.children.length > 0) {
        const firstWordWrapper = wordsDisplay.children[0];
        const firstLetter = firstWordWrapper.querySelector('.letter');
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
    timeLeft = currentTime; // Now `currentTime` is correctly defined globally
    timerDisplay.textContent = timeLeft;
    timerDisplay.style.setProperty('--timer-progress', '100%');
    textInput.value = '';
    textInput.disabled = false;
    wordsDisplay.classList.remove('blur-on-finish');
    liveStats.classList.remove('visible');

    correctChars = 0;
    incorrectChars = 0;
    totalTypedChars = 0;
    typedCorrectlyOnce = 0;
    startTime = 0;

    currentTestContent = generateTestContent(50);
    renderContent();

    resultsScreen.classList.add('hidden');
    document.getElementById('typing-test-area').classList.remove('hidden');

    // Show initial UI elements
    document.body.classList.remove('test-in-progress');
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

    // Hide unnecessary UI elements
    document.body.classList.add('test-in-progress');
    liveStats.classList.add('visible');

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

    // Show all UI elements for results screen
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
    const minutes = (initialTestTime - timeLeft) / 60;
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

textInput.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        e.preventDefault();
    }
    if (e.key === 'Tab') {
        e.preventDefault();
    }

    if (!testActive && !testFinished && e.key.length === 1 && e.key !== ' ') {
        testActive = true;
        startTimer();
    }
});

textInput.addEventListener('input', (e) => {
    if (testFinished) return;

    const typedText = textInput.value;
    const currentWordWrapper = wordsDisplay.children[currentWordIndex];
    if (!currentWordWrapper) return;

    const currentWordSpan = currentWordWrapper.querySelector('.word');
    if (!currentWordSpan) return;

    const targetWord = currentTestContent[currentWordIndex];
    const targetSequence = targetWord + (currentWordIndex < currentTestContent.length - 1 ? ' ' : '');

    const allCurrentLetters = currentWordWrapper.querySelectorAll('.letter');

    allCurrentLetters.forEach(charSpan => {
        charSpan.classList.remove('correct', 'incorrect', 'current', 'extra', 'missing');
    });

    let currentWordTypedChars = 0;

    for (let i = 0; i < allCurrentLetters.length; i++) {
        const charSpan = allCurrentLetters[i];
        if (i < typedText.length) {
            currentWordTypedChars++;
            if (typedText[i] === targetSequence[i]) {
                charSpan.classList.add('correct');
            } else {
                charSpan.classList.add('incorrect');
            }
        }
    }

    if (typedText.length > targetSequence.length) {
        currentWordWrapper.querySelectorAll('.extra').forEach(el => el.remove());

        for (let i = targetSequence.length; i < typedText.length; i++) {
            const extraCharSpan = document.createElement('span');
            extraCharSpan.classList.add('letter', 'extra');
            extraCharSpan.textContent = typedText[i];
            currentWordWrapper.appendChild(extraCharSpan);
        }
    } else {
        currentWordWrapper.querySelectorAll('.extra').forEach(el => el.remove());
    }

    currentCharIndex = typedText.length;

    if (currentCharIndex < allCurrentLetters.length) {
        allCurrentLetters[currentCharIndex].classList.add('current');
    } else {
        const lastChar = allCurrentLetters[allCurrentLetters.length - 1];
        if (lastChar) {
            lastChar.classList.add('current');
        }
    }

    if (e.data === ' ') {
        const typedWordWithTrailingSpace = typedText;
        const actualTargetWord = currentTestContent[currentWordIndex];
        const actualTargetSequence = actualTargetWord + (currentWordIndex < currentTestContent.length - 1 ? ' ' : '');

        let wordCorrectCount = 0;
        let wordIncorrectCount = 0;
        let wordTypedCorrectlyOnceFlag = true;

        for (let i = 0; i < typedWordWithTrailingSpace.length; i++) {
            totalTypedChars++;
            if (i < actualTargetSequence.length && typedWordWithTrailingSpace[i] === actualTargetSequence[i]) {
                correctChars++;
                wordCorrectCount++;
            } else {
                incorrectChars++;
                wordIncorrectCount++;
                wordTypedCorrectlyOnceFlag = false;
            }
        }

        if (typedWordWithTrailingSpace.length < actualTargetSequence.length) {
            incorrectChars += (actualTargetSequence.length - typedWordWithTrailingSpace.length);
            wordTypedCorrectlyOnceFlag = false;
        }

        if (wordTypedCorrectlyOnceFlag && typedWordWithTrailingSpace.length === actualTargetSequence.length) {
            typedCorrectlyOnce += actualTargetSequence.length;
        }

        textInput.value = '';

        currentWordSpan.classList.remove('active');
        currentWordIndex++;
        currentCharIndex = 0;

        if (currentWordIndex < currentTestContent.length) {
            const nextWordWrapper = wordsDisplay.children[currentWordIndex];
            const nextWordSpan = nextWordWrapper.querySelector('.word');
            const nextFirstLetter = nextWordWrapper.querySelector('.letter');

            if (nextWordSpan) nextWordSpan.classList.add('active');
            if (nextFirstLetter) nextFirstLetter.classList.add('current');

            scrollWordsDisplay();
        } else {
            endTest();
        }
    }
});

function scrollWordsDisplay() {
    const activeWordWrapper = wordsDisplay.querySelector('.word-wrapper .word.active');
    if (!activeWordWrapper) return;

    const displayRect = wordsDisplay.getBoundingClientRect();
    const activeWordRect = activeWordWrapper.getBoundingClientRect();

    if (activeWordRect.bottom > displayRect.bottom || activeWordRect.top < displayRect.top) {
        wordsDisplay.scrollTop = activeWordRect.top - wordsDisplay.getBoundingClientRect().top + wordsDisplay.scrollTop - (wordsDisplay.offsetHeight / 4);
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
    if (e.key === 'Tab' && document.activeElement === textInput && testFinished) {
         e.preventDefault();
         restartButton.focus();
    } else if (e.key === 'Tab' && !testActive && !testFinished && document.activeElement !== textInput) {
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