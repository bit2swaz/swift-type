const wordsDisplay = document.getElementById('words-display');
const textInput = document.getElementById('text-input');
const timerElement = document.getElementById('timer');
const wordsContainer = document.getElementById('words-container');
const timeButtons = document.querySelectorAll('.time-btn');
const includeNumbersBtn = document.getElementById('include-numbers-btn');
const includePunctuationBtn = document.getElementById('include-punctuation-btn');
const resultsScreen = document.getElementById('results-screen');
const wpmValue = document.getElementById('wpm-value');
const accuracyValue = document.getElementById('accuracy-value');
const rawWpmValue = document.getElementById('raw-wpm-value');
const restartBtn = document.getElementById('restart-btn');
const themeToggle = document.getElementById('theme-toggle');
const liveWpmElement = document.getElementById('live-wpm');
const liveAccuracyElement = document.getElementById('live-accuracy');
const caret = document.getElementById('caret');

// NEW: Elements for accuracy breakdown
const correctCharsResult = document.createElement('div');
correctCharsResult.className = 'detail-item';
correctCharsResult.innerHTML = '<span class="detail-label">Correct</span><span class="detail-value correct" id="correct-chars-value">0</span>';

const incorrectCharsResult = document.createElement('div');
incorrectCharsResult.className = 'detail-item';
incorrectCharsResult.innerHTML = '<span class="detail-label">Incorrect</span><span class="detail-value incorrect" id="incorrect-chars-value">0</span>';

const extraCharsResult = document.createElement('div');
extraCharsResult.className = 'detail-item';
extraCharsResult.innerHTML = '<span class="detail-label">Extra</span><span class="detail-value extra" id="extra-chars-value">0</span>';

// --- Configuration and State Variables ---
const baseWordList = [
    "the", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog",
    "apple", "banana", "orange", "grape", "kiwi", "melon", "peach", "plum",
    "keyboard", "mouse", "monitor", "speaker", "headphone", "microphone",
    "program", "code", "develop", "debug", "compile", "execute", "function",
    "variable", "array", "object", "string", "number", "boolean", "null",
    "undefined", "loop", "condition", "statement", "element", "attribute",
    "galaxy", "universe", "planet", "star", "rocket", "shuttle", "comet",
    "travel", "adventure", "explore", "journey", "destination", "voyage",
    "serene", "tranquil", "peaceful", "calm", "relax", "meditate", "breathe",
    "wisdom", "knowledge", "learn", "teach", "educate", "understand", "insight",
    "computer", "science", "algorithm", "data", "structure", "network", "internet",
    "website", "frontend", "backend", "database", "server", "client", "framework",
    "javascript", "html", "css", "python", "java", "ruby", "csharp", "php", "swift",
    "typescript", "react", "angular", "vue", "node", "express", "django", "rails",
    "spring", "flask", "laravel", "bootstrap", "tailwind", "material", "design",
    "responsive", "mobile", "desktop", "application", "software", "hardware", "firmware",
    "promise", "async", "await", "closure", "scope", "hosting", "inheritance", "polymorphism",
    "abstraction", "encapsulation", "interface", "class", "module", "package", "library",
    "framework", "component", "render", "state", "props", "lifecycle", "hook", "context",
    "reducer", "memo", "callback", "effect", "ref", "portal", "fragment", "suspense",
    "error", "boundary", "storybook", "webpack", "babel", "eslint", "prettier", "jest",
    "cypress", "selenium", "docker", "kubernetes", "cloud", "aws", "azure", "gcp",
    "serverless", "lambda", "api", "rest", "graphql", "websocket", "http", "https",
    "security", "authentication", "authorization", "encryption", "decryption", "hashing",
    "algorithm", "cryptography", "blockchain", "ethereum", "bitcoin", "nft", "smart", "contract"
];
const numbers = "0123456789";
const symbols = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";

let words = [];
let wordElements = [];
let currentWordIndex = 0;
let currentCharIndex = 0;
let timerId = null;
let timeLeft = 60;
let typingStarted = false;
let totalCorrectChars = 0;
let totalIncorrectChars = 0;
let totalExtraChars = 0; // NEW: Track extra characters
let rawCharsTyped = 0;
let startTime = 0;
let generatedWordCount = 0;

let includeNumbers = false;
let includePunctuation = false;


const lineHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--calculated-line-height'));

// --- Game Initialization & Reset ---

function initGame() {
    // Reset state
    currentWordIndex = 0;
    currentCharIndex = 0;
    typingStarted = false;
    totalCorrectChars = 0;
    totalIncorrectChars = 0;
    totalExtraChars = 0; // NEW: Reset extra chars
    rawCharsTyped = 0;
    clearInterval(timerId);
    timerElement.textContent = timeLeft;
    liveWpmElement.textContent = 'WPM: 0';
    liveAccuracyElement.textContent = 'Acc: 0%';

    resultsScreen.classList.add('hidden');
    wordsContainer.style.display = 'block';
    textInput.style.display = 'block';
    textInput.disabled = false;
    textInput.value = '';

    generatedWordCount = 0;
    generateWords(true); // Generate new words (true for initial clear)
    textInput.focus();
    scrollWordsDisplay(true); // Reset scroll to top
    caret.style.display = 'none'; // NEW: Hide caret initially, show on first input
    // positionCaret() will be called when typing starts or current word/char changes
}

// --- Word Generation ---

function getRandomWordBasedOnSettings() {
    const r = Math.random();
    if (includeNumbers && r < 0.1) { // 10% chance for a number
        return numbers[Math.floor(Math.random() * numbers.length)];
    }
    if (includePunctuation && r < 0.2) { // 20% chance for a symbol (if not a number)
        return symbols[Math.floor(Math.random() * symbols.length)];
    }
    return baseWordList[Math.floor(Math.random() * baseWordList.length)];
}

function generateWords(clearExisting = false) {
    if (clearExisting) {
        wordsDisplay.innerHTML = '';
        // NEW: Re-append caret to ensure it's always the first child
        // Removed: wordsDisplay.appendChild(caret); We append it dynamically during positionCaret if needed.
        words = [];
        wordElements = [];
    }

    const wordsToGenerate = 50;
    for (let i = 0; i < wordsToGenerate; i++) {
        const word = getRandomWordBasedOnSettings(); // Use the new function
        words.push(word);

        const wordSpan = document.createElement('span');
        wordSpan.classList.add('word');
        word.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.classList.add('char');
            charSpan.textContent = char;
            wordSpan.appendChild(charSpan);
        });
        wordsDisplay.appendChild(wordSpan);
        wordElements.push(wordSpan);
    }
    generatedWordCount += wordsToGenerate;

    // Initial highlight for the first word and caret placement
    if (currentWordIndex === 0 && wordElements[0]) {
        wordElements[0].classList.add('current-word-highlight');
        if (wordElements[0].children[0]) {
            wordElements[0].children[0].classList.add('current');
        }
    }
    positionCaret(); // Ensure caret is positioned after words are generated
}

// --- Live Stats Update ---
function updateLiveStats() {
    if (!typingStarted || rawCharsTyped === 0) {
        liveWpmElement.textContent = 'WPM: 0';
        liveAccuracyElement.textContent = 'Acc: 0%';
        return;
    }

    const timeElapsed = (Date.now() - startTime) / 1000;
    if (timeElapsed === 0) return;

    const currentWPM = (totalCorrectChars / 5) / (timeElapsed / 60);
    let currentAccuracy = 0;
    if (rawCharsTyped > 0) {
        currentAccuracy = (totalCorrectChars / rawCharsTyped) * 100;
    }

    liveWpmElement.textContent = `WPM: ${Math.max(0, currentWPM).toFixed(0)}`;
    liveAccuracyElement.textContent = `Acc: ${Math.max(0, currentAccuracy).toFixed(0)}%`;
}

// --- Timer Logic ---

function startTimer() {
    startTime = Date.now();
    timerId = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const remainingTime = timeLeft - elapsedTime;
        timerElement.textContent = remainingTime > 0 ? remainingTime : 0;

        updateLiveStats();

        if (remainingTime <= 0) {
            clearInterval(timerId);
            endTest();
        }
    }, 1000);
}

// --- End Test Logic ---

