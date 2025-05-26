// --- DOM Elements ---
const wordsDisplay = document.getElementById('words-display');
const textInput = document.getElementById('text-input');
const timerDisplay = document.getElementById('timer');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const restartBtn = document.getElementById('restart-btn'); // Main restart button

const includeNumbersCheckbox = document.getElementById('include-numbers');
const includePunctuationCheckbox = document.getElementById('include-punctuation');
const modeTimeBtn = document.getElementById('mode-time');
const modeWordsBtn = document.getElementById('mode-words');
const timeOptionsDiv = document.getElementById('time-options');
const wordsOptionsDiv = document.getElementById('words-options');

const caret = document.getElementById('caret');

// NEW: Results Screen DOM Elements
const resultsScreen = document.getElementById('results-screen');
const finalWpmDisplay = document.getElementById('final-wpm-display');
const finalAccuracyDisplay = document.getElementById('final-accuracy-display');
const finalRawWpmDisplay = document.getElementById('final-raw-wpm-display');
const correctLettersDisplay = document.getElementById('correct-letters-display');
const incorrectLettersDisplay = document.getElementById('incorrect-letters-display');
const extraLettersDisplay = document.getElementById('extra-letters-display');
const resultsRestartBtn = document.getElementById('results-restart-btn'); // New test button on results screen

// Existing DOM Elements that need to be hidden/shown
const settingsPanel = document.querySelector('.settings-panel');
const testArea = document.querySelector('.test-area');
const liveResults = document.querySelector('.results');


// --- Game State Variables ---
let words = [];
let currentWordIndex = 0;
let currentCharIndex = 0;
let startTime;
let timerInterval;
let totalCharactersTyped = 0;
let correctCharactersTyped = 0;
let testStarted = false;
let testFinished = false;

// Test settings
let currentTestMode = 'time'; // 'time' or 'words'
let currentTestDuration = 30; // default to 30 seconds
let currentWordCount = 50; // default to 50 words
let includeNumbers = false;
let includePunctuation = false;

// NEW: Metrics for Results Screen
let grossWPM = 0;
let rawCorrectCharacters = 0;
let rawIncorrectCharacters = 0;
let rawExtraCharacters = 0;


// --- Word Lists (significantly expanded) ---
const commonWords = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "is", "are", "was", "were", "has", "had", "did", "been", "being", "does",
  "am", "shall", "may", "might", "must", "should", "let", "such", "every", "very",
  "right", "off", "still", "might", "place", "around", "long", "too", "many", "where",
  "through", "much", "before", "great", "help", "same", "few", "own", "those", "both",
  "between", "feel", "high", "something", "always", "each", "next", "while", "last", "never",
  "start", "leave", "keep", "stop", "open", "begin", "seem", "try", "ask", "move",
  "talk", "turn", "show", "run", "live", "call", "read", "write", "hear", "stand",
  "lose", "pay", "meet", "include", "continue", "believe", "change", "under", "build", "stay",
  "grow", "fall", "cut", "break", "win", "teach", "learn", "drive", "walk", "wait",
  "watch", "sit", "speak", "spend", "carry", "buy", "sell", "send", "receive", "cook",
  "clean", "play", "add", "remove", "write", "draw", "close", "open", "throw", "catch",
  "choose", "decide", "love", "hate", "enjoy", "wish", "hope", "care", "miss", "need",
  "prefer", "prepare", "remember", "forget", "agree", "disagree", "share", "plan", "finish", "start",
  "win", "lose", "follow", "lead", "pass", "fail", "stay", "enter", "exit", "rest",
  "rise", "drop", "send", "return", "count", "measure", "weigh", "check", "fix", "create",
  "design", "build", "break", "join", "connect", "cut", "paste", "copy", "push", "pull",
  "drive", "ride", "fly", "swim", "climb", "jump", "run", "walk", "stand", "sit",
  "sleep", "wake", "dream", "think", "know", "guess", "ask", "answer", "say", "speak",
  "talk", "listen", "hear", "see", "look", "watch", "show", "hide", "find", "lose",
  "open", "close", "lock", "unlock", "start", "stop", "begin", "end", "finish", "continue",
  "learn", "teach", "study", "understand", "explain", "read", "write", "spell", "count", "draw",
  "paint", "sing", "dance", "play", "work", "rest", "travel", "stay", "live", "die",
  "love", "hate", "like", "prefer", "choose", "decide", "need", "want", "wish", "hope",
  "help", "support", "care", "feel", "touch", "hold", "let", "keep", "give", "take",
  "bring", "carry", "send", "show", "offer", "ask", "answer", "tell", "call", "name",
  "use", "make", "do", "have", "get", "go", "come", "leave", "arrive", "return",
  "put", "set", "place", "move", "stay", "wait", "watch", "look", "see", "hear",
  "listen", "speak", "say", "tell", "ask", "answer", "write", "draw", "paint",
  "cook", "eat", "drink", "buy", "sell", "pay", "cost", "spend", "save", "earn",
  "build", "break", "repair", "fix", "clean", "wash", "dry", "open", "close", "lock",
  "push", "pull", "throw", "catch", "climb", "jump", "run", "walk", "drive", "ride",
  "fly", "swim", "sit", "stand", "sleep", "wake", "dream", "rest", "work", "play", "study", "learn",
  "teach", "train", "practice", "try", "test", "pass", "fail", "win", "lose", "fight",
  "argue", "agree", "disagree", "help", "support", "save", "rescue", "protect", "defend", "attack",
  "hit", "kick", "throw", "catch", "push", "pull", "lift", "drop", "carry", "bring",
  "take", "get", "put", "set", "place", "keep", "hold", "open", "close", "lock",
  "unlock", "find", "lose", "search", "look", "watch", "see", "hear", "listen", "speak",
  "say", "tell", "ask", "answer", "write", "read", "draw", "paint", "create", "build",
  "make", "do", "use", "need", "want", "like", "love", "hate", "enjoy", "prefer",
  "think", "believe", "know", "understand", "remember", "forget", "plan", "decide", "choose", "hope",
  "wish", "learn", "teach", "feel", "touch", "hold", "smell", "taste", "see", "hear"
];

