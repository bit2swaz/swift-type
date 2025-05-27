document.addEventListener('DOMContentLoaded', init);

const elements = {
    wordsDisplay: document.getElementById('wordsDisplay'),
    textInput: document.getElementById('textInput'),
    timerDisplay: document.getElementById('timer'),
    wpmDisplay: document.getElementById('wpm'),
    accuracyDisplay: document.getElementById('accuracy'),
    restartBtn: document.getElementById('restartButton'),
    
    // Updated: Numbers and Punctuation are now buttons
    numbersBtn: document.getElementById('numbers-btn'),      // Assuming your HTML has id="numbers-btn"
    punctuationBtn: document.getElementById('punctuation-btn'), // Assuming your HTML has id="punctuation-btn"

    modeTimeBtn: document.getElementById('timeModeBtn'),
    modeWordsBtn: document.getElementById('wordsModeBtn'),
    timeOptionsDiv: document.getElementById('timeOptions'),
    wordsOptionsDiv: document.getElementById('wordsOptions'),
    caret: document.getElementById('caret'),

    // Results Screen DOM Elements
    resultsScreen: document.getElementById('results-screen'),
    finalWpmDisplay: document.getElementById('wpmResult'),
    finalAccuracyDisplay: document.getElementById('accuracyResult'),
    finalRawWpmDisplay: document.getElementById('rawWpmResult'),
    correctLettersDisplay: document.getElementById('correctLettersCount'),
    incorrectLettersDisplay: document.getElementById('incorrectLettersCount'),
    extraLettersDisplay: document.getElementById('extraLettersCount'),
    resultsRestartBtn: document.getElementById('results-restart-btn'),

    // Existing DOM Elements that need to be hidden/shown
    settingsPanel: document.querySelector('.settings-panel'),
    testArea: document.querySelector('.test-area'),
    liveMetricsPanel: document.querySelector('.live-metrics')
};

let state = {
    words: [],
    currentWordIndex: 0,
    currentCharIndex: 0,
    startTime: null,
    timerInterval: null,
    testStarted: false,
    testFinished: false,

    currentTestMode: 'time', // 'time' or 'words'
    currentTestDuration: 30, // default to 30 seconds (in seconds)
    currentWordCount: 50, // default to 50 words
    includeNumbers: false,
    includePunctuation: false,

    rawCorrectCharacters: 0,
    rawIncorrectCharacters: 0,
    rawExtraCharacters: 0,
    finalGrossWPM: 0
};

// --- Word Lists ---
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
    const totalWordsToGenerate = state.currentTestMode === 'words' ? state.currentWordCount : 200;

    const sanitizedCommonWords = commonWords
        .map(word => word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase())
        .filter(word => word.length > 0);

    let wordsToUse = [];
    const nonWordProportion = 0.35; // Target up to 35% non-words

    let numNumbersNeeded = 0;
    let numPunctuationsNeeded = 0;
    let numCommonWordsNeeded = totalWordsToGenerate;

    if (state.includeNumbers && state.includePunctuation) {
        numNumbersNeeded = Math.floor(totalWordsToGenerate * (nonWordProportion / 2));
        numPunctuationsNeeded = Math.floor(totalWordsToGenerate * (nonWordProportion / 2));
        numCommonWordsNeeded = totalWordsToGenerate - numNumbersNeeded - numPunctuationsNeeded;
    } else if (state.includeNumbers) {
        numNumbersNeeded = Math.floor(totalWordsToGenerate * nonWordProportion);
        numCommonWordsNeeded = totalWordsToGenerate - numNumbersNeeded;
    } else if (state.includePunctuation) {
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

    state.words = wordsToUse.sort(() => 0.5 - Math.random());
    state.words = state.words.slice(0, totalWordsToGenerate);
}

