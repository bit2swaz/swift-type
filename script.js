// --- DOM Elements ---
const wordsDisplay = document.getElementById('wordsDisplay'); // Corrected
const textInput = document.getElementById('textInput');       // Corrected
const timerDisplay = document.getElementById('timer');       // NOW PRESENT IN HTML AGAIN
const wpmDisplay = document.getElementById('wpm');           // NOW PRESENT IN HTML AGAIN
const accuracyDisplay = document.getElementById('accuracy');   // NOW PRESENT IN HTML AGAIN
const restartBtn = document.getElementById('restartButton'); // Corrected

const includeNumbersCheckbox = document.getElementById('numbersToggle');     // Corrected
const includePunctuationCheckbox = document.getElementById('punctuationToggle'); // Corrected
const modeTimeBtn = document.getElementById('timeModeBtn');         // Corrected
const modeWordsBtn = document.getElementById('wordsModeBtn');       // Corrected
const timeOptionsDiv = document.getElementById('timeOptions');     // Corrected
const wordsOptionsDiv = document.getElementById('wordsOptions');   // Corrected

const caret = document.getElementById('caret');

// NEW: Results Screen DOM Elements - Corrected IDs
const resultsScreen = document.getElementById('results-screen');
const finalWpmDisplay = document.getElementById('wpmResult'); // Corrected
const finalAccuracyDisplay = document.getElementById('accuracyResult'); // Corrected
const finalRawWpmDisplay = document.getElementById('rawWpmResult'); // Corrected
const correctLettersDisplay = document.getElementById('correctLettersCount'); // Corrected
const incorrectLettersDisplay = document.getElementById('incorrectLettersCount'); // Corrected
const extraLettersDisplay = document.getElementById('extraLettersCount'); // Corrected
const resultsRestartBtn = document.getElementById('results-restart-btn'); // Corrected

// Existing DOM Elements that need to be hidden/shown
const settingsPanel = document.querySelector('.settings-panel');
const testArea = document.querySelector('.test-area');
const liveMetricsPanel = document.querySelector('.live-metrics'); // New selector for the live metrics container


// --- Game State Variables ---
let words = [];
let currentWordIndex = 0;
let currentCharIndex = 0;
let startTime;
let timerInterval;
let totalCharactersTyped = 0;
let correctCharactersTyped = 0; // This variable tracks characters that form correctly typed words (for Net WPM)
let testStarted = false;
let testFinished = false;

// Test settings - Initial defaults (will be overwritten by localStorage if values exist)
let currentTestMode = 'time'; // 'time' or 'words'
let currentTestDuration = 30; // default to 30 seconds (in seconds)
let currentWordCount = 50; // default to 50 words
let includeNumbers = false;
let includePunctuation = false;

// NEW: Metrics for Results Screen (raw counts for detailed breakdown)
let rawCorrectCharacters = 0;
let rawIncorrectCharacters = 0;
let rawExtraCharacters = 0;
let finalGrossWPM = 0; // Renamed to avoid confusion with live gross WPM

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
  "listen", "speak", "say", "tell", "ask", "answer", "shout", "whisper", "laugh", "cry", "smile", "frown", "yell",
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

        let caretLeft = rect.left - displayRect.left + wordsDisplay.scrollLeft;
        const caretTop = rect.top - displayRect.top + wordsDisplay.scrollTop;

        // Adjust caret position for when it's at the end of a word (on the space)
        const currentWordText = words[currentWordIndex];
        if (currentCharIndex === currentWordText.length) { // We are on the "virtual" space after the word
            const spaceSpan = currentWordElement.querySelector('.space');
            if (spaceSpan) {
                caretLeft += spaceSpan.getBoundingClientRect().width;
            } else {
                caretLeft += (rect.width * 0.5);
            }
        }
        
        caret.style.transform = `translate(${caretLeft}px, ${caretTop}px)`;
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
    const elapsedTimeInSeconds = Math.floor((currentTime - startTime) / 1000);

    let displayTime;
    if (currentTestMode === 'time') {
        const remainingTime = currentTestDuration - elapsedTimeInSeconds;
        displayTime = Math.max(0, remainingTime);
        if (remainingTime <= 0) {
            endTest();
            return;
        }
    } else {
        displayTime = elapsedTimeInSeconds;
    }

    // Check if timerDisplay exists before trying to update its textContent
    if (timerDisplay) {
        timerDisplay.textContent = `Time: ${displayTime}s`;
    }
    calculateMetrics();
}