const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const punctuations = [",", ".", ";", ":", "'", '"', "(", ")", "[", "]", "{", "}", "-", "_", "=", "+", "/", "?", "!", "@", "#", "$", "%", "^", "&", "*", "`", "~", "<", ">", "|", "\\"];


// --- Functions ---

function generateWords() {
    console.log("generateWords() called.");

    const totalWordsToGenerate = currentTestMode === 'words' ? currentWordCount : 200;

    const sanitizedCommonWords = commonWords
        .map(word => word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase())
        .filter(word => word.length > 0);

    let wordsToUse = [];
    const nonWordProportion = 0.35; // Target up to 35% non-words

    let numNumbersNeeded = 0;
    let numPunctuationsNeeded = 0;
    let numCommonWordsNeeded = totalWordsToGenerate;

    if (includeNumbers && includePunctuation) {
        numNumbersNeeded = Math.floor(totalWordsToGenerate * (nonWordProportion / 2));
        numPunctuationsNeeded = Math.floor(totalWordsToGenerate * (nonWordProportion / 2));
        numCommonWordsNeeded = totalWordsToGenerate - numNumbersNeeded - numPunctuationsNeeded;
    } else if (includeNumbers) {
        numNumbersNeeded = Math.floor(totalWordsToGenerate * nonWordProportion);
        numCommonWordsNeeded = totalWordsToGenerate - numNumbersNeeded;
    } else if (includePunctuation) {
        numPunctuationsNeeded = Math.floor(totalWordsToGenerate * nonWordProportion);
        numCommonWordsNeeded = totalWordsToGenerate - numPunctuationsNeeded;
    }

    numNumbersNeeded = Math.min(numNumbersNeeded, numbers.length);
    numPunctuationsNeeded = Math.min(numPunctuationsNeeded, punctuations.length);
    numCommonWordsNeeded = totalWordsToGenerate - numNumbersNeeded - numPunctuationsNeeded;
    numCommonWordsNeeded = Math.min(numCommonWordsNeeded, sanitizedCommonWords.length);

    function getShuffledSlice(arr, count) {
        if (arr.length === 0 || count <= 0) return [];
        let result = [];
        if (count > arr.length) {
            while(result.length < count) {
                result.push(...arr.sort(() => 0.5 - Math.random()));
            }
            return result.slice(0, count);
        }
        return [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
    }

    wordsToUse = wordsToUse.concat(getShuffledSlice(sanitizedCommonWords, numCommonWordsNeeded));
    wordsToUse = wordsToUse.concat(getShuffledSlice(numbers, numNumbersNeeded));
    wordsToUse = wordsToUse.concat(getShuffledSlice(punctuations, numPunctuationsNeeded));

    while(wordsToUse.length < totalWordsToGenerate && sanitizedCommonWords.length > 0) {
        wordsToUse.push(sanitizedCommonWords[Math.floor(Math.random() * sanitizedCommonWords.length)]);
    }

    words = wordsToUse.sort(() => 0.5 - Math.random());
    words = words.slice(0, totalWordsToGenerate);

    console.log("Words generated. Total words:", words.length);
    console.log(`Breakdown: Common Words: ${numCommonWordsNeeded}, Numbers: ${numNumbersNeeded}, Punctuation: ${numPunctuationsNeeded}`);
    console.log("First 10 generated words:", words.slice(0, 10));
}

function renderWords() {
    console.log("renderWords() called. Words array length:", words.length);

    // Remove all existing word spans, but keep the caret
    // It's safer to clear the entire wordsDisplay content except for the caret itself
    // Or, even better, recreate it and prepend the caret.
    // For now, let's stick to your current approach of removing children.
    const existingWordSpans = wordsDisplay.querySelectorAll('.word');
    console.log("Found existing word spans:", existingWordSpans.length);
    for (let i = existingWordSpans.length - 1; i >= 0; i--) {
        existingWordSpans[i].remove();
    }
    console.log("Existing word spans removed.");

    // Ensure caret is the first child (if it somehow got moved)
    if (wordsDisplay.firstChild !== caret) {
        wordsDisplay.prepend(caret);
        console.log("Caret prepended to wordsDisplay.");
    } else {
        console.log("Caret is already first child.");
    }

    // Append new words
    if (words.length === 0) {
        console.error("Error: words array is empty in renderWords(). Cannot render.");
        return; // Exit if no words to render
    }

    words.forEach((word, wordIndex) => {
        const wordSpan = document.createElement('span');
        wordSpan.classList.add('word');
        word.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.classList.add('character');
            charSpan.textContent = char;
            wordSpan.appendChild(charSpan);
        });
        wordsDisplay.appendChild(wordSpan);

        // Add a space span after each word, except the last one
        if (wordIndex < words.length - 1) {
            const spaceSpan = document.createElement('span');
            spaceSpan.classList.add('character', 'space');
            spaceSpan.textContent = ' ';
            wordSpan.appendChild(spaceSpan);
        }
    });
    console.log("All words appended to wordsDisplay.");

    updateCaretPosition(); // Position the caret after words are rendered
    console.log("updateCaretPosition called.");
}