function renderWords() {
    elements.wordsDisplay.innerHTML = ''; // Clear existing words

    if (elements.wordsDisplay.firstChild !== elements.caret) {
        elements.wordsDisplay.prepend(elements.caret);
    }

    if (state.words.length === 0) {
        return;
    }

    state.words.forEach((word, wordIndex) => {
        const wordSpan = document.createElement('span');
        wordSpan.classList.add('word');
        word.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.classList.add('character');
            charSpan.textContent = char;
            wordSpan.appendChild(charSpan);
        });
        elements.wordsDisplay.appendChild(wordSpan);

        if (wordIndex < state.words.length - 1) {
            const spaceSpan = document.createElement('span');
            spaceSpan.classList.add('character', 'space');
            spaceSpan.textContent = ' ';
            wordSpan.appendChild(spaceSpan);
        }
    });
    updateCaretPosition();
}

function updateCaretPosition() {
    const allWordElements = elements.wordsDisplay.querySelectorAll('.word');
    const currentWordElement = allWordElements[state.currentWordIndex];

    if (!currentWordElement) {
        elements.caret.style.display = 'none';
        return;
    }

    elements.caret.style.display = 'block';

    let targetCharacterSpan = null;
    let charactersInCurrentWord = Array.from(currentWordElement.children);

    if (state.currentCharIndex < charactersInCurrentWord.length) {
        targetCharacterSpan = charactersInCurrentWord[state.currentCharIndex];
    } else {
        const lastCharOfWord = charactersInCurrentWord[charactersInCurrentWord.length - 1];
        if (lastCharOfWord) {
            targetCharacterSpan = lastCharOfWord;
        }
    }

    if (targetCharacterSpan) {
        const rect = targetCharacterSpan.getBoundingClientRect();
        const displayRect = elements.wordsDisplay.getBoundingClientRect();

        let caretLeft = rect.left - displayRect.left + elements.wordsDisplay.scrollLeft;
        const caretTop = rect.top - displayRect.top + elements.wordsDisplay.scrollTop;

        // Adjust caret position for when it's at the end of a word (on the space)
        const currentWordText = state.words[state.currentWordIndex];
        if (state.currentCharIndex === currentWordText.length) {
            const spaceSpan = currentWordElement.querySelector('.space');
            if (spaceSpan) {
                caretLeft += spaceSpan.getBoundingClientRect().width;
            } else {
                caretLeft += (rect.width * 0.5);
            }
        }
        
        elements.caret.style.transform = `translate(${caretLeft}px, ${caretTop}px)`;
        scrollWordsDisplay(rect.top, rect.height);
    }
}

function scrollWordsDisplay(charTop, charHeight) {
    const wordsDisplayRect = elements.wordsDisplay.getBoundingClientRect();
    const wordsDisplayScrollTop = elements.wordsDisplay.scrollTop;

    const relativeCharTop = charTop - wordsDisplayRect.top;

    const scrollBuffer = 30;

    if (relativeCharTop < scrollBuffer) {
        elements.wordsDisplay.scrollTop = wordsDisplayScrollTop + relativeCharTop - scrollBuffer;
    }
    else if (relativeCharTop + charHeight > wordsDisplayRect.height - scrollBuffer) {
        elements.wordsDisplay.scrollTop = wordsDisplayScrollTop + (relativeCharTop + charHeight - (wordsDisplayRect.height - scrollBuffer));
    }
}

function startTimer() {
    state.startTime = new Date().getTime();
    state.timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
    clearInterval(state.timerInterval);
}

function updateTimer() {
    const currentTime = new Date().getTime();
    const elapsedTimeInSeconds = Math.floor((currentTime - state.startTime) / 1000);

    let displayTime;
    if (state.currentTestMode === 'time') {
        const remainingTime = state.currentTestDuration - elapsedTimeInSeconds;
        displayTime = Math.max(0, remainingTime);
        if (remainingTime <= 0) {
            endTest();
            return;
        }
    } else {
        displayTime = elapsedTimeInSeconds;
    }

    if (elements.timerDisplay) {
        elements.timerDisplay.textContent = `Time: ${displayTime}s`;
    }
    calculateMetrics();
}