function endTest() {
    console.log("Test ended.");
    stopTimer();
    testFinished = true;
    textInput.disabled = true;
    textInput.blur();
    caret.style.display = 'none';

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
    rawCorrectCharacters = 0;
    rawIncorrectCharacters = 0;
    rawExtraCharacters = 0;
    testStarted = false;
    testFinished = false;

    // Check if timerDisplay, wpmDisplay, accuracyDisplay exist before updating
    if (timerDisplay) {
        timerDisplay.textContent = `Time: ${currentTestMode === 'time' ? currentTestDuration : 0}s`;
    }
    if (wpmDisplay) {
        wpmDisplay.textContent = 'WPM: 0';
    }
    if (accuracyDisplay) {
        accuracyDisplay.textContent = 'Accuracy: 0%';
    }
    
    textInput.value = '';
    textInput.disabled = false;
    wordsDisplay.scrollTop = 0;

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

    const currentTypedText = textInput.value;
    const targetWord = words[currentWordIndex] || '';

    let currentWordCorrectChars = 0;
    let currentWordIncorrectChars = 0;
    let currentWordExtraChars = 0;

    for (let i = 0; i < Math.max(currentTypedText.length, targetWord.length); i++) {
        const typedChar = currentTypedText[i];
        const targetChar = targetWord[i];

        if (typedChar === undefined) {
        } else if (targetChar === undefined) {
            currentWordExtraChars++;
        } else if (typedChar === targetChar) {
            currentWordCorrectChars++;
        } else {
            currentWordIncorrectChars++;
        }
    }

    const liveTotalCharsTyped = rawCorrectCharacters + rawIncorrectCharacters + rawExtraCharacters +
                                 currentWordCorrectChars + currentWordIncorrectChars + currentWordExtraChars;

    const liveCorrectChars = rawCorrectCharacters + currentWordCorrectChars;

    const liveGrossWPM = elapsedTimeInMinutes > 0 ? Math.round((liveTotalCharsTyped / 5) / elapsedTimeInMinutes) : 0;
    // Check if wpmDisplay exists before trying to update it
    if (wpmDisplay) {
        wpmDisplay.textContent = `WPM: ${liveGrossWPM}`;
    }

    const liveAccuracy = liveTotalCharsTyped > 0 ? Math.round((liveCorrectChars / liveTotalCharsTyped) * 100) : 0;
    // Check if accuracyDisplay exists before trying to update it
    if (accuracyDisplay) {
        accuracyDisplay.textContent = `Accuracy: ${liveAccuracy}%`;
    }
}


function calculateFinalMetrics() {
    const finalElapsedTimeInSeconds = Math.floor((new Date().getTime() - startTime) / 1000);
    const finalElapsedTimeInMinutes = finalElapsedTimeInSeconds / 60;

    finalGrossWPM = finalElapsedTimeInMinutes > 0 ? Math.round((rawCorrectCharacters + rawIncorrectCharacters + rawExtraCharacters) / 5 / finalElapsedTimeInMinutes) : 0;
    
    const netWPM = finalElapsedTimeInMinutes > 0 ? Math.round((rawCorrectCharacters / 5) / finalElapsedTimeInMinutes) : 0;

    const finalTotalTypedCharacters = rawCorrectCharacters + rawIncorrectCharacters + rawExtraCharacters;
    const finalAccuracy = finalTotalTypedCharacters > 0 ? Math.round((rawCorrectCharacters / finalTotalTypedCharacters) * 100) : 0;

    // Check if elements exist before updating them
    if (finalWpmDisplay) finalWpmDisplay.textContent = netWPM;
    if (finalAccuracyDisplay) finalAccuracyDisplay.textContent = `${finalAccuracy}%`;
    if (finalRawWpmDisplay) finalRawWpmDisplay.textContent = finalGrossWPM;
    if (correctLettersDisplay) correctLettersDisplay.textContent = rawCorrectCharacters;
    if (incorrectLettersDisplay) incorrectLettersDisplay.textContent = rawIncorrectCharacters;
    if (extraLettersDisplay) extraLettersDisplay.textContent = rawExtraCharacters;
}

