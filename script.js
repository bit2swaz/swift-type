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

