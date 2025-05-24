let allWords = [];
const numbers = [];
const punctuations = [
    '.', ',', '!', '?', ':', ';', "'", '"', '/', '\\', '|',
    '(', ')', '[', ']', '{', '}', '-', '_', '=', '+', '&',
    '*', '^', '%', '$', '#', '@', '~', '`'
];

let currentTestWords = [];
let currentWordIndex = 0;
let currentCharIndex = 0;

let testActive = false;
let testFinished = false;
let timerId = null;
let timeLeft = 60;
let initialTestTime = 60;

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

let currentMode = 'words';
let currentTime = 60;

const LOCAL_STORAGE_THEME_KEY = 'monkeytypeCloneTheme';
const LOCAL_STORAGE_MAX_WPM_KEY = 'monkeytypeCloneMaxWPM';
const LOCAL_STORAGE_BEST_ACCURACY_KEY = 'monkeytypeCloneBestAccuracy';
const LOCAL_STORAGE_HISTORY_KEY = 'monkeytypeCloneHistory';

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

function generateTestContent(count = 50) {
    const generatedContent = [];
    for (let i = 0; i < count; i++) {
        let element;
        const randomChooser = Math.random();

        switch (currentMode) {
            case 'words':
                element = getRandomElement(allWords);
                break;
            case 'numbers':
                if (randomChooser < 0.7) {
                    element = getRandomElement(allWords);
                } else {
                    element = getRandomElement(numbers);
                }
                break;
            case 'punctuation':
                if (randomChooser < 0.6) {
                    element = getRandomElement(allWords);
                } else if (randomChooser < 0.85) {
                    element = getRandomElement(numbers);
                } else {
                    element = getRandomElement(punctuations);
                }
                break;
            default:
                element = getRandomElement(allWords);
                break;
        }
        generatedContent.push(element);
    }
    return generatedContent;
}

