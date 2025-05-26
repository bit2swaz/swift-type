// --- DOM Elements ---
const wordsDisplay = document.getElementById('words-display');
const textInput = document.getElementById('text-input');
const timerDisplay = document.getElementById('timer');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const restartBtn = document.getElementById('restart-btn');

const includeNumbersCheckbox = document.getElementById('include-numbers');
const includePunctuationCheckbox = document.getElementById('include-punctuation');
const modeTimeBtn = document.getElementById('mode-time');
const modeWordsBtn = document.getElementById('mode-words');
const timeOptionsDiv = document.getElementById('time-options');
const wordsOptionsDiv = document.getElementById('words-options');

const caret = document.getElementById('caret'); // New DOM element for the caret

// WHERE: New DOM elements for UI hiding
const settingsPanel = document.querySelector('.settings-panel'); // WHY: To hide/show settings
const resultsSection = document.querySelector('.results');     // WHY: To hide/show results

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
    "listen", "speak", "say", "tell", "ask", "answer", "read", "write", "draw", "paint",
    "cook", "eat", "drink", "buy", "sell", "pay", "cost", "spend", "save", "earn",
    "build", "break", "repair", "fix", "clean", "wash", "dry", "open", "close", "lock",
    "push", "pull", "throw", "catch", "climb", "jump", "run", "walk", "drive", "ride",
    "fly", "swim", "sit", "stand", "sleep", "wake", "dream", "think", "believe", "know",
    "understand", "learn", "teach", "remember", "forget", "plan", "decide", "choose", "hope",
    "wish", "need", "want", "like", "love", "hate", "enjoy", "prefer", "feel", "touch", "hold",
    "see", "hear", "listen", "smell", "taste", "look", "watch", "speak", "talk", "say",
    "tell", "ask", "answer", "shout", "whisper", "laugh", "cry", "smile", "frown", "yell",
    "run", "walk", "jog", "sprint", "jump", "hop", "skip", "climb", "crawl", "swim",
    "dive", "fly", "ride", "drive", "travel", "move", "stay", "wait", "sit", "stand",
    "fall", "rise", "wake", "sleep", "dream", "rest", "work", "play", "study", "learn",
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

// WHAT: New functions to show/hide UI elements
// WHERE: Defined here for clarity
function showUI() {
    // WHY: Remove 'hidden' class to make settings panel and results section visible
    settingsPanel.classList.remove('hidden');
    resultsSection.classList.remove('hidden');
    // If you had a 'container' element that also needed to hide, you'd unhide it here too:
    // document.querySelector('.container').classList.remove('hidden');
}

function hideUI() {
    // WHY: Add 'hidden' class to make settings panel and results section disappear
    settingsPanel.classList.add('hidden');
    resultsSection.classList.add('hidden');
    // If you had a 'container' element that also needed to hide, you'd hide it here too:
    // document.querySelector('.container').classList.add('hidden');
}


function generateWords() {
    console.log("generateWords() called.");

    const totalWordsToGenerate = currentTestMode === 'words' ? currentWordCount : 200;

    const sanitizedCommonWords = commonWords
        .map(word => word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase())
        .filter(word => word.length > 0);

    let wordsToUse = [];

    const nonWordProportion = 0.35;

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

    const existingWordSpans = wordsDisplay.querySelectorAll('.word');
    console.log("Found existing word spans:", existingWordSpans.length);
    for (let i = existingWordSpans.length - 1; i >= 0; i--) {
        existingWordSpans[i].remove();
    }
    console.log("Existing word spans removed.");

    if (wordsDisplay.firstChild !== caret) {
        wordsDisplay.prepend(caret);
        console.log("Caret prepended to wordsDisplay.");
    } else {
        console.log("Caret is already first child.");
    }

    if (words.length === 0) {
        console.error("Error: words array is empty in renderWords(). Cannot render.");
        return;
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

        if (wordIndex < words.length - 1) {
            const spaceSpan = document.createElement('span');
            spaceSpan.classList.add('character', 'space');
            spaceSpan.textContent = ' ';
            wordSpan.appendChild(spaceSpan);
        }
        if (wordIndex < 5) {
            console.log(`Rendered word ${wordIndex}: "${word}"`);
        }
    });
    console.log("All words appended to wordsDisplay.");

    updateCaretPosition();
    console.log("updateCaretPosition called.");
}