function endTest() {
    stopTimer();
    state.testFinished = true;
    elements.textInput.disabled = true;
    elements.textInput.blur();
    elements.caret.style.display = 'none';

    calculateFinalMetrics();
    showResultsScreen();
}

function resetGame() {
    stopTimer();
    state.currentWordIndex = 0;
    state.currentCharIndex = 0;
    state.totalCharactersTyped = 0;
    state.rawCorrectCharacters = 0;
    state.rawIncorrectCharacters = 0;
    state.rawExtraCharacters = 0;
    state.testStarted = false;
    state.testFinished = false;

    if (elements.timerDisplay) {
        elements.timerDisplay.textContent = `Time: ${state.currentTestMode === 'time' ? state.currentTestDuration : 0}s`;
    }
    if (elements.wpmDisplay) {
        elements.wpmDisplay.textContent = 'WPM: 0';
    }
    if (elements.accuracyDisplay) {
        elements.accuracyDisplay.textContent = 'Accuracy: 0%';
    }
    
    elements.textInput.value = '';
    elements.textInput.disabled = false;
    elements.wordsDisplay.scrollTop = 0;

    hideResultsScreen();
    showTypingInterface();

    generateWords();
    renderWords();
}

function calculateMetrics() {
    if (!state.testStarted || state.testFinished) return;

    const currentTime = new Date().getTime();
    const elapsedTimeInSeconds = Math.floor((currentTime - state.startTime) / 1000);
    const elapsedTimeInMinutes = elapsedTimeInSeconds / 60;

    const currentTypedText = elements.textInput.value;
    const targetWord = state.words[state.currentWordIndex] || '';

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

    const liveTotalCharsTyped = state.rawCorrectCharacters + state.rawIncorrectCharacters + state.rawExtraCharacters +
                                 currentWordCorrectChars + currentWordIncorrectChars + currentWordExtraChars;

    const liveCorrectChars = state.rawCorrectCharacters + currentWordCorrectChars;

    const liveGrossWPM = elapsedTimeInMinutes > 0 ? Math.round((liveTotalCharsTyped / 5) / elapsedTimeInMinutes) : 0;
    if (elements.wpmDisplay) {
        elements.wpmDisplay.textContent = `WPM: ${liveGrossWPM}`;
    }

    const liveAccuracy = liveTotalCharsTyped > 0 ? Math.round((liveCorrectChars / liveTotalCharsTyped) * 100) : 0;
    if (elements.accuracyDisplay) {
        elements.accuracyDisplay.textContent = `Accuracy: ${liveAccuracy}%`;
    }
}

function calculateFinalMetrics() {
    const finalElapsedTimeInSeconds = Math.floor((new Date().getTime() - state.startTime) / 1000);
    const finalElapsedTimeInMinutes = finalElapsedTimeInSeconds / 60;

    state.finalGrossWPM = finalElapsedTimeInMinutes > 0 ? Math.round((state.rawCorrectCharacters + state.rawIncorrectCharacters + state.rawExtraCharacters) / 5 / finalElapsedTimeInMinutes) : 0;
    
    const netWPM = finalElapsedTimeInMinutes > 0 ? Math.round((state.rawCorrectCharacters / 5) / finalElapsedTimeInMinutes) : 0;

    const finalTotalTypedCharacters = state.rawCorrectCharacters + state.rawIncorrectCharacters + state.rawExtraCharacters;
    const finalAccuracy = finalTotalTypedCharacters > 0 ? Math.round((state.rawCorrectCharacters / finalTotalTypedCharacters) * 100) : 0;

    if (elements.finalWpmDisplay) elements.finalWpmDisplay.textContent = netWPM;
    if (elements.finalAccuracyDisplay) elements.finalAccuracyDisplay.textContent = `${finalAccuracy}%`;
    if (elements.finalRawWpmDisplay) elements.finalRawWpmDisplay.textContent = state.finalGrossWPM;
    if (elements.correctLettersDisplay) elements.correctLettersDisplay.textContent = state.rawCorrectCharacters;
    if (elements.incorrectLettersDisplay) elements.incorrectLettersDisplay.textContent = state.rawIncorrectCharacters;
    if (elements.extraLettersDisplay) elements.extraLettersDisplay.textContent = state.rawExtraCharacters;
}