function renderContent() {
    wordsDisplay.innerHTML = '';
    currentTestWords.forEach((word, wordIndex) => {
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

        if (wordIndex < currentTestWords.length - 1) {
            const spaceSpan = document.createElement('span');
            spaceSpan.classList.add('letter', 'space');
            spaceSpan.textContent = ' ';
            wordSpan.appendChild(spaceSpan);
        }
        wordsDisplay.appendChild(wordSpan);
    });

    if (wordsDisplay.children.length > 0) {
        const firstWordElement = wordsDisplay.children[0];
        if (firstWordElement.children.length > 0) {
            firstWordElement.children[0].classList.add('current');
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
    textInput.value = '';
    textInput.disabled = false;
    wordsDisplay.classList.remove('blur-on-finish');
    liveStats.classList.remove('visible');

    correctChars = 0;
    incorrectChars = 0;
    totalTypedChars = 0;
    typedCorrectlyOnce = 0;
    startTime = 0;

    currentTestWords = generateTestContent(50);
    renderContent();

    resultsScreen.classList.add('hidden');
    document.getElementById('typing-test-area').classList.remove('hidden');

    textInput.focus();
    updateTabTitle();
    console.log("Test initialized. Mode:", currentMode, "Time:", currentTime, "s");
}

function startTimer() {
    if (timerId) clearInterval(timerId);
    startTime = Date.now();

    timerId = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
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

    updateHighScores(finalWPMValue, finalAccuracyValue);
    saveTestToHistory(finalWPMValue, finalAccuracyValue, actualTimeTaken);
    updateTabTitle();

    console.log("Test ended!");
    console.log("WPM:", finalWPMValue, "Accuracy:", finalAccuracyValue + "%");
}

function calculateWPM() {
    if (typedCorrectlyOnce === 0 || !testActive && !testFinished) return 0;
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

    if (!testActive && !testFinished) {
        textInput.focus();
    }

    if (!testActive && !testFinished && e.key.length === 1 && e.key !== ' ') {
        testActive = true;
        startTimer();
    }
});

textInput.addEventListener('input', (e) => {
    if (testFinished) return;

    const typedText = textInput.value;
    const currentWordElement = wordsDisplay.children[currentWordIndex];
    const targetWordWithSpace = currentTestWords[currentWordIndex] + (currentWordIndex < currentTestWords.length - 1 ? ' ' : '');
    const currentLetters = currentWordElement.querySelectorAll('.letter');

    totalTypedChars++;

    currentLetters.forEach(charSpan => {
        charSpan.classList.remove('correct', 'incorrect', 'current', 'extra', 'missing-char-placeholder');
    });

    for (let i = 0; i < targetWordWithSpace.length; i++) {
        const charSpan = currentLetters[i];
        if (!charSpan) continue;

        if (i < typedText.length) {
            if (typedText[i] === targetWordWithSpace[i]) {
                charSpan.classList.add('correct');
            } else {
                charSpan.classList.add('incorrect');
            }
        }
    }

    if (typedText.length > targetWordWithSpace.length) {
        for (let i = targetWordWithSpace.length; i < typedText.length; i++) {
            // This is where you'd add extra spans for `extra` characters
            // For now, we'll mark them implicitly as incorrect via counts
        }
    }

    currentCharIndex = typedText.length;

    if (currentCharIndex < currentLetters.length) {
        currentLetters[currentCharIndex].classList.add('current');
    } else if (currentLetters.length > 0) {
        currentLetters[currentLetters.length - 1].classList.add('current');
    }


    if (e.data === ' ') {
        const typedWordWithoutSpace = typedText.trim();
        const actualTargetWord = currentTestWords[currentWordIndex];

        for (let i = 0; i < typedWordWithoutSpace.length; i++) {
            if (i < actualTargetWord.length && typedWordWithoutSpace[i] === actualTargetWord[i]) {
                correctChars++;
            } else {
                incorrectChars++;
            }
        }
        if (typedWordWithoutSpace.length < actualTargetWord.length) {
            incorrectChars += (actualTargetWord.length - typedWordWithoutSpace.length);
            for (let i = typedWordWithoutSpace.length; i < actualTargetWord.length; i++) {
                if(currentLetters[i]) {
                    currentLetters[i].classList.add('missing');
                    currentLetters[i].textContent = '_';
                }
            }
        }
        if (typedWordWithoutSpace.length > actualTargetWord.length) {
            incorrectChars += (typedWordWithoutSpace.length - actualTargetWord.length);
        }

        if (typedWordWithoutSpace === actualTargetWord) {
            typedCorrectlyOnce += actualTargetWord.length + 1; // +1 for the space
        } else {
            typedCorrectlyOnce += correctChars; // Add correct chars up to this point
        }


        textInput.value = '';
        currentWordElement.classList.remove('active');
        currentWordIndex++;
        currentCharIndex = 0;

        if (currentWordIndex < currentTestWords.length) {
            const nextWordElement = wordsDisplay.children[currentWordIndex];
            nextWordElement.classList.add('active');
            if (nextWordElement.children.length > 0) {
                nextWordElement.querySelector('.letter').classList.add('current');
            }
            scrollWordsDisplay();
        } else {
            endTest();
        }
    }
});

function scrollWordsDisplay() {
    const activeWord = wordsDisplay.querySelector('.word.active');
    if (!activeWord) return;

    const displayRect = wordsDisplay.getBoundingClientRect();
    const activeWordRect = activeWord.getBoundingClientRect();

    if (activeWordRect.bottom > displayRect.bottom) {
        wordsDisplay.scrollTop += activeWordRect.height + 10;
    }
}

modeSelector.addEventListener('click', (e) => {
    if (e.target.classList.contains('mode-button')) {
        modeSelector.querySelectorAll('.mode-button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentMode = e.target.dataset.mode;
        initializeTest();
    }
});

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
    currentMode = 'words';
    currentTime = 60;
    initialTestTime = 60;
    modeSelector.querySelector('[data-mode="words"]').classList.add('active');
    modeSelector.querySelectorAll('.mode-button:not([data-mode="words"])').forEach(btn => btn.classList.remove('active'));
    timeSelector.querySelector('[data-time="60"]').classList.add('active');
    timeSelector.querySelectorAll('.time-button:not([data-time="60"])').forEach(btn => btn.classList.remove('active'));
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
    if (wpm >= currentMaxWPM && accuracy > currentBestAccuracy) {
        localStorage.setItem(LOCAL_STORAGE_BEST_ACCURACY_KEY, accuracy);
        bestAccuracy.textContent = `${accuracy}%`;
    } else if (currentMaxWPM === 0) {
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