function updateCaretPosition() {
    const allWordElements = wordsDisplay.querySelectorAll('.word');
    const currentWordElement = allWordElements[currentWordIndex];

    if (!currentWordElement) {
        caret.style.display = 'none';
        console.warn("No current word element found. Hiding caret.");
        return;
    }

    caret.style.display = 'block';

    let targetCharacterSpan = null;
    let charactersInCurrentWord = Array.from(currentWordElement.children);

    if (currentCharIndex < charactersInCurrentWord.length) {
        targetCharacterSpan = charactersInCurrentWord[currentCharIndex];
    } else {
        const lastCharOfWord = charactersInCurrentWord[charactersInCurrentWord.length - 1];
        if (lastCharOfWord) {
            targetCharacterSpan = lastCharOfWord;
        }
    }

    if (targetCharacterSpan) {
        const rect = targetCharacterSpan.getBoundingClientRect();
        const displayRect = wordsDisplay.getBoundingClientRect();

        const charWidth = currentCharIndex < words[currentWordIndex].length ? 0 : rect.width;
        const caretLeft = rect.left - displayRect.left + wordsDisplay.scrollLeft + charWidth;
        const caretTop = rect.top - displayRect.top + wordsDisplay.scrollTop;

        caret.style.transform = `translate(${caretLeft}px, ${caretTop}px)`;
        console.log(`Caret moved to: left=${caretLeft}px, top=${caretTop}px`);

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
    calculateMetrics();

    // WHAT: Show UI elements when the test ends
    // WHERE: Inside endTest()
    // WHY: To display results and allow access to settings again
    showUI();
    // alert(`Test finished! Your WPM: ${wpmDisplay.textContent.split(': ')[1]}, Accuracy: ${accuracyDisplay.textContent.split(': ')[1]}`); // Removed alert as per standard typing test UI
}

function resetGame() {
    console.log("resetGame() called.");
    stopTimer();
    currentWordIndex = 0;
    currentCharIndex = 0;
    totalCharactersTyped = 0;
    correctCharactersTyped = 0;
    testStarted = false;
    testFinished = false;

    timerDisplay.textContent = `Time: ${currentTestDuration}s`;
    wpmDisplay.textContent = 'WPM: 0';
    accuracyDisplay.textContent = 'Accuracy: 0%';
    textInput.value = '';
    textInput.disabled = false;
    textInput.focus();
    wordsDisplay.scrollTop = 0;

    generateWords();
    renderWords();
    
    // WHAT: Show UI elements when the game is reset (initial state)
    // WHERE: Inside resetGame()
    // WHY: To ensure settings and results are visible on load or after restart
    showUI();
    console.log("resetGame() finished.");
}

function calculateMetrics() {
    if (!testStarted || testFinished) return;

    const currentTime = new Date().getTime();
    const elapsedTimeInSeconds = Math.floor((currentTime - startTime) / 1000);
    const elapsedTimeInMinutes = elapsedTimeInSeconds / 60;

    let currentInputCharCount = textInput.value.length;
    let currentWordCorrectChars = 0;
    const targetWord = words[currentWordIndex] || '';

    for(let i = 0; i < currentInputCharCount && i < targetWord.length; i++) {
        if (textInput.value[i] === targetWord[i]) {
            currentWordCorrectChars++;
        }
    }

    const totalCharsConsidered = totalCharactersTyped + currentInputCharCount;
    const totalCorrectCharsConsidered = correctCharactersTyped + currentWordCorrectChars;

    const currentWPM = elapsedTimeInMinutes > 0 ? Math.round((totalCorrectCharsConsidered / 5) / elapsedTimeInMinutes) : 0;
    wpmDisplay.textContent = `WPM: ${currentWPM}`;

    const currentAccuracy = totalCharsConsidered > 0 ? Math.round((totalCorrectCharsConsidered / totalCharsConsidered) * 100) : 0;
    accuracyDisplay.textContent = `Accuracy: ${currentAccuracy}%`;
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
            timeOptionsDiv.querySelector('.option-btn[data-value="60"]').classList.add('active');
            currentTestDuration = 60;
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
            wordsOptionsDiv.querySelector('.option-btn[data-value="50"]').classList.add('active');
            currentWordCount = 50;
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
        e.preventDefault();
        return;
    }

    if (!testStarted && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey && !e.repeat) {
        testStarted = true;
        startTimer();
        // WHAT: Hide UI elements when the test officially starts
        // WHERE: Inside textInput.addEventListener('keydown') when testStarted becomes true
        // WHY: To provide a cleaner typing interface during the test
        hideUI();
    }
});

textInput.addEventListener('input', (e) => {
    if (!testStarted || testFinished) return;

    const typedText = textInput.value;
    const currentWordElement = wordsDisplay.querySelectorAll('.word')[currentWordIndex];

    if (!currentWordElement || !words[currentWordIndex]) {
        if (currentTestMode === 'words' && currentWordIndex >= words.length && !testFinished) {
              endTest();
        }
        return;
    }

    const targetWord = words[currentWordIndex];
    const targetWordLength = targetWord.length;

    Array.from(currentWordElement.children).forEach(charSpan => {
        charSpan.classList.remove('correct', 'incorrect');
        if (charSpan.classList.contains('extra')) {
            charSpan.remove();
        }
    });

    let correctCharsInCurrentVisualWord = 0;

    for (let i = 0; i < targetWordLength; i++) {
        const targetChar = targetWord[i];
        const typedChar = typedText[i];
        const charSpan = currentWordElement.children[i];

        if (typedChar === undefined) {
            // no class
        } else if (typedChar === targetChar) {
            charSpan.classList.add('correct');
            correctCharsInCurrentVisualWord++;
        } else {
            charSpan.classList.add('incorrect');
        }
    }

    if (typedText.length > targetWordLength) {
        for (let i = targetWordLength; i < typedText.length; i++) {
            const extraCharSpan = document.createElement('span');
            extraCharSpan.classList.add('character', 'extra', 'incorrect');
            extraCharSpan.textContent = typedText[i];
            currentWordElement.appendChild(extraCharSpan);
        }
    }

    if (currentTestMode === 'words' &&
        currentWordIndex === words.length - 1 &&
        typedText.length === targetWordLength
    ) {
        totalCharactersTyped += typedText.length;
        correctCharactersTyped += correctCharsInCurrentVisualWord;
        endTest();
        return;
    }

    if (e.inputType === 'insertText' && typedText.endsWith(' ')) {
        e.preventDefault();

        totalCharactersTyped += typedText.length;
        correctCharactersTyped += correctCharsInCurrentVisualWord;

        currentWordIndex++;
        currentCharIndex = 0;
        textInput.value = '';

        if (currentTestMode === 'words' && currentWordIndex >= words.length) {
            endTest();
        } else if (currentWordIndex < words.length) {
            updateCaretPosition();
        }
    } else {
        currentCharIndex = typedText.length;
        updateCaretPosition();
        calculateMetrics();
    }
});


restartBtn.addEventListener('click', resetGame);

// --- Initialize the game on load ---
// Set initial active states for buttons
document.querySelector('#time-options .option-btn[data-value="30"]').classList.add('active');
document.querySelector('#mode-time').classList.add('active');
resetGame(); // This will now call showUI() on load, displaying the settings and results initially.

window.addEventListener('load', () => {
    textInput.focus();
});

document.addEventListener('click', (e) => {
    if (!textInput.contains(e.target) &&
        !restartBtn.contains(e.target) &&
        !wordsDisplay.contains(e.target) &&
        // WHY: Prevent losing focus when clicking on UI elements that are visible
        !settingsPanel.contains(e.target) &&
        !resultsSection.contains(e.target)) { 
        textInput.focus();
    }
});

wordsDisplay.addEventListener('click', () => {
    textInput.focus();
});