function updateCaretPosition() {
    const allWordElements = wordsDisplay.querySelectorAll('.word');
    const currentWordElement = allWordElements[currentWordIndex];

    if (!currentWordElement) {
        // If no more words, hide caret
        caret.style.display = 'none';
        return;
    }

    caret.style.display = 'block'; // Ensure caret is visible

    let targetCharacterSpan = null;
    let charactersInCurrentWord = Array.from(currentWordElement.children);

    if (currentCharIndex < charactersInCurrentWord.length) {
        targetCharacterSpan = charactersInCurrentWord[currentCharIndex];
    } else {
        // If currentCharIndex is at the end of the word (meaning we're effectively on the space)
        // Position caret after the last character of the word
        const lastCharOfWord = charactersInCurrentWord[charactersInCurrentWord.length - 1];
        if (lastCharOfWord) {
            targetCharacterSpan = lastCharOfWord;
        }
    }

    if (targetCharacterSpan) {
        const rect = targetCharacterSpan.getBoundingClientRect();
        const displayRect = wordsDisplay.getBoundingClientRect();

        const caretLeft = rect.left - displayRect.left + wordsDisplay.scrollLeft;
        const caretTop = rect.top - displayRect.top + wordsDisplay.scrollTop;

        // Adjust caret position for when it's at the end of a word (on the space)
        const currentWordText = words[currentWordIndex];
        let offsetX = 0;
        if (currentCharIndex === currentWordText.length) { // We are on the "virtual" space after the word
             // If there's a next word, get its first char's width, otherwise just the last char of current word
            const nextWordElement = allWordElements[currentWordIndex + 1];
            if (nextWordElement && nextWordElement.children[0]) {
                offsetX = nextWordElement.children[0].getBoundingClientRect().left - rect.right;
                 // If the next word exists, the space width is the difference between current word's end and next word's start
            } else if (rect.width > 0) { // If it's the last word, just use a typical character width
                offsetX = rect.width * 0.5; // Estimate space width
            }
        }
        
        caret.style.transform = `translate(${caretLeft + offsetX}px, ${caretTop}px)`;
        // console.log(`Caret moved to: left=${caretLeft + offsetX}px, top=${caretTop}px`);

        scrollWordsDisplay(rect.top, rect.height);
    } else {
        console.warn("No target character span found for caret positioning.");
    }
}