function showResultsScreen() {
    elements.settingsPanel.classList.add('hidden');
    elements.testArea.classList.add('hidden');
    if (elements.liveMetricsPanel) elements.liveMetricsPanel.classList.add('hidden'); 
    if (elements.restartBtn) elements.restartBtn.classList.add('hidden');

    setTimeout(() => {
        elements.resultsScreen.classList.add('show');
    }, 500);
}

function hideResultsScreen() {
    elements.resultsScreen.classList.remove('show');
}

function showTypingInterface() {
    setTimeout(() => {
        elements.settingsPanel.classList.remove('hidden');
        elements.testArea.classList.remove('hidden');
        if (elements.liveMetricsPanel) elements.liveMetricsPanel.classList.remove('hidden'); 
        if (elements.restartBtn) elements.restartBtn.classList.remove('hidden'); 
        
        elements.textInput.disabled = true;
        elements.textInput.focus();
        setTimeout(() => {
            elements.textInput.disabled = false;
            elements.textInput.focus();
            elements.textInput.value = '';
        }, 100);
    }, 500);
}

// --- Local Storage Functions ---

function saveSettings() {
    localStorage.setItem('typingTestMode', state.currentTestMode);
    localStorage.setItem('typingTestDuration', state.currentTestDuration.toString());
    localStorage.setItem('typingWordCount', state.currentWordCount.toString());
    localStorage.setItem('typingIncludeNumbers', state.includeNumbers.toString());
    localStorage.setItem('typingIncludePunctuation', state.includePunctuation.toString());
}

function loadSettings() {
    const savedMode = localStorage.getItem('typingTestMode');
    const savedDuration = localStorage.getItem('typingTestDuration');
    const savedWordCount = localStorage.getItem('typingWordCount');
    const savedNumbers = localStorage.getItem('typingIncludeNumbers');
    const savedPunctuation = localStorage.getItem('typingIncludePunctuation');

    if (savedMode === 'time' || savedMode === 'words') {
        state.currentTestMode = savedMode;
    } else {
        state.currentTestMode = 'time';
    }

    if (savedDuration && !isNaN(parseInt(savedDuration))) {
        const parsedDuration = parseInt(savedDuration);
        const validTimeOptions = [15, 30, 60, 120];
        if (validTimeOptions.includes(parsedDuration)) {
            state.currentTestDuration = parsedDuration;
        } else {
            state.currentTestDuration = 30;
        }
    } else {
        state.currentTestDuration = 30;
    }

    if (savedWordCount && !isNaN(parseInt(savedWordCount))) {
        const parsedWordCount = parseInt(savedWordCount);
        const validWordOptions = [10, 25, 50, 100];
        if (validWordOptions.includes(parsedWordCount)) {
            state.currentWordCount = parsedWordCount;
        } else {
            state.currentWordCount = 50;
        }
    } else {
        state.currentWordCount = 50;
    }

    state.includeNumbers = (savedNumbers === 'true');
    state.includePunctuation = (savedPunctuation === 'true');

    // Update UI based on loaded settings
    updateSettingsUI();
}

