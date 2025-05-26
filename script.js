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
  "understand", "learn", "teach", "remember", "forget", "plan", "decide", "choose", "hope", "wish",
  "need", "want", "like", "love", "hate", "enjoy", "prefer", "feel", "touch", "hold",
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

function generateWords() {
    console.log("generateWords() called.");

    // Determine how many words to generate in total for the current test mode
    // (e.g., 50 for words mode, 200 for time mode to ensure enough words are available)
    const totalWordsToGenerate = currentTestMode === 'words' ? currentWordCount : 200;

    // Sanitize commonWords once to remove any internal punctuation
    const sanitizedCommonWords = commonWords
        .map(word => word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase())
        .filter(word => word.length > 0);

    let wordsToUse = []; // This will be the final pool of words before the final shuffle

    // Define the desired proportion for numbers/punctuation when enabled.
    // Let's aim for up to 35% of the total words to be numbers/punctuation combined,
    // as per your request for a "good number" like "at least 30 out of 70".
    const nonWordProportion = 0.35; // You can adjust this percentage (e.g., 0.3 for 30%)

    let numNumbersNeeded = 0;
    let numPunctuationsNeeded = 0;
    let numCommonWordsNeeded = totalWordsToGenerate; // Start by assuming all are common words

    if (includeNumbers && includePunctuation) {
        // If both are enabled, split the non-word proportion evenly between them
        numNumbersNeeded = Math.floor(totalWordsToGenerate * (nonWordProportion / 2));
        numPunctuationsNeeded = Math.floor(totalWordsToGenerate * (nonWordProportion / 2));
        numCommonWordsNeeded = totalWordsToGenerate - numNumbersNeeded - numPunctuationsNeeded;
    } else if (includeNumbers) {
        // If only numbers are enabled, use the full non-word proportion for them
        numNumbersNeeded = Math.floor(totalWordsToGenerate * nonWordProportion);
        numCommonWordsNeeded = totalWordsToGenerate - numNumbersNeeded;
    } else if (includePunctuation) {
        // If only punctuation is enabled, use the full non-word proportion for them
        numPunctuationsNeeded = Math.floor(totalWordsToGenerate * nonWordProportion);
        numCommonWordsNeeded = totalWordsToGenerate - numPunctuationsNeeded;
    }

    // Ensure we don't try to pick more numbers/punctuation than are actually available in their arrays.
    numNumbersNeeded = Math.min(numNumbersNeeded, numbers.length);
    numPunctuationsNeeded = Math.min(numPunctuationsNeeded, punctuations.length);
    // Recalculate common words needed to fill any space if numbers/punctuation arrays were too small
    numCommonWordsNeeded = totalWordsToGenerate - numNumbersNeeded - numPunctuationsNeeded;
    // Also ensure we don't pick more common words than available
    numCommonWordsNeeded = Math.min(numCommonWordsNeeded, sanitizedCommonWords.length);


    // Helper function to get a shuffled slice of an array.
    // If 'count' is more than 'arr.length', it will repeat elements from 'arr' to meet the count.
    function getShuffledSlice(arr, count) {
        if (arr.length === 0 || count <= 0) return [];
        let result = [];
        // If we need more elements than available in the array, repeat the array elements
        if (count > arr.length) {
            while(result.length < count) {
                result.push(...arr.sort(() => 0.5 - Math.random())); // Shuffle and add all
            }
            return result.slice(0, count); // Slice to exact count
        }
        // Otherwise, just get a random slice
        return [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
    }

    // Add the calculated number of common words, numbers, and punctuation to our pool
    wordsToUse = wordsToUse.concat(getShuffledSlice(sanitizedCommonWords, numCommonWordsNeeded));
    wordsToUse = wordsToUse.concat(getShuffledSlice(numbers, numNumbersNeeded));
    wordsToUse = wordsToUse.concat(getShuffledSlice(punctuations, numPunctuationsNeeded));

    // Final check: If somehow we still have too few words (e.g., all source arrays are tiny)
    // Fill the remaining spots with random common words (will repeat if needed)
    while(wordsToUse.length < totalWordsToGenerate && sanitizedCommonWords.length > 0) {
        wordsToUse.push(sanitizedCommonWords[Math.floor(Math.random() * sanitizedCommonWords.length)]);
    }

    // Finally, shuffle the entire combined pool to mix them up randomly
    words = wordsToUse.sort(() => 0.5 - Math.random());

    // Slice to the exact required number, just in case we over-generated slightly in the while loop
    words = words.slice(0, totalWordsToGenerate);

    console.log("Words generated. Total words:", words.length);
    console.log(`Breakdown: Common Words: ${numCommonWordsNeeded}, Numbers: ${numNumbersNeeded}, Punctuation: ${numPunctuationsNeeded}`);
    console.log("First 10 generated words:", words.slice(0, 10));
}

function renderWords() {
    console.log("renderWords() called. Words array length:", words.length);

    // 1. Remove all existing word spans, but keep the caret
    // Iterate in reverse to avoid issues with live NodeList updates
    const existingWordSpans = wordsDisplay.querySelectorAll('.word');
    console.log("Found existing word spans:", existingWordSpans.length);
    for (let i = existingWordSpans.length - 1; i >= 0; i--) {
        existingWordSpans[i].remove();
    }
    console.log("Existing word spans removed.");

    // 2. Ensure caret is the first child (if it somehow got moved)
    if (wordsDisplay.firstChild !== caret) {
        wordsDisplay.prepend(caret);
        console.log("Caret prepended to wordsDisplay.");
    } else {
        console.log("Caret is already first child.");
    }

    // 3. Append new words
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
        wordsDisplay.appendChild(wordSpan); // Append the word span

        // Add a space span after each word, except the last one
        if (wordIndex < words.length - 1) {
            const spaceSpan = document.createElement('span');
            spaceSpan.classList.add('character', 'space');
            spaceSpan.textContent = ' ';
            wordSpan.appendChild(spaceSpan);
        }
        // Log for the first few words to avoid excessive logging for large lists
        if (wordIndex < 5) {
            console.log(`Rendered word ${wordIndex}: "${word}"`);
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
        // No more words or test ended, hide caret
        caret.style.display = 'none';
        console.warn("No current word element found. Hiding caret.");
        return;
    }

    caret.style.display = 'block'; // Ensure caret is visible

    let targetCharacterSpan = null;
    let charactersInCurrentWord = Array.from(currentWordElement.children);

    // If currentCharIndex is within the word length, target that character
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

        // Calculate caret's position relative to wordsDisplay's content area
        // If caret is at the end of a word (on the space), move it right by the width of the last character
        const charWidth = currentCharIndex < words[currentWordIndex].length ? 0 : rect.width;
        const caretLeft = rect.left - displayRect.left + wordsDisplay.scrollLeft + charWidth;
        const caretTop = rect.top - displayRect.top + wordsDisplay.scrollTop;

        caret.style.transform = `translate(${caretLeft}px, ${caretTop}px)`;
        console.log(`Caret moved to: left=${caretLeft}px, top=${caretTop}px`);

        scrollWordsDisplay(rect.top, rect.height); // Pass character's position for scrolling
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
        // console.log("Scrolling up. New scrollTop:", wordsDisplay.scrollTop);
    }
    else if (relativeCharTop + charHeight > wordsDisplayRect.height - scrollBuffer) {
        wordsDisplay.scrollTop = wordsDisplayScrollTop + (relativeCharTop + charHeight - (wordsDisplayRect.height - scrollBuffer));
        // console.log("Scrolling down. New scrollTop:", wordsDisplay.scrollTop);
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
    const remainingTime = currentTestDuration - elapsedTime; // Calculate remaining time

    // Display remaining time
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
    alert(`Test finished! Your WPM: ${wpmDisplay.textContent.split(': ')[1]}, Accuracy: ${accuracyDisplay.textContent.split(': ')[1]}`);
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

    // Set initial timer display to the current test duration
    timerDisplay.textContent = `Time: ${currentTestDuration}s`;
    wpmDisplay.textContent = 'WPM: 0';
    accuracyDisplay.textContent = 'Accuracy: 0%';
    textInput.value = '';
    textInput.disabled = false;
    textInput.focus();
    wordsDisplay.scrollTop = 0;

    generateWords(); // First, generate words
    renderWords(); // Then, render them
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
    }
});