function scrollWordsDisplay(charTop, charHeight) {
    const wordsDisplayRect = wordsDisplay.getBoundingClientRect();
    const wordsDisplayScrollTop = wordsDisplay.scrollTop;

    const relativeCharTop = charTop - wordsDisplayRect.top;

    const scrollBuffer = 30;

    if (relativeCharTop < scrollBuffer) {
        wordsDisplay.scrollTop = wordsDisplayScrollTop + relativeCharTop - scrollBuffer;
    }
    else if (relativeCharTop + charHeight > wordsDisplayRect.height - scrollBuffer) {
        wordsDisplay.scrollTop = wordsDisplayScrollTop + (relativeCharTop + charHeight - (wordsDisplayRect.height - scrollBuffer));
    }
}


function startTimer() {
    startTime = new Date().getTime();
    timerInterval = setInterval(updateTimer, 1000);
    console.log("Timer started.");
}

function stopTimer() {
    clearInterval(timerInterval);
    console.log("Timer stopped.");
}

function updateTimer() {
    const currentTime = new Date().getTime();
    const elapsedTime = Math.floor((currentTime - startTime) / 1000);
    const remainingTime = currentTestDuration - elapsedTime;

    timerDisplay.textContent = `Time: ${elapsedTime}s`;

    if (currentTestMode === 'time' && remainingTime <= 0) {
        endTest();
    } else {
        calculateMetrics();
    }
}

function endTest() {
    console.log("Test ended.");
    stopTimer();
    testFinished = true;
    textInput.disabled = true;
    textInput.blur();
    caret.style.display = 'none';

    // Calculate final metrics for the results screen
    calculateFinalMetrics();
    showResultsScreen();
}

function resetGame() {
    console.log("resetGame() called.");
    stopTimer();
    currentWordIndex = 0;
    currentCharIndex = 0;
    totalCharactersTyped = 0;
    correctCharactersTyped = 0;
    rawCorrectCharacters = 0; // Reset for new test
    rawIncorrectCharacters = 0; // Reset for new test
    rawExtraCharacters = 0; // Reset for new test
    testStarted = false;
    testFinished = false;

    timerDisplay.textContent = `Time: 0s`; // Should show 0s at start
    wpmDisplay.textContent = 'WPM: 0';
    accuracyDisplay.textContent = 'Accuracy: 0%';
    textInput.value = '';
    textInput.disabled = false;
    textInput.focus();
    wordsDisplay.scrollTop = 0;

    // Show typing interface, hide results screen
    hideResultsScreen();
    showTypingInterface();

    generateWords();
    renderWords();
    console.log("resetGame() finished.");
}

function calculateMetrics() {
    if (!testStarted || testFinished) return;

    const currentTime = new Date().getTime();
    const elapsedTimeInSeconds = Math.floor((currentTime - startTime) / 1000);
    const elapsedTimeInMinutes = elapsedTimeInSeconds / 60;

    let currentTypedWord = textInput.value;
    const targetWord = words[currentWordIndex] || '';

    // Calculate live WPM (based on correct words, or corrected characters)
    // Let's keep it based on totalCorrectCharactersTyped for consistency with accuracy
    // A "word" is 5 characters including space.
    const calculatedWPM = elapsedTimeInMinutes > 0 ? Math.round((correctCharactersTyped + getCorrectCharsInCurrentWord()) / 5 / elapsedTimeInMinutes) : 0;
    wpmDisplay.textContent = `WPM: ${calculatedWPM}`;

    // Calculate live Accuracy
    const totalCharsCurrent = totalCharactersTyped + currentTypedWord.length;
    const correctCharsCurrent = correctCharactersTyped + getCorrectCharsInCurrentWord();
    const calculatedAccuracy = totalCharsCurrent > 0 ? Math.round((correctCharsCurrent / totalCharsCurrent) * 100) : 0;
    accuracyDisplay.textContent = `Accuracy: ${calculatedAccuracy}%`;
}