function updateSettingsUI() {
    // Update active mode button UI
    if (state.currentTestMode === 'time') {
        if (elements.modeTimeBtn) elements.modeTimeBtn.classList.add('active');
        if (elements.modeWordsBtn) elements.modeWordsBtn.classList.remove('active');
        if (elements.timeOptionsDiv) elements.timeOptionsDiv.classList.remove('hidden');
        if (elements.wordsOptionsDiv) elements.wordsOptionsDiv.classList.add('hidden');
    } else {
        if (elements.modeWordsBtn) elements.modeWordsBtn.classList.add('active');
        if (elements.modeTimeBtn) elements.modeTimeBtn.classList.remove('active');
        if (elements.wordsOptionsDiv) elements.wordsOptionsDiv.classList.remove('hidden');
        if (elements.timeOptionsDiv) elements.timeOptionsDiv.classList.add('hidden');
    }

    // Update time options UI
    if (elements.timeOptionsDiv) {
        elements.timeOptionsDiv.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
        const activeTimeBtn = elements.timeOptionsDiv.querySelector(`.option-btn[data-value="${state.currentTestDuration}"]`);
        if (activeTimeBtn) activeTimeBtn.classList.add('active');
    }

    // Update word options UI
    if (elements.wordsOptionsDiv) {
        elements.wordsOptionsDiv.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
        const activeWordBtn = elements.wordsOptionsDiv.querySelector(`.option-btn[data-value="${state.currentWordCount}"]`);
        if (activeWordBtn) activeWordBtn.classList.add('active');
    }

    // Updated: Update Numbers and Punctuation buttons UI
    if (elements.numbersBtn) {
        elements.numbersBtn.classList.toggle('active', state.includeNumbers);
    }
    if (elements.punctuationBtn) {
        elements.punctuationBtn.classList.toggle('active', state.includePunctuation);
    }
}


// --- Event Listeners ---

