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