// Helper to get correct characters in the currently typed word
function getCorrectCharsInCurrentWord() {
    const typedText = textInput.value;
    const targetWord = words[currentWordIndex] || '';
    let correctCount = 0;
    for (let i = 0; i < typedText.length && i < targetWord.length; i++) {
        if (typedText[i] === targetWord[i]) {
            correctCount++;
        }
    }
    return correctCount;
}

// NEW: Function to calculate and display final metrics
function calculateFinalMetrics() {
    const finalElapsedTimeInSeconds = Math.floor((new Date().getTime() - startTime) / 1000);
    const finalElapsedTimeInMinutes = finalElapsedTimeInSeconds / 60;

    // Raw WPM (Gross WPM): (All typed characters / 5) / time
    grossWPM = finalElapsedTimeInMinutes > 0 ? Math.round((rawCorrectCharacters + rawIncorrectCharacters + rawExtraCharacters) / 5 / finalElapsedTimeInMinutes) : 0;
    
    // Net WPM (Adjusted WPM): (Correct characters / 5) / time
    const netWPM = finalElapsedTimeInMinutes > 0 ? Math.round((rawCorrectCharacters / 5) / finalElapsedTimeInMinutes) : 0;

    // Final Accuracy: (Correct characters / Total typed characters) * 100
    const finalTotalTypedCharacters = rawCorrectCharacters + rawIncorrectCharacters + rawExtraCharacters;
    const finalAccuracy = finalTotalTypedCharacters > 0 ? Math.round((rawCorrectCharacters / finalTotalTypedCharacters) * 100) : 0;

    finalWpmDisplay.textContent = netWPM;
    finalAccuracyDisplay.textContent = `${finalAccuracy}%`;
    finalRawWpmDisplay.textContent = grossWPM;
    correctLettersDisplay.textContent = rawCorrectCharacters;
    incorrectLettersDisplay.textContent = rawIncorrectCharacters;
    extraLettersDisplay.textContent = rawExtraCharacters;
}

// NEW: Functions to show/hide the results screen and typing interface
function showResultsScreen() {
    settingsPanel.classList.add('hidden');
    testArea.classList.add('hidden');
    liveResults.classList.add('hidden');
    restartBtn.classList.add('hidden'); // Hide the main restart button

    // Give a small delay for the fade-out transition to start before showing results
    setTimeout(() => {
        resultsScreen.classList.add('show');
    }, 500); // This delay should match or be slightly longer than the CSS transition duration
}

function hideResultsScreen() {
    resultsScreen.classList.remove('show');
}

function showTypingInterface() {
    // Give a small delay for the results screen fade-out to complete before showing typing interface
    setTimeout(() => {
        settingsPanel.classList.remove('hidden');
        testArea.classList.remove('hidden');
        liveResults.classList.remove('hidden');
        restartBtn.classList.remove('hidden'); // Show the main restart button
    }, 500); // This delay should match or be slightly longer than the CSS transition duration
}


// --- Event Listeners ---

// Settings Listeners
includeNumbersCheckbox.addEventListener('change', () => {
    includeNumbers = includeNumbersCheckbox.checked;
    resetGame();
});

includePunctuationCheckbox.addEventListener('change', () => {
    includePunctuation = includePunctuationCheckbox.checked;
    resetGame();
});

modeTimeBtn.addEventListener('click', () => {
    if (currentTestMode === 'words') {
        currentTestMode = 'time';
        modeTimeBtn.classList.add('active');
        modeWordsBtn.classList.remove('active');
        timeOptionsDiv.classList.remove('hidden');
        wordsOptionsDiv.classList.add('hidden');
        if (!timeOptionsDiv.querySelector('.option-btn.active')) {
            timeOptionsDiv.querySelector('.option-btn[data-value="30"]').classList.add('active'); // Default to 30s
            currentTestDuration = 30; // Set duration
        } else {
            currentTestDuration = parseInt(timeOptionsDiv.querySelector('.option-btn.active').dataset.value);
        }
        resetGame();
    }
});