function endTest() {
    textInput.disabled = true;
    textInput.value = '';
    typingStarted = false;
    clearInterval(timerId);

    wordsContainer.style.display = 'none';
    textInput.style.display = 'none';
    caret.style.display = 'none'; // Hide caret on test end

    // Remove current word highlight
    if (currentWordIndex < wordElements.length) {
        wordElements[currentWordIndex].classList.remove('current-word-highlight');
    }

    const finalTimeTaken = timeLeft;
    const grossWPM = (rawCharsTyped / 5) / (finalTimeTaken / 60);
    const netWPM = (totalCorrectChars / 5) / (finalTimeTaken / 60);

    let accuracy = 0;
    if (rawCharsTyped > 0) {
        accuracy = (totalCorrectChars / rawCharsTyped) * 100;
    }

    wpmValue.textContent = Math.max(0, netWPM).toFixed(0);
    accuracyValue.textContent = `${Math.max(0, accuracy).toFixed(0)}%`;
    rawWpmValue.textContent = Math.max(0, grossWPM).toFixed(0);

    // NEW: Display accuracy breakdown
    document.getElementById('correct-chars-value').textContent = totalCorrectChars;
    document.getElementById('incorrect-chars-value').textContent = totalIncorrectChars;
    document.getElementById('extra-chars-value').textContent = totalExtraChars;

    // Create a container for the detail items and append
    const accuracyDetailsContainer = document.createElement('div');
    accuracyDetailsContainer.className = 'accuracy-details';
    accuracyDetailsContainer.appendChild(correctCharsResult);
    accuracyDetailsContainer.appendChild(incorrectCharsResult);
    accuracyDetailsContainer.appendChild(extraCharsResult);

    // Append the details container to the results screen, if not already there
    const existingDetails = resultsScreen.querySelector('.accuracy-details');
    if (existingDetails) {
        existingDetails.remove(); // Remove old one if exists
    }
    resultsScreen.querySelector('.result-stats').after(accuracyDetailsContainer); // Insert after main stats

    resultsScreen.classList.remove('hidden');
}

// --- Scrolling Logic ---

function scrollWordsDisplay(reset = false) {
    if (reset) {
        wordsDisplay.style.transform = `translateY(0px)`;
        return;
    }

    if (currentWordIndex >= wordElements.length) return;

    const currentWordElement = wordElements[currentWordIndex];
    // This is the top of the current word relative to the wordsDisplay container
    const wordTopRelativeToDisplay = currentWordElement.offsetTop;

    // We want the current line to be approximately centered or at a certain visible position
    // Let's aim for the current line to be roughly at the 2nd line's position within the 3-line view.
    const targetScrollPosition = lineHeight * 1; // 1 means the second line (0-indexed)

    // Calculate the Y translation needed
    // The wordsDisplay moves UP by this amount
    const requiredTranslateY = -(wordTopRelativeToDisplay - targetScrollPosition);

    wordsDisplay.style.transform = `translateY(${requiredTranslateY}px)`;
}

// --- Caret Positioning (REVISED for accuracy) ---

function positionCaret() {
    const currentWordElement = wordElements[currentWordIndex];
    if (!currentWordElement) {
        caret.style.display = 'none'; // Hide caret if no current word (e.g., end of test)
        return;
    }

    let targetCharElement;
    let caretLeft = 0; // Relative to the start of the wordsDisplay
    let caretTop = 0; // Relative to the start of the wordsDisplay

    if (currentCharIndex < currentWordElement.children.length) {
        // Caret is before a character within the current word
        targetCharElement = currentWordElement.children[currentCharIndex];
    } else {
        // Caret is at the end of the current word (after the last char)
        targetCharElement = currentWordElement.children[currentWordElement.children.length - 1];
    }

    if (targetCharElement) {
        const wordsDisplayRect = wordsDisplay.getBoundingClientRect();
        const targetRect = targetCharElement.getBoundingClientRect();

        // Calculate caret's left position
        if (currentCharIndex < currentWordElement.children.length) {
            // Caret is at the start of targetCharElement
            caretLeft = targetRect.left - wordsDisplayRect.left;
        } else {
            // Caret is at the end of the last character
            caretLeft = targetRect.right - wordsDisplayRect.left;
        }

        // Calculate caret's top position (should be the same as the character's top)
        caretTop = targetRect.top - wordsDisplayRect.top;

    } else {
        // This case handles empty words or when starting the first word.
        // Position caret at the beginning of the current word element.
        const wordsDisplayRect = wordsDisplay.getBoundingClientRect();
        const currentWordRect = currentWordElement.getBoundingClientRect();
        caretLeft = currentWordRect.left - wordsDisplayRect.left;
        caretTop = currentWordRect.top - wordsDisplayRect.top;
    }

    // Apply the current scroll translation of wordsDisplay to caret's top
    // Because caret is positioned absolutely inside wordsDisplay, its 'top' is relative to wordsDisplay's content.
    // The `wordsDisplay.style.transform` already handles the visual scroll.
    // So, caretTop calculated above is already correct relative to the visible part of wordsDisplay.

    caret.style.left = `${caretLeft}px`;
    caret.style.top = `${caretTop}px`;
    caret.style.display = 'block'; // Ensure caret is visible
}