function showResultsScreen() {
    settingsPanel.classList.add('hidden');
    testArea.classList.add('hidden');
    // Hide the live metrics panel as well
    if (liveMetricsPanel) liveMetricsPanel.classList.add('hidden'); 
    if (restartBtn) restartBtn.classList.add('hidden'); // Check before trying to hide

    setTimeout(() => {
        resultsScreen.classList.add('show');
    }, 500);
}

function hideResultsScreen() {
    resultsScreen.classList.remove('show');
}

function showTypingInterface() {
    setTimeout(() => {
        settingsPanel.classList.remove('hidden');
        testArea.classList.remove('hidden');
        // Show the live metrics panel again
        if (liveMetricsPanel) liveMetricsPanel.classList.remove('hidden'); 
        if (restartBtn) restartBtn.classList.remove('hidden'); // Check before trying to show
        
        textInput.disabled = true; // Disable temporarily to allow focus to apply correctly
        textInput.focus();
        setTimeout(() => {
            textInput.disabled = false;
            textInput.focus();
            textInput.value = '';
        }, 100);
    }, 500);
}


// --- Local Storage Functions ---

function saveSettings() {
    localStorage.setItem('typingTestMode', currentTestMode);
    localStorage.setItem('typingTestDuration', currentTestDuration.toString()); // Store as string
    localStorage.setItem('typingWordCount', currentWordCount.toString());     // Store as string
    localStorage.setItem('typingIncludeNumbers', includeNumbers.toString());   // Store as string
    localStorage.setItem('typingIncludePunctuation', includePunctuation.toString()); // Store as string
    console.log("Settings saved to localStorage.");
}

function loadSettings() {
    console.log("Loading settings from localStorage...");
    const savedMode = localStorage.getItem('typingTestMode');
    const savedDuration = localStorage.getItem('typingTestDuration');
    const savedWordCount = localStorage.getItem('typingWordCount');
    const savedNumbers = localStorage.getItem('typingIncludeNumbers');
    const savedPunctuation = localStorage.getItem('typingIncludePunctuation');

    // Apply saved mode or default
    if (savedMode === 'time' || savedMode === 'words') {
        currentTestMode = savedMode;
    } else {
        currentTestMode = 'time'; // Default if no valid setting found
    }

    // Apply saved duration or default, and update UI
    if (savedDuration && !isNaN(parseInt(savedDuration))) {
        const parsedDuration = parseInt(savedDuration);
        // Check if the parsed duration is one of our valid options
        const validTimeOptions = [15, 30, 60, 120]; // Assuming these are your options
        if (validTimeOptions.includes(parsedDuration)) {
            currentTestDuration = parsedDuration;
        } else {
            currentTestDuration = 30; // Fallback to default
        }
    } else {
        currentTestDuration = 30; // Default
    }
    // Update UI for time options
    if (timeOptionsDiv) { // Ensure timeOptionsDiv exists before querying it
        timeOptionsDiv.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
        const activeTimeBtn = timeOptionsDiv.querySelector(`.option-btn[data-value="${currentTestDuration}"]`);
        if (activeTimeBtn) activeTimeBtn.classList.add('active');
    }


    // Apply saved word count or default, and update UI
    if (savedWordCount && !isNaN(parseInt(savedWordCount))) {
        const parsedWordCount = parseInt(savedWordCount);
        const validWordOptions = [10, 25, 50, 100]; // Assuming these are your options
        if (validWordOptions.includes(parsedWordCount)) {
            currentWordCount = parsedWordCount;
        } else {
            currentWordCount = 50; // Fallback to default
        }
    } else {
        currentWordCount = 50; // Default
    }
    // Update UI for word options
    if (wordsOptionsDiv) { // Ensure wordsOptionsDiv exists before querying it
        wordsOptionsDiv.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
        const activeWordBtn = wordsOptionsDiv.querySelector(`.option-btn[data-value="${currentWordCount}"]`);
        if (activeWordBtn) activeWordBtn.classList.add('active');
    }


    // Apply saved checkboxes or default, and update UI
    includeNumbers = (savedNumbers === 'true');
    includePunctuation = (savedPunctuation === 'true');
    // Check if checkboxes exist before updating
    if (includeNumbersCheckbox) includeNumbersCheckbox.checked = includeNumbers;
    if (includePunctuationCheckbox) includePunctuationCheckbox.checked = includePunctuation;

    // Update active mode button UI
    if (currentTestMode === 'time') {
        if (modeTimeBtn) modeTimeBtn.classList.add('active');
        if (modeWordsBtn) modeWordsBtn.classList.remove('active');
        if (timeOptionsDiv) timeOptionsDiv.classList.remove('hidden');
        if (wordsOptionsDiv) wordsOptionsDiv.classList.add('hidden');
    } else {
        if (modeWordsBtn) modeWordsBtn.classList.add('active');
        if (modeTimeBtn) modeTimeBtn.classList.remove('active');
        if (wordsOptionsDiv) wordsOptionsDiv.classList.remove('hidden');
        if (timeOptionsDiv) timeOptionsDiv.classList.add('hidden');
    }
    console.log("Settings loaded. Current state:", { currentTestMode, currentTestDuration, currentWordCount, includeNumbers, includePunctuation });
}