modeWordsBtn.addEventListener('click', () => {
    if (currentTestMode === 'time') {
        currentTestMode = 'words';
        modeWordsBtn.classList.add('active');
        modeTimeBtn.classList.remove('active');
        wordsOptionsDiv.classList.remove('hidden');
        timeOptionsDiv.classList.add('hidden');
        if (!wordsOptionsDiv.querySelector('.option-btn.active')) {
            wordsOptionsDiv.querySelector('.option-btn[data-value="50"]').classList.add('active'); // Default to 50 words
            currentWordCount = 50; // Set word count
        } else {
            currentWordCount = parseInt(wordsOptionsDiv.querySelector('.option-btn.active').dataset.value);
        }
        resetGame();
    }
});

timeOptionsDiv.addEventListener('click', (e) => {
    if (e.target.classList.contains('option-btn')) {
        timeOptionsDiv.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentTestDuration = parseInt(e.target.dataset.value);
        resetGame();
    }
});

wordsOptionsDiv.addEventListener('click', (e) => {
    if (e.target.classList.contains('option-btn')) {
        wordsOptionsDiv.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentWordCount = parseInt(e.target.dataset.value);
        resetGame();
    }
});


textInput.addEventListener('keydown', (e) => {
    if (testFinished) {
        e.preventDefault();
        return;
    }

    if (e.key === ' ' && textInput.value.length === 0 && !testStarted) {
        e.preventDefault(); // Prevent starting with a space
        return;
    }

    // Allow backspace for corrections
    if (e.key === 'Backspace') {
        // We handle backspace for visual feedback in the 'input' event,
        // but here we ensure it doesn't interfere with starting the test.
        return;
    }
    
    // Prevent space at the beginning of the line
    if (textInput.value.length === 0 && e.key === ' ') {
        e.preventDefault();
        return;
    }

    // Start timer only on first actual character input
    if (!testStarted && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey && !e.repeat) {
        testStarted = true;
        startTimer();
    }
});