function updateWordAndCaretHighlight() {
    // Remove highlight from previous word
    if (currentWordIndex > 0 && wordElements[currentWordIndex - 1]) {
        wordElements[currentWordIndex - 1].classList.remove('current-word-highlight');
        // Ensure character highlight is also removed from old word
        const prevWordChildren = wordElements[currentWordIndex - 1].children;
        if (prevWordChildren && prevWordChildren.length > 0) {
            // Remove 'current' from all chars in previous word
            Array.from(prevWordChildren).forEach(charEl => charEl.classList.remove('current'));
        }
    }

    // Add highlight to current word
    if (wordElements[currentWordIndex]) {
        wordElements[currentWordIndex].classList.add('current-word-highlight');
        // Add current char highlight to the first char of the new word
        if (wordElements[currentWordIndex].children[0]) {
            wordElements[currentWordIndex].children[0].classList.add('current');
        }
    }

    // Position caret after all class updates
    positionCaret();
}


// --- Event Handlers ---

function handleKeyDown(e) {
    if (textInput.disabled && (e.key === 'Tab' || e.key === 'Enter')) {
        e.preventDefault(); // Prevent default Tab/Enter behavior
        initGame(); // Restart game
        return;
    }
    if (textInput.disabled) return;

    if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault(); // Prevent default Tab/Enter behavior
        initGame(); // Restart game even if typing
        return;
    }

    if (!typingStarted && e.key.length === 1 && e.key !== ' ') {
        typingStarted = true;
        startTimer();
        caret.style.display = 'block'; // Ensure caret is visible when typing starts
    }

    const currentWordElement = wordElements[currentWordIndex];
    const targetWord = words[currentWordIndex];

    if (e.key === ' ') {
        e.preventDefault();

        const typedValue = textInput.value;

        // Mark any untyped characters as incorrect on spacebar press
        for (let i = typedValue.length; i < targetWord.length; i++) {
            const charEl = currentWordElement.children[i];
            if (charEl) {
                if (!charEl.classList.contains('correct') && !charEl.classList.contains('incorrect')) {
                    charEl.classList.add('incorrect');
                    totalIncorrectChars++;
                }
            }
        }
        // Count extra characters typed beyond the word length as incorrect
        if (typedValue.length > targetWord.length) {
             totalExtraChars += (typedValue.length - targetWord.length); // NEW: Track as extra
             // No need to add to totalIncorrectChars here, it's covered by totalExtraChars for final accuracy
        }

        currentWordElement.classList.add('typed'); // Apply 'typed' class for visual fading
        currentWordElement.classList.remove('current-word-highlight'); // Remove highlight from current word

        // Remove 'current' class from the last char of the previous word (if it exists)
        if (currentCharIndex > 0 && currentWordElement.children[currentCharIndex - 1]) {
            currentWordElement.children[currentCharIndex - 1].classList.remove('current');
        } else if (currentWordElement.children[0]) { // If only 1 char typed or none, remove from first
             currentWordElement.children[0].classList.remove('current');
        }


        currentWordIndex++;
        currentCharIndex = 0;
        textInput.value = '';

        if (currentWordIndex >= generatedWordCount - 20) { // If near end of generated words, generate more
            generateWords();
        }

        if (currentWordIndex < wordElements.length) {
            updateWordAndCaretHighlight(); // Update highlight and caret for new word
            scrollWordsDisplay();
        } else {
            endTest();
        }
    } else if (e.key === 'Backspace') {
        e.preventDefault();

        const typedText = textInput.value;

        // Handle backspacing within the current word
        if (currentCharIndex > 0) {
            const charEl = currentWordElement.children[currentCharIndex - 1];

            // If we're deleting an 'extra' character (typed beyond word length)
            if (typedText.length > words[currentWordIndex].length && charEl.classList.contains('incorrect') && charEl.classList.contains('extra')) {
                totalExtraChars--;
            } else if (charEl.classList.contains('correct')) {
                totalCorrectChars--;
            } else if (charEl.classList.contains('incorrect')) {
                totalIncorrectChars--;
            }

            charEl.classList.remove('current', 'correct', 'incorrect', 'extra'); // Remove all classes

            currentCharIndex--;
            textInput.value = typedText.substring(0, typedText.length - 1);

            // Re-add 'current' class to the char *before* the backspace (if any)
            if (currentCharIndex >= 0 && currentWordElement.children[currentCharIndex]) {
                currentWordElement.children[currentCharIndex].classList.add('current');
            } else if (currentCharIndex === 0 && currentWordElement.children[0]) {
                currentWordElement.children[0].classList.add('current');
            }


            currentWordElement.classList.remove('typed'); // Ensure word is not faded if backspacing into it
            rawCharsTyped = Math.max(0, rawCharsTyped - 1); // Decrement raw typed count
            positionCaret(); // Reposition caret
        }
        // Handle backspacing to the previous word
        else if (currentWordIndex > 0) {
            // Remove 'current' class from the char we were just on (first char of current word)
            if (currentWordElement.children[0]) {
                currentWordElement.children[0].classList.remove('current');
            }

            currentWordIndex--;
            const prevWordElement = wordElements[currentWordIndex];
            const prevWord = words[currentWordIndex];
            currentCharIndex = prevWord.length; // Set index to end of previous word

            prevWordElement.classList.remove('typed');
            updateWordAndCaretHighlight(); // Highlight previous word and position caret

            // Clear char states on the previous word as we are re-typing it
            for (let i = 0; i < prevWord.length; i++) {
                prevWordElement.children[i].classList.remove('correct', 'incorrect', 'extra');
            }

            textInput.value = prevWord; // Load the whole word into the input for backspacing
            scrollWordsDisplay();
            // Re-evaluate counts for previous word
            recalculateCharStatesAndCounts();
        }
        updateLiveStats();
    } else if (e.key.length > 1 && e.key !== 'Enter' && e.key !== 'Tab' && e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Meta') {
        e.preventDefault();
    }
}