// --- Event Listeners ---

// Settings Listeners
// Check before adding event listeners to ensure elements exist
if (includeNumbersCheckbox) {
    includeNumbersCheckbox.addEventListener('change', () => {
        includeNumbers = includeNumbersCheckbox.checked;
        saveSettings(); // Save setting on change
        resetGame();
    });
}

if (includePunctuationCheckbox) {
    includePunctuationCheckbox.addEventListener('change', () => {
        includePunctuation = includePunctuationCheckbox.checked;
        saveSettings(); // Save setting on change
        resetGame();
    });
}

if (modeTimeBtn) {
    modeTimeBtn.addEventListener('click', () => {
        if (currentTestMode === 'words') {
            currentTestMode = 'time';
            modeTimeBtn.classList.add('active');
            modeWordsBtn.classList.remove('active');
            timeOptionsDiv.classList.remove('hidden');
            wordsOptionsDiv.classList.add('hidden');
            // Ensure an option is active after switching mode, in case user didn't select one
            if (!timeOptionsDiv.querySelector('.option-btn.active')) {
                timeOptionsDiv.querySelector('.option-btn[data-value="30"]').classList.add('active');
                currentTestDuration = 30;
            } else {
                currentTestDuration = parseInt(timeOptionsDiv.querySelector('.option-btn.active').dataset.value);
            }
            saveSettings(); // Save setting on change
            resetGame();
        }
    });
}

if (modeWordsBtn) {
    modeWordsBtn.addEventListener('click', () => {
        if (currentTestMode === 'time') {
            currentTestMode = 'words';
            modeWordsBtn.classList.add('active');
            modeTimeBtn.classList.remove('active');
            wordsOptionsDiv.classList.remove('hidden');
            timeOptionsDiv.classList.add('hidden');
            // Ensure an option is active after switching mode
            if (!wordsOptionsDiv.querySelector('.option-btn.active')) {
                wordsOptionsDiv.querySelector('.option-btn[data-value="50"]').classList.add('active');
                currentWordCount = 50;
            } else {
                currentWordCount = parseInt(wordsOptionsDiv.querySelector('.option-btn.active').dataset.value);
            }
            saveSettings(); // Save setting on change
            resetGame();
        }
    });
}

if (timeOptionsDiv) {
    timeOptionsDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('option-btn')) {
            timeOptionsDiv.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentTestDuration = parseInt(e.target.dataset.value);
            saveSettings(); // Save setting on change
            resetGame();
        }
    });
}

if (wordsOptionsDiv) {
    wordsOptionsDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('option-btn')) {
            wordsOptionsDiv.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentWordCount = parseInt(e.target.dataset.value);
            saveSettings(); // Save setting on change
            resetGame();
        }
    });
}