textInput.addEventListener('input', (e) => {
    if (!testStarted || testFinished) return;

    const typedText = textInput.value;
    const currentWordElement = wordsDisplay.querySelectorAll('.word')[currentWordIndex];

    // Safety check: If currentWordElement is null or we're past the words array (e.g., test ended by timer)
    if (!currentWordElement || !words[currentWordIndex]) {
        // If in words mode and somehow past the words, and test hasn't finished, end it.
        if (currentTestMode === 'words' && currentWordIndex >= words.length && !testFinished) {
             endTest();
        }
        return; // Exit if no valid word to process
    }

    const targetWord = words[currentWordIndex];
    const targetWordLength = targetWord.length;

    // --- Character styling logic (marking correct/incorrect characters) ---
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
    // --- End character styling logic ---


    // *** NEW LOGIC: End test immediately when the last word's last character is typed ***
    if (currentTestMode === 'words' &&               // Only apply in words mode
        currentWordIndex === words.length - 1 &&    // Check if it's the very last word
        typedText.length === targetWordLength        // Check if the user has typed its full length
    ) {
        // User has successfully finished typing the last character of the last word.
        // Update totals for this word before ending the test.
        totalCharactersTyped += typedText.length;
        correctCharactersTyped += correctCharsInCurrentVisualWord;
        endTest(); // End the test
        return; // Important: Exit the function to prevent further processing for this input event
    }

    // *** Original logic for handling spacebar or regular character input ***
    // This block now only runs if the test was NOT ended by the new logic above.
    if (e.inputType === 'insertText' && typedText.endsWith(' ')) {
        e.preventDefault(); // Prevent the space from showing in the input field

        totalCharactersTyped += typedText.length; // Include the typed word and space
        correctCharactersTyped += correctCharsInCurrentVisualWord; // Add correct chars for the word

        // Move to the next word
        currentWordIndex++;
        currentCharIndex = 0;
        textInput.value = ''; // Clear input field

        // Check if the test should end because we've run out of words (in words mode)
        // This path will now primarily handle moving between words,
        // or ending if the very last word was completed with a space (less likely now)
        if (currentTestMode === 'words' && currentWordIndex >= words.length) {
            endTest();
        } else if (currentWordIndex < words.length) {
            updateCaretPosition(); // Move caret to the start of the next word
        }
    } else { // This 'else' block runs for any non-space character input (e.g., letters, numbers, punctuation)
        currentCharIndex = typedText.length; // Update caret position to the end of typed text
        updateCaretPosition();
        calculateMetrics(); // Recalculate WPM/Accuracy on each character typed
    }
});


restartBtn.addEventListener('click', resetGame);

// --- Initialize the game on load ---
// Set initial active states for buttons
document.querySelector('#time-options .option-btn[data-value="30"]').classList.add('active');
document.querySelector('#mode-time').classList.add('active');
resetGame();

window.addEventListener('load', () => {
    textInput.focus();
});

document.addEventListener('click', (e) => {
    if (!textInput.contains(e.target) &&
        !restartBtn.contains(e.target) &&
        !wordsDisplay.contains(e.target) &&
        !document.querySelector('.settings-panel').contains(e.target)) {
        textInput.focus();
    }
});

wordsDisplay.addEventListener('click', () => {
    textInput.focus();
});