textInput.addEventListener('input', (e) => {
    if (!testStarted || testFinished) return;

    const typedText = textInput.value;
    const currentWordElement = wordsDisplay.querySelectorAll('.word')[currentWordIndex];
    const targetWord = words[currentWordIndex];

    if (!currentWordElement || !targetWord) {
        // This can happen if test ends and an input event is still queued, or words array is empty.
        // If in words mode and somehow past the words, and test hasn't finished, end it.
        if (currentTestMode === 'words' && currentWordIndex >= words.length && !testFinished) {
            endTest();
        }
        return;
    }

    const targetWordLength = targetWord.length;

    // Remove existing 'extra' characters first
    Array.from(currentWordElement.querySelectorAll('.character.extra')).forEach(span => span.remove());

    let newRawCorrectCharactersInWord = 0;
    let newRawIncorrectCharactersInWord = 0;
    let newRawExtraCharactersInWord = 0;

    // Loop through characters in the current word
    for (let i = 0; i < targetWordLength; i++) {
        const targetChar = targetWord[i];
        const typedChar = typedText[i];
        const charSpan = currentWordElement.children[i]; // Get the original character span

        charSpan.classList.remove('correct', 'incorrect'); // Reset classes

        if (typedChar === undefined) {
            // Nothing typed yet for this character, no class needed
        } else if (typedChar === targetChar) {
            charSpan.classList.add('correct');
        } else {
            charSpan.classList.add('incorrect');
        }
    }

    // Handle extra characters typed by the user
    if (typedText.length > targetWordLength) {
        for (let i = targetWordLength; i < typedText.length; i++) {
            const extraCharSpan = document.createElement('span');
            extraCharSpan.classList.add('character', 'extra', 'incorrect'); // Mark as incorrect
            extraCharSpan.textContent = typedText[i];
            currentWordElement.appendChild(extraCharSpan);
        }
    }

    // Calculate raw metrics for the current word for the results screen
    // This is done on each input to be precise for final calculation
    for (let i = 0; i < Math.max(typedText.length, targetWordLength); i++) {
        const targetChar = targetWord[i];
        const typedChar = typedText[i];

        if (typedChar === undefined) {
            // User hasn't typed this far yet, or backspaced over it. Do nothing for raw counts.
        } else if (targetChar === undefined) {
            // Typed character exists but no corresponding target character (it's an extra character)
            newRawExtraCharactersInWord++;
        } else if (typedChar === targetChar) {
            // Typed character matches target character
            newRawCorrectCharactersInWord++;
        } else {
            // Typed character does not match target character
            newRawIncorrectCharactersInWord++;
        }
    }

    // This is important: Only process word completion on space or enter
    // The previous logic for `typedText.endsWith(' ')` was causing issues with `currentCharIndex` and `totalCharactersTyped`
    // We will now handle space as the official word separator.
    if (e.inputType === 'insertText' && typedText.endsWith(' ') || e.inputType === 'insertLineBreak') { // Handle space or Enter key
        e.preventDefault(); // Prevent space from being added to input field

        const finalTypedWordForCurrentWord = typedText.trim(); // Get the word without trailing space
        const currentTargetWord = words[currentWordIndex];

        // Process characters for the word that was just completed
        for (let i = 0; i < Math.max(finalTypedWordForCurrentWord.length, currentTargetWord.length); i++) {
            const targetChar = currentTargetWord[i];
            const typedChar = finalTypedWordForCurrentWord[i];

            if (typedChar === undefined) {
                // User typed less than the target word
                // No action needed for raw counts, it's considered missed, not incorrect/extra in this context.
            } else if (targetChar === undefined) {
                rawExtraCharacters++; // Extra character beyond the target word length
            } else if (typedChar === targetChar) {
                rawCorrectCharacters++; // Correct character
            } else {
                rawIncorrectCharacters++; // Incorrect character
            }
        }
        
        // Add the space character to total characters typed and track correctness
        if (typedText.endsWith(' ')) {
            totalCharactersTyped++; // Count the space as a character typed
            if (finalTypedWordForCurrentWord.length === currentTargetWord.length && typedText[typedText.length - 1] === ' ') {
                // If the word was perfectly typed and followed by a space, consider the space correct
                correctCharactersTyped++;
            } else {
                // If the word was typed incorrectly, or extra chars were added, the space might be "incorrect"
                // For simplicity in WPM/Accuracy, we primarily count correct WORD characters.
                // The main count `correctCharactersTyped` for WPM is based on characters that match the target word.
                // We're already updating `rawCorrectCharacters` etc for detailed metrics.
            }
        }

        // Move to the next word
        currentWordIndex++;
        currentCharIndex = 0;
        textInput.value = ''; // Clear input field

        if (currentTestMode === 'words' && currentWordIndex >= words.length) {
            endTest();
        } else {
            updateCaretPosition(); // Move caret to the start of the next word
        }
    } else {
        // For regular character input (not space/enter)
        currentCharIndex = typedText.length;
        updateCaretPosition();
        calculateMetrics(); // Update live WPM/Accuracy on every character
    }
});


restartBtn.addEventListener('click', resetGame);
resultsRestartBtn.addEventListener('click', resetGame); // New listener for the results screen restart button


// --- Initialize the game on load ---
// Set initial active states for buttons
document.querySelector('#time-options .option-btn[data-value="30"]').classList.add('active'); // Default to 30s
document.querySelector('#mode-time').classList.add('active');
resetGame(); // Initial setup

window.addEventListener('load', () => {
    textInput.focus();
});

document.addEventListener('click', (e) => {
    // If click is outside of input, restart, words display, or settings panel, re-focus input
    if (!textInput.contains(e.target) &&
        !restartBtn.contains(e.target) &&
        !resultsRestartBtn.contains(e.target) && // Include new restart button
        !wordsDisplay.contains(e.target) &&
        !settingsPanel.contains(e.target) && // Ensure clicks on settings don't lose focus
        !liveResults.contains(e.target) && // Clicks on live metrics shouldn't lose focus
        !resultsScreen.contains(e.target) // Clicks on results screen shouldn't lose focus during transition
        ) {
        textInput.focus();
    }
});

wordsDisplay.addEventListener('click', () => {
    textInput.focus();
});