// Ensure textInput and restartBtn exist before adding listeners
if (textInput) {
    textInput.addEventListener('keydown', (e) => {
        if (testFinished) {
            e.preventDefault();
            return;
        }

        if (e.key === ' ' && textInput.value.length === 0) {
            e.preventDefault();
            return;
        }

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
            if (currentTestMode === 'words' && currentWordIndex >= words.length && !testFinished) {
                endTest();
            }
            return;
        }

        const targetWordLength = targetWord.length;

        Array.from(currentWordElement.querySelectorAll('.character.extra')).forEach(span => span.remove());

        for (let i = 0; i < targetWordLength; i++) {
            const targetChar = targetWord[i];
            const typedChar = typedText[i];
            const charSpan = currentWordElement.children[i];

            charSpan.classList.remove('correct', 'incorrect');

            if (typedChar === undefined) {
            } else if (typedChar === targetChar) {
                charSpan.classList.add('correct');
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
            typedText.length === targetWordLength &&
            e.inputType !== 'deleteContentBackward'
        ) {
            for (let i = 0; i < targetWordLength; i++) {
                const targetChar = targetWord[i];
                const typedChar = typedText[i];
                if (typedChar === targetChar) {
                    rawCorrectCharacters++;
                } else {
                    rawIncorrectCharacters++;
                }
            }
            endTest();
            return;
        }

        if (e.inputType === 'insertText' && typedText.endsWith(' ')) {
            e.preventDefault();

            const finalTypedWordForCurrentWord = typedText.trim();
            const currentTargetWord = words[currentWordIndex];

            for (let i = 0; i < Math.max(finalTypedWordForCurrentWord.length, currentTargetWord.length); i++) {
                const typedChar = finalTypedWordForCurrentWord[i];
                const targetChar = currentTargetWord[i];

                if (typedChar === undefined) {
                } else if (targetChar === undefined) {
                    rawExtraCharacters++;
                } else if (typedChar === targetChar) {
                    rawCorrectCharacters++;
                } else {
                    rawIncorrectCharacters++;
                }
            }
            
            if (finalTypedWordForCurrentWord === currentTargetWord) {
                correctCharactersTyped += currentTargetWord.length + 1;
            } else {
                totalCharactersTyped += finalTypedWordForCurrentWord.length + 1;
            }

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
}


if (restartBtn) restartBtn.addEventListener('click', resetGame);
if (resultsRestartBtn) resultsRestartBtn.addEventListener('click', resetGame);


// --- Initialize the game on load ---
// First, load settings from localStorage
loadSettings(); 
// Then, based on the loaded settings, set initial active states and start the game
// (The loadSettings() function now handles setting the 'active' classes for buttons based on loaded values)
resetGame();

window.addEventListener('load', () => {
    // Initial focus is handled by resetGame now
});

document.addEventListener('click', (e) => {
    // Only focus if the click was *not* on the text input, any button, or the settings/results panel
    if (!textInput.contains(e.target) &&
        (!restartBtn || !restartBtn.contains(e.target)) && // Check if button exists
        (!resultsRestartBtn || !resultsRestartBtn.contains(e.target)) && // Check if button exists
        !wordsDisplay.contains(e.target) &&
        !settingsPanel.contains(e.target) &&
        !resultsScreen.contains(e.target) &&
        (!modeTimeBtn || !modeTimeBtn.contains(e.target)) && // Specific mode buttons
        (!modeWordsBtn || !modeWordsBtn.contains(e.target)) &&
        (!timeOptionsDiv || !timeOptionsDiv.contains(e.target)) && // Specific option divs
        (!wordsOptionsDiv || !wordsOptionsDiv.contains(e.target)) &&
        (!includeNumbersCheckbox || !includeNumbersCheckbox.contains(e.target)) && // Checkbox labels/inputs
        (!includePunctuationCheckbox || !includePunctuationCheckbox.contains(e.target))
        ) {
        textInput.focus();
    }
});

if (wordsDisplay) {
    wordsDisplay.addEventListener('click', () => {
        textInput.focus();
    });
}