function setupEventListeners() {
    // Numbers Toggle Button
    if (elements.numbersBtn) {
        elements.numbersBtn.addEventListener('click', () => {
            state.includeNumbers = !state.includeNumbers;
            elements.numbersBtn.classList.toggle('active', state.includeNumbers);
            saveSettings();
            resetGame();
        });
    }

    // Punctuation Toggle Button
    if (elements.punctuationBtn) {
        elements.punctuationBtn.addEventListener('click', () => {
            state.includePunctuation = !state.includePunctuation;
            elements.punctuationBtn.classList.toggle('active', state.includePunctuation);
            saveSettings();
            resetGame();
        });
    }

    // Mode Time Button
    if (elements.modeTimeBtn) {
        elements.modeTimeBtn.addEventListener('click', () => {
            if (state.currentTestMode === 'words') {
                state.currentTestMode = 'time';
                updateSettingsUI(); // Update UI for mode change and options visibility
                // Ensure an option is active after switching mode, in case user didn't select one
                if (!elements.timeOptionsDiv.querySelector('.option-btn.active')) {
                    elements.timeOptionsDiv.querySelector(`.option-btn[data-value="${state.currentTestDuration}"]`).classList.add('active');
                }
                saveSettings();
                resetGame();
            }
        });
    }

    // Mode Words Button
    if (elements.modeWordsBtn) {
        elements.modeWordsBtn.addEventListener('click', () => {
            if (state.currentTestMode === 'time') {
                state.currentTestMode = 'words';
                updateSettingsUI(); // Update UI for mode change and options visibility
                // Ensure an option is active after switching mode
                if (!elements.wordsOptionsDiv.querySelector('.option-btn.active')) {
                    elements.wordsOptionsDiv.querySelector(`.option-btn[data-value="${state.currentWordCount}"]`).classList.add('active');
                }
                saveSettings();
                resetGame();
            }
        });
    }

    // Time Options Div
    if (elements.timeOptionsDiv) {
        elements.timeOptionsDiv.addEventListener('click', (e) => {
            if (e.target.classList.contains('option-btn')) {
                elements.timeOptionsDiv.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                state.currentTestDuration = parseInt(e.target.dataset.value);
                saveSettings();
                resetGame();
            }
        });
    }

    // Words Options Div
    if (elements.wordsOptionsDiv) {
        elements.wordsOptionsDiv.addEventListener('click', (e) => {
            if (e.target.classList.contains('option-btn')) {
                elements.wordsOptionsDiv.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                state.currentWordCount = parseInt(e.target.dataset.value);
                saveSettings();
                resetGame();
            }
        });
    }

    if (elements.textInput) {
        elements.textInput.addEventListener('keydown', (e) => {
            if (state.testFinished) {
                e.preventDefault();
                return;
            }

            if (e.key === ' ' && elements.textInput.value.length === 0) {
                e.preventDefault();
                return;
            }

            if (!state.testStarted && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey && !e.repeat) {
                state.testStarted = true;
                startTimer();
            }
        });

        elements.textInput.addEventListener('input', (e) => {
            if (!state.testStarted || state.testFinished) return;

            const typedText = elements.textInput.value;
            const currentWordElement = elements.wordsDisplay.querySelectorAll('.word')[state.currentWordIndex];
            const targetWord = state.words[state.currentWordIndex];

            if (!currentWordElement || !targetWord) {
                if (state.currentTestMode === 'words' && state.currentWordIndex >= state.words.length && !state.testFinished) {
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

            if (state.currentTestMode === 'words' && 
                state.currentWordIndex === state.words.length - 1 &&
                typedText.length === targetWordLength &&
                e.inputType !== 'deleteContentBackward'
            ) {
                for (let i = 0; i < targetWordLength; i++) {
                    const targetChar = targetWord[i];
                    const typedChar = typedText[i];
                    if (typedChar === targetChar) {
                        state.rawCorrectCharacters++;
                    } else {
                        state.rawIncorrectCharacters++;
                    }
                }
                endTest();
                return;
            }

            if (e.inputType === 'insertText' && typedText.endsWith(' ')) {
                e.preventDefault();

                const finalTypedWordForCurrentWord = typedText.trim();
                const currentTargetWord = state.words[state.currentWordIndex];

                for (let i = 0; i < Math.max(finalTypedWordForCurrentWord.length, currentTargetWord.length); i++) {
                    const typedChar = finalTypedWordForCurrentWord[i];
                    const targetChar = currentTargetWord[i];

                    if (typedChar === undefined) {
                    } else if (targetChar === undefined) {
                        state.rawExtraCharacters++;
                    } else if (typedChar === targetChar) {
                        state.rawCorrectCharacters++;
                    } else {
                        state.rawIncorrectCharacters++;
                    }
                }
                
                state.currentWordIndex++;
                state.currentCharIndex = 0;
                elements.textInput.value = '';

                if (state.currentTestMode === 'words' && state.currentWordIndex >= state.words.length) {
                    endTest();
                } else if (state.currentWordIndex < state.words.length) {
                    updateCaretPosition();
                }
            } else {
                state.currentCharIndex = typedText.length;
                updateCaretPosition();
                calculateMetrics();
            }
        });
    }

    if (elements.restartBtn) elements.restartBtn.addEventListener('click', resetGame);
    if (elements.resultsRestartBtn) elements.resultsRestartBtn.addEventListener('click', resetGame);

    document.addEventListener('click', (e) => {
        const isClickInsideInput = elements.textInput.contains(e.target);
        const isClickInsideAnyButton = e.target.closest('.button, .option-btn') !== null;
        const isClickInsideSettings = elements.settingsPanel.contains(e.target);
        const isClickInsideResults = elements.resultsScreen.contains(e.target);
        const isClickInsideWordsDisplay = elements.wordsDisplay.contains(e.target);
        
        if (!isClickInsideInput && !isClickInsideAnyButton && !isClickInsideSettings && !isClickInsideResults && !isClickInsideWordsDisplay) {
            elements.textInput.focus();
        }
    });

    if (elements.wordsDisplay) {
        elements.wordsDisplay.addEventListener('click', () => {
            elements.textInput.focus();
        });
    }
}

// --- Initialize the game on load ---
function init() {
    loadSettings(); 
    setupEventListeners(); // Set up all event listeners after elements are referenced
    resetGame(); // Start with a fresh game state
}