function handleInput(e) {
    if (textInput.disabled) return;

    if (e.inputType === 'deleteContentBackward') {
        return; // Handled by keydown backspace
    }

    const currentWordElement = wordElements[currentWordIndex];
    const targetWord = words[currentWordIndex];
    const typedValue = textInput.value;
    rawCharsTyped++; // Increment raw typed count for every input character

    // Remove 'current' class from the character that *was* current (if any)
    if (currentCharIndex > 0 && currentWordElement.children[currentCharIndex - 1]) {
        currentWordElement.children[currentCharIndex - 1].classList.remove('current');
    }

    if (typedValue.length > targetWord.length) {
        // If extra chars are typed, mark them as 'extra' incorrect.
        // We need to add an 'extra' class to the word element if it's new.
        // Or handle an actual new extra char in the char list.
        // For simplicity, we'll increment totalExtraChars and rely on the input's length.
        // The display will just show a caret past the word, and the user can delete.
        totalExtraChars++;
        // No char element to mark, as it's an "excess" character not belonging to the word
        // The visual will be just the caret moving past the last character of the word.
    } else if (currentCharIndex < targetWord.length) {
        const charEl = currentWordElement.children[currentCharIndex];
        const targetChar = targetWord[currentCharIndex];
        const typedChar = typedValue[typedValue.length - 1]; // Get the last typed character

        if (!typedChar) return; // Should not happen if inputType isn't delete

        if (typedChar === targetChar) {
            charEl.classList.remove('incorrect', 'extra'); // Clean up before adding correct
            charEl.classList.add('correct');
            totalCorrectChars++;
        } else {
            charEl.classList.remove('correct', 'extra'); // Clean up before adding incorrect
            charEl.classList.add('incorrect');
            totalIncorrectChars++;
        }
    }

    currentCharIndex++; // Move to the next expected character index

    // Set the next character as 'current' or handle end of word for caret positioning
    if (currentCharIndex < targetWord.length) {
        currentWordElement.children[currentCharIndex].classList.add('current');
    } else if (currentWordElement.children[targetWord.length - 1]) {
        // If at the end of the word (or beyond it), remove 'current' from the last char.
        // The caret will position itself after the last char.
        currentWordElement.children[targetWord.length - 1].classList.remove('current');
    }

    positionCaret(); // Reposition caret after each input
    updateLiveStats();
}

