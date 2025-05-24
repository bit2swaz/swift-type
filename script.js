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

let correctChars = 0; // Characters typed correctly
let incorrectChars = 0; // Characters typed incorrectly (includes extra chars and wrong chars)
let totalTypedChars = 0; // All characters user attempted to type (correct + incorrect, includes extra chars)
let typedCorrectlyOnce = 0; // Characters typed correctly *on the first attempt* (for raw WPM calculation)
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

// DOM elements for smoother transitions and loading
const appWrapper = document.getElementById('app-wrapper');
const loadingOverlay = document.getElementById('loading-overlay');
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
const LOCAL_STORAGE_TIME_KEY = 'monkeytypeCloneTime'; // NEW: for saving time preference

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
        loadTimePreference(); // NEW: Load time preference
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
            console.warn("No specific content modes selected, defaulting to 'words'.");
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
            default: // Fallback just in case
                element = getRandomElement(allWords);
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

        // Add a space character as a separate span *inside* the wordSpan, except the last one
        // This makes the space part of the "word" for easier handling
        if (wordIndex < currentTestContent.length - 1) {
            const spaceSpan = document.createElement('span');
            spaceSpan.classList.add('letter', 'space'); // Added 'space' class
            spaceSpan.textContent = ' '; // Actual space character
            wordSpan.appendChild(spaceSpan);
        }
        wordsDisplay.appendChild(wordSpan);
    });

    // Highlight the first character of the first word as current
    if (wordsDisplay.children.length > 0) {
        const firstWordSpan = wordsDisplay.children[0];
        const firstLetter = firstWordSpan.querySelector('.letter');
        if (firstLetter) {
            firstLetter.classList.add('current');
            firstWordSpan.classList.add('active'); // Add active class to the word container
        }
    }

    textInput.focus();
}


function initializeTest() {
    currentWordIndex = 0;
    currentCharIndex = 0;
    testActive = false;
    testFinished = false;
    timeLeft = currentTime; // Use the loaded/selected currentTime
    initialTestTime = currentTime; // Also update initialTestTime
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

    // Hide results and show typing area
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
    const actualTimeTaken = initialTestTime - timeLeft; // If timeLeft is 0, timeTaken is initialTestTime

    finalWPM.textContent = finalWPMValue;
    finalAccuracy.textContent = `${finalAccuracyValue}%`;
    charsTyped.textContent = totalTypedChars;
    timeTaken.textContent = `${actualTimeTaken}s`;

    // Show results and hide typing area
    resultsScreen.classList.remove('hidden');
    document.getElementById('typing-test-area').classList.add('hidden'); // Add hidden class to typing area

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

textInput.addEventListener('keydown', (e) => {
    // Prevent default behavior for space and tab to control it manually
    if (e.key === ' ' || e.key === 'Tab') {
        e.preventDefault();
    }

    // Start test on first valid key press (non-space, non-control key)
    if (!testActive && !testFinished && e.key.length === 1 && e.key !== ' ' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        testActive = true;
        startTimer();
    }

    // Handle backspace logic for counts
    if (e.key === 'Backspace') {
        // If we are at the very beginning of the test or current word, don't do anything
        if (currentWordIndex === 0 && currentCharIndex === 0) return;

        // Get the current typed value
        const typedText = textInput.value;
        const currentWordSpan = wordsDisplay.children[currentWordIndex];
        
        // If we're backspacing into a previous word
        if (currentCharIndex === 0 && currentWordIndex > 0) {
            // Need to move back to the previous word
            currentWordIndex--;
            const prevWordSpan = wordsDisplay.children[currentWordIndex];
            const prevWordLetters = prevWordSpan.querySelectorAll('.letter');
            
            // Set input value to the previous word's target content (including space if applicable)
            let prevWordTarget = currentTestContent[currentWordIndex];
            if (currentWordIndex < currentTestContent.length - 1) {
                prevWordTarget += ' '; // Include the space if the previous word had one
            }
            textInput.value = prevWordTarget;
            currentCharIndex = prevWordTarget.length; // Set cursor at end of previous word

            // Remove active/current classes from old word
            currentWordSpan.classList.remove('active');
            currentWordSpan.querySelectorAll('.letter').forEach(char => char.classList.remove('current', 'correct', 'incorrect', 'extra', 'missing'));

            // Re-render and highlight previous word
            renderContent(); // Re-render to clear all states correctly and re-apply styling
            const reRenderedPrevWordSpan = wordsDisplay.children[currentWordIndex];
            reRenderedPrevWordSpan.classList.add('active'); // Activate the previous word
            const lettersInPrevWord = reRenderedPrevWordSpan.querySelectorAll('.letter');
            
            // Re-apply correct/incorrect based on the newly set input value (which is target text)
            for(let i = 0; i < prevWordTarget.length; i++) {
                 if (lettersInPrevWord[i]) {
                    lettersInPrevWord[i].classList.add('correct'); // All chars should be correct if it's the target word
                    lettersInPrevWord[i].classList.remove('incorrect', 'missing');
                 }
            }
            // Highlight the character at currentCharIndex
            if (lettersInPrevWord[currentCharIndex - 1]) {
                 lettersInPrevWord[currentCharIndex - 1].classList.add('current');
            } else if (lettersInPrevWord[lettersInPrevWord.length -1]) {
                lettersInPrevWord[lettersInPrevWord.length -1].classList.add('current');
            }
            
            // Adjust character counts - this is tricky with backspacing across words
            // For simplicity, for now, when backspacing to previous word, we reset it to fully correct state.
            // A more complex system would track per-char states, but that's beyond "quick fix".
            // For now, assume backspacing into a previous word makes it appear correctly typed.
            
            updateLiveStats();
            return; // Exit keydown, input will handle value change
        }
        
        // If backspacing within the current word
        if (currentCharIndex > 0) {
            // Update global counts based on the character being backspaced over
            const targetWord = currentTestContent[currentWordIndex];
            const targetSequence = targetWord + (currentWordIndex < currentTestContent.length - 1 ? ' ' : '');
            
            const charBeingRemovedTyped = typedText[currentCharIndex - 1];
            const charBeingRemovedTarget = targetSequence[currentCharIndex - 1];

            if (charBeingRemovedTarget && charBeingRemovedTyped === charBeingRemovedTarget) {
                correctChars = Math.max(0, correctChars - 1);
            } else if (charBeingRemovedTyped) { // It was an incorrect or extra char
                incorrectChars = Math.max(0, incorrectChars - 1);
            }
            totalTypedChars = Math.max(0, totalTypedChars - 1); // Decrement total typed
        }
    }
    updateLiveStats(); // Update live stats immediately after keydown (especially for backspace)
});


textInput.addEventListener('input', (e) => {
    if (testFinished) return;

    // Start test on first valid key press
    if (!testActive && !testFinished && e.data && e.data.length === 1 && e.data !== ' ') {
        testActive = true;
        startTimer();
    }

    const typedText = textInput.value;
    const currentWordSpan = wordsDisplay.children[currentWordIndex];
    if (!currentWordSpan) return;

    const targetWord = currentTestContent[currentWordIndex];
    const targetSequence = targetWord + (currentWordIndex < currentTestContent.length - 1 ? ' ' : '');

    const allLettersInCurrentSpan = currentWordSpan.querySelectorAll('.letter');

    // Remove all previous feedback classes and the current class for this word for dynamic re-evaluation
    allLettersInCurrentSpan.forEach(charSpan => {
        charSpan.classList.remove('correct', 'incorrect', 'current', 'missing'); // Keep extra for now, will remove later
    });
    // Remove all 'extra' spans before re-adding based on current typedText
    currentWordSpan.querySelectorAll('.extra').forEach(el => el.remove());


    // Compare typed characters with target sequence and apply classes
    for (let i = 0; i < Math.max(typedText.length, targetSequence.length); i++) {
        const charSpan = allLettersInCurrentSpan[i]; // Get the existing span for target char or null if it's an extra char

        if (i < typedText.length) { // Character has been typed
            if (i < targetSequence.length) { // Typed within target word/space length
                if (charSpan) { // Ensure span exists
                    if (typedText[i] === targetSequence[i]) {
                        charSpan.classList.add('correct');
                    } else {
                        charSpan.classList.add('incorrect');
                    }
                }
            } else { // Typed beyond targetSequence length (extra character)
                const extraCharSpan = document.createElement('span');
                extraCharSpan.classList.add('letter', 'extra');
                extraCharSpan.textContent = typedText[i];
                currentWordSpan.appendChild(extraCharSpan); // Append at the end of the word span
            }
        } else { // Character is missing (not yet typed)
            if (charSpan) { // Only apply 'missing' if there's a target char span
                charSpan.classList.add('missing');
            }
        }
    }

    // Update currentCharIndex and apply current-char highlight
    // Remove 'current' from all letters first to ensure only one is highlighted
    wordsDisplay.querySelectorAll('.letter').forEach(charSpan => charSpan.classList.remove('current'));

    currentCharIndex = typedText.length;
    let charToHighlight = null;

    // If typing beyond target, highlight the last extra char
    if (typedText.length > targetSequence.length) {
        charToHighlight = currentWordSpan.lastElementChild; // This should be the last extra char
    }
    // If at the end of the target sequence, and it's not the last word, highlight the space if it exists
    else if (typedText.length === targetSequence.length && currentWordIndex < currentTestContent.length - 1) {
        charToHighlight = allLettersInCurrentSpan[targetSequence.length - 1]; // Highlight the space
    }
    // Otherwise, highlight the next character in the target sequence
    else if (allLettersInCurrentSpan[currentCharIndex]) {
        charToHighlight = allLettersInCurrentSpan[currentCharIndex];
    }

    if (charToHighlight) {
        charToHighlight.classList.add('current');
    }

    // Live stats update
    if (testActive) {
        updateLiveStats();
    }

    // Check if the word (and its trailing space) is completed
    if (typedText.length > 0 && typedText[typedText.length - 1] === ' ') {
        advanceWord();
    }
});


function advanceWord() {
    const typedText = textInput.value; // Get the full typed text including the space
    const targetWord = currentTestContent[currentWordIndex];
    const targetSequence = targetWord + (currentWordIndex < currentTestContent.length - 1 ? ' ' : ''); // Target word + space

    let wordWasPerfect = true; // Flag for typedCorrectlyOnce
    
    // Calculate correct and incorrect characters for the just completed word (and its space)
    for (let i = 0; i < targetSequence.length; i++) {
        if (i < typedText.length && typedText[i] === targetSequence[i]) {
            correctChars++;
        } else {
            incorrectChars++;
            wordWasPerfect = false; // Mark as imperfect if any mismatch or missing char
        }
    }

    // Account for extra characters typed beyond the targetSequence length
    if (typedText.length > targetSequence.length) {
        incorrectChars += (typedText.length - targetSequence.length);
        wordWasPerfect = false; // Mark as imperfect if extra chars
    }

    // Update total typed characters for the word and its space (and any extra chars)
    totalTypedChars += Math.max(typedText.length, targetSequence.length); // Count actual typed + target characters

    // If the word (and space) was typed perfectly on this attempt
    if (wordWasPerfect) {
        typedCorrectlyOnce += targetSequence.length; // Add the length of the perfect sequence
    }

    // Clear input for next word
    textInput.value = '';

    // Deactivate current word, move to next
    const currentWordSpan = wordsDisplay.children[currentWordIndex];
    if (currentWordSpan) {
        currentWordSpan.classList.remove('active');
        // Remove 'current' class from all letters of the just-completed word
        currentWordSpan.querySelectorAll('.letter').forEach(charSpan => charSpan.classList.remove('current', 'missing'));
    }

    currentWordIndex++;
    currentCharIndex = 0;

    // Move to the next word or end test
    if (currentWordIndex < currentTestContent.length) {
        const nextWordSpan = wordsDisplay.children[currentWordIndex];
        const nextFirstLetter = nextWordSpan ? nextWordSpan.querySelector('.letter') : null;

        if (nextWordSpan) nextWordSpan.classList.add('active'); // Activate the new current word
        if (nextFirstLetter) nextFirstLetter.classList.add('current'); // Highlight its first char

        scrollWordsDisplay();
    } else {
        endTest();
    }
    updateLiveStats(); // Update stats immediately after word advance
}


function scrollWordsDisplay() {
    const currentWordElement = wordsDisplay.children[currentWordIndex];
    if (!currentWordElement) return;

    // Get the height of the wordsDisplay container
    const containerHeight = wordsDisplay.clientHeight;
    // Get the current scroll position of the wordsDisplay container
    const currentScrollTop = wordsDisplay.scrollTop;
    // Get the top position of the active word relative to its parent (wordsDisplay)
    const activeWordOffsetTop = currentWordElement.offsetTop;
    // Get the bottom position of the active word relative to its parent (wordsDisplay)
    const activeWordOffsetBottom = activeWordOffsetTop + currentWordElement.offsetHeight;

    // Calculate roughly the line height for scrolling buffer
    const firstLetter = wordsDisplay.querySelector('.letter');
    const lineHeight = firstLetter ? firstLetter.offsetHeight : 30; // Default if no letter yet


    // If the active word's bottom is below the visible area, scroll down.
    if (activeWordOffsetBottom > currentScrollTop + containerHeight) {
        // Scroll enough to bring the current word's line to the top of the display
        wordsDisplay.scrollTop = activeWordOffsetTop;
    }
    // If the active word's top is above the visible area, scroll up (e.g., after backspacing across lines)
    else if (activeWordOffsetTop < currentScrollTop) {
        wordsDisplay.scrollTop = activeWordOffsetTop;
    }
}


modeSelector.addEventListener('click', (e) => {
    if (e.target.classList.contains('mode-button')) {
        const mode = e.target.dataset.mode;
        activeModes[mode] = !activeModes[mode];

        // Ensure at least one mode is active
        if (!activeModes.words && !activeModes.numbers && !activeModes.punctuation) {
            activeModes.words = true; // Default to words if all unselected
        }

        // Visually update buttons
        modeSelector.querySelectorAll('.mode-button').forEach(btn => {
            if (activeModes[btn.dataset.mode]) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        localStorage.setItem(LOCAL_STORAGE_ACTIVE_MODES_KEY, JSON.stringify(activeModes));
        initializeTest(); // Re-initialize test with new modes
    }
});

function loadActiveModes() {
    const savedModes = localStorage.getItem(LOCAL_STORAGE_ACTIVE_MODES_KEY);
    if (savedModes) {
        activeModes = JSON.parse(savedModes);
    } else {
        activeModes = { words: true, numbers: false, punctuation: false }; // Default if no preference saved
    }

    // Visually update buttons based on loaded state
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
        initialTestTime = currentTime; // Make sure this is also updated
        localStorage.setItem(LOCAL_STORAGE_TIME_KEY, currentTime.toString()); // NEW: Save time
        initializeTest();
    }
});

// NEW: Load time preference
function loadTimePreference() {
    const savedTime = localStorage.getItem(LOCAL_STORAGE_TIME_KEY);
    if (savedTime) {
        currentTime = parseInt(savedTime);
    } else {
        currentTime = 60; // Default if no preference saved
    }
    initialTestTime = currentTime; // Set initial time from preference

    // Visually update time buttons
    timeSelector.querySelectorAll('.time-button').forEach(btn => {
        if (parseInt(btn.dataset.time) === currentTime) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

retryButton.addEventListener('click', () => {
    initializeTest();
});

restartButton.addEventListener('click', () => {
    // Reset modes and time to default
    activeModes = { words: true, numbers: false, punctuation: false };
    currentTime = 60;
    initialTestTime = 60;

    // Save reset preferences to localStorage
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_MODES_KEY, JSON.stringify(activeModes));
    localStorage.setItem(LOCAL_STORAGE_TIME_KEY, currentTime.toString());

    // Visually update buttons to default
    modeSelector.querySelector('[data-mode="words"]').classList.add('active');
    modeSelector.querySelectorAll('.mode-button:not([data-mode="words"])').forEach(btn => btn.classList.remove('active'));
    timeSelector.querySelector('[data-time="60"]').classList.add('active');
    timeSelector.querySelectorAll('.time-button:not([data-time="60"])').forEach(btn => btn.classList.remove('active'));

    initializeTest(); // Start a new test with default settings
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
    // Update best accuracy only if WPM is equal or better, and accuracy is better
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
    if (history.length > 10) { // Keep last 10 entries
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

// Initial call to load all words and set up the test environment
loadAllWords();

document.addEventListener('click', (e) => {
    // If click is not inside controls or results, refocus the input
    if (!testFinished && !e.target.closest('.controls') && !e.target.closest('#results-screen')) {
        textInput.focus();
    }
});

document.addEventListener('keyup', (e) => {
    // Escape key to restart after test finished
    if (e.key === 'Escape' && testFinished) {
        restartButton.click();
    }
    // Enter key to restart after test finished, only if results screen is visible
    if (e.key === 'Enter' && testFinished && !resultsScreen.classList.contains('hidden')) {
        e.preventDefault(); // Prevent new line in input if it was visible
        restartButton.click();
    }
    // Tab key to refocus input if it's not focused and test is not active/finished
    else if (e.key === 'Tab' && !testActive && !testFinished && document.activeElement !== textInput) {
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