function recalculateCharStatesAndCounts() {
    totalCorrectChars = 0;
    totalIncorrectChars = 0;
    totalExtraChars = 0; // NEW: Reset extra chars
    rawCharsTyped = 0;

    for (let i = 0; i <= currentWordIndex; i++) {
        const wordEl = wordElements[i];
        const wordText = words[i];
        let currentTypedValue = (i === currentWordIndex) ? textInput.value : wordText; // For completed words, use original word for re-evaluation

        for (let j = 0; j < wordText.length; j++) {
            const charEl = wordEl.children[j];
            if (charEl.classList.contains('correct')) {
                totalCorrectChars++;
            } else if (charEl.classList.contains('incorrect')) {
                totalIncorrectChars++;
            }
            // Count raw characters for all typed chars (correct/incorrect) within the target word length
            if (j < currentTypedValue.length) {
                 rawCharsTyped++;
            }
        }

        // Account for extra characters on the *current* word if present in textInput
        if (i === currentWordIndex && currentTypedValue.length > wordText.length) {
            totalExtraChars += (currentTypedValue.length - wordText.length);
            rawCharsTyped += (currentTypedValue.length - wordText.length); // Count extra chars as raw typed
        }
    }
}


// --- Settings Persistence ---
function saveSettings() {
    localStorage.setItem('selectedTime', timeLeft);
    localStorage.setItem('includeNumbers', includeNumbers);
    localStorage.setItem('includePunctuation', includePunctuation);
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
}

function loadSettings() {
    const savedTime = localStorage.getItem('selectedTime');
    if (savedTime) {
        timeLeft = parseInt(savedTime);
        timeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.time) === timeLeft) {
                btn.classList.add('active');
            }
        });
    }

    const savedNumbers = localStorage.getItem('includeNumbers');
    if (savedNumbers !== null) {
        includeNumbers = (savedNumbers === 'true');
        if (includeNumbers) {
            includeNumbersBtn.classList.add('active');
        } else {
            includeNumbersBtn.classList.remove('active');
        }
    }

    const savedPunctuation = localStorage.getItem('includePunctuation');
    if (savedPunctuation !== null) {
        includePunctuation = (savedPunctuation === 'true');
        if (includePunctuation) {
            includePunctuationBtn.classList.add('active');
        } else {
            includePunctuationBtn.classList.remove('active');
        }
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        themeToggle.checked = true;
    } else {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        themeToggle.checked = false;
    }
}


// --- Event Listeners Setup ---

function setupEventListeners() {
    textInput.addEventListener('keydown', handleKeyDown);
    textInput.addEventListener('input', handleInput);

    timeButtons.forEach(button => {
        button.addEventListener('click', () => {
            timeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            timeLeft = parseInt(button.dataset.time);
            saveSettings();
            initGame();
        });
    });

    includeNumbersBtn.addEventListener('click', () => {
        includeNumbers = !includeNumbers;
        includeNumbersBtn.classList.toggle('active', includeNumbers);
        saveSettings();
        initGame();
    });

    includePunctuationBtn.addEventListener('click', () => {
        includePunctuation = !includePunctuation;
        includePunctuationBtn.classList.toggle('active', includePunctuation);
        saveSettings();
        initGame();
    });

    restartBtn.addEventListener('click', initGame);

    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('light-theme');
        document.body.classList.toggle('dark-theme');
        saveSettings();
    });

    // NEW: Global keydown listener for Tab key restart
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' || e.key === 'Enter') {
            // Only prevent default and restart if input is focused or results screen is visible
            if (document.activeElement === textInput || !resultsScreen.classList.contains('hidden')) {
                e.preventDefault();
                initGame();
            }
        }
    });
}

// --- Initial Game Setup ---
loadSettings();
setupEventListeners();
initGame();