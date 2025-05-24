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
const caret = document.getElementById('caret'); // Make sure this global variable exists and points to the HTML element

// NEW: Elements for accuracy breakdown (ensure these are globally accessible or created within endTest)
// For now, let's assume they are created dynamically within endTest to simplify initial setup and avoid null errors.
// We'll clean up if they exist before creating new ones.

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
let totalExtraChars = 0;
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
    totalExtraChars = 0;
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
    // caret.style.display = 'none'; // HIDDEN: We'll manage display in positionCaret/handleInput.
                                   // Caret starts visible, but in the correct place.
    positionCaret(); // CRITICAL: Position caret on game start
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
        // CRITICAL FIX: Ensure caret is appended back to wordsDisplay if cleared
        wordsDisplay.appendChild(caret); // The caret needs to be in the DOM!
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
    // positionCaret() is called by initGame, so no need to call it here unless it's a re-gen without init.
    // For now, initGame calls it after generating.
}

// --- Live Stats Update ---
function updateLiveStats() {
    if (!typingStarted && rawCharsTyped === 0) { // If not started and no chars typed, show 0
        liveWpmElement.textContent = 'WPM: 0';
        liveAccuracyElement.textContent = 'Acc: 0%';
        return;
    }
    if (!typingStarted && rawCharsTyped > 0) { // If started but timer hasn't begun (e.g., first char)
        // do nothing, wait for timer to start for WPM
    }


    const timeElapsed = (Date.now() - startTime) / 1000;
    // Only update WPM if time has elapsed
    const currentWPM = (timeElapsed > 0) ? (totalCorrectChars / 5) / (timeElapsed / 60) : 0;
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
    // Recalculate based on total typed characters
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

    // CRITICAL FIX: Correctly append accuracy details *inside* resultsScreen
    // Get the element where you want to append these details.
    // Assuming 'result-stats' is the main stats block, we can add a new div after it.
    const resultsStatsContainer = resultsScreen.querySelector('.result-stats');
    let accuracyDetailsContainer = resultsScreen.querySelector('.accuracy-details');

    if (!accuracyDetailsContainer) { // Create if it doesn't exist
        accuracyDetailsContainer = document.createElement('div');
        accuracyDetailsContainer.className = 'accuracy-details';
        resultsStatsContainer.after(accuracyDetailsContainer); // Insert after main stats
    } else {
        // Clear previous content if it already existed
        accuracyDetailsContainer.innerHTML = '';
    }

    // Now populate the new container with the detail items
    const correctCharsResult = document.createElement('div');
    correctCharsResult.className = 'detail-item';
    correctCharsResult.innerHTML = `<span class="detail-label">Correct</span><span class="detail-value correct">${totalCorrectChars}</span>`;

    const incorrectCharsResult = document.createElement('div');
    incorrectCharsResult.className = 'detail-item';
    incorrectCharsResult.innerHTML = `<span class="detail-label">Incorrect</span><span class="detail-value incorrect">${totalIncorrectChars}</span>`;

    const extraCharsResult = document.createElement('div');
    extraCharsResult.className = 'detail-item';
    extraCharsResult.innerHTML = `<span class="detail-label">Extra</span><span class="detail-value extra">${totalExtraChars}</span>`;

    accuracyDetailsContainer.appendChild(correctCharsResult);
    accuracyDetailsContainer.appendChild(incorrectCharsResult);
    accuracyDetailsContainer.appendChild(extraCharsResult);


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

// --- Caret Positioning (REVISED for accuracy and robustness) ---

function positionCaret() {
    const currentWordElement = wordElements[currentWordIndex];
    if (!currentWordElement) {
        caret.style.display = 'none'; // Hide caret if no current word (e.g., end of test)
        return;
    }

    let targetElementForCaret; // This will be the char element or the word element itself
    let caretLeftOffsetInWord = 0; // Offset from the beginning of the current word element

    // Determine the element that dictates the caret's X position
    if (currentCharIndex < currentWordElement.children.length) {
        // Caret is before a character within the current word
        targetElementForCaret = currentWordElement.children[currentCharIndex];
    } else {
        // Caret is at the end of the current word (after the last char)
        targetElementForCaret = currentWordElement.children[currentWordElement.children.length - 1];
    }

    // If there's a specific character to base the caret on
    if (targetElementForCaret) {
        const targetRect = targetElementForCaret.getBoundingClientRect();
        const currentWordRect = currentWordElement.getBoundingClientRect();

        // Calculate caret's left position relative to the *start of the current word*
        if (currentCharIndex < currentWordElement.children.length) {
            // Caret is at the start of targetCharElement
            caretLeftOffsetInWord = targetRect.left - currentWordRect.left;
        } else {
            // Caret is at the end of the last character
            caretLeftOffsetInWord = targetRect.right - currentWordRect.left;
        }
    } else {
        // This case handles empty words or when starting the first word.
        // Position caret at the beginning of the current word element itself.
        caretLeftOffsetInWord = 0; // Relative to the start of the word
    }

    // Now, calculate caret's absolute position within wordsDisplay
    const wordsDisplayRect = wordsDisplay.getBoundingClientRect();
    const currentWordRect = currentWordElement.getBoundingClientRect();

    // The caret's final left position within wordsDisplay is the current word's offset
    // plus the caret's offset within that word.
    const finalCaretLeft = (currentWordRect.left - wordsDisplayRect.left) + caretLeftOffsetInWord;
    const finalCaretTop = currentWordRect.top - wordsDisplayRect.top; // Caret's top aligns with the word's top

    caret.style.left = `${finalCaretLeft}px`;
    caret.style.top = `${finalCaretTop}px`;
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
    // CRITICAL FIX: Handle Tab/Enter for restart regardless of disabled state
    if (e.key === 'Tab' || e.key === 'Enter') {
        // Prevent default browser behavior (like tabbing through elements)
        e.preventDefault();
        initGame(); // Restart game
        return; // Exit early
    }

    if (textInput.disabled) return; // If not Tab/Enter, and disabled, ignore other keys


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
                // Ensure chars are marked if skipped
                if (!charEl.classList.contains('correct') && !charEl.classList.contains('incorrect')) {
                    charEl.classList.add('incorrect');
                    totalIncorrectChars++;
                }
            }
        }
        // Count extra characters typed beyond the word length as incorrect
        if (typedValue.length > targetWord.length) {
             totalExtraChars += (typedValue.length - targetWord.length);
        }

        currentWordElement.classList.add('typed'); // Apply 'typed' class for visual fading
        currentWordElement.classList.remove('current-word-highlight'); // Remove highlight from current word

        // Remove 'current' class from all chars in the word we just finished
        Array.from(currentWordElement.children).forEach(charEl => charEl.classList.remove('current'));


        currentWordIndex++;
        currentCharIndex = 0; // Reset char index for the new word
        textInput.value = ''; // Clear input for the new word

        if (currentWordIndex >= generatedWordCount - 20) { // If near end of generated words, generate more
            generateWords(); // This will re-add words and then initGame will position caret
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
            // If deleting an extra char, it won't have a charElement
            if (typedText.length > words[currentWordIndex].length) {
                totalExtraChars--;
            } else {
                const charEl = currentWordElement.children[currentCharIndex - 1];
                if (charEl) {
                    if (charEl.classList.contains('correct')) {
                        totalCorrectChars--;
                    } else if (charEl.classList.contains('incorrect')) {
                        totalIncorrectChars--;
                    }
                    charEl.classList.remove('current', 'correct', 'incorrect', 'extra'); // Clean all classes
                }
            }

            currentCharIndex--;
            textInput.value = typedText.substring(0, typedText.length - 1);

            // Re-add 'current' class to the char *before* the backspace (if any)
            if (currentCharIndex >= 0 && currentCharIndex < words[currentWordIndex].length) {
                 currentWordElement.children[currentCharIndex].classList.add('current');
            } else if (words[currentWordIndex].length === 0 && currentCharIndex === 0) {
                // If backspacing on an empty word (like a number/punctuation word)
                // This case is tricky, but ensure caret is at start of this word
                // No char to apply 'current' to
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
    } else if (e.key.length > 1 && e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Meta') {
        e.preventDefault(); // Prevent default for other non-typing keys
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
    // CRITICAL FIX: Ensure this removes from the PREVIOUS char index
    if (currentCharIndex > 0 && currentWordIndex < wordElements.length && currentWordElement.children[currentCharIndex - 1]) {
        currentWordElement.children[currentCharIndex - 1].classList.remove('current');
    }

    if (typedValue.length > targetWord.length) {
        totalExtraChars++;
    } else if (currentCharIndex < targetWord.length) {
        const charEl = currentWordElement.children[currentCharIndex];
        const targetChar = targetWord[currentCharIndex];
        const typedChar = typedValue[typedValue.length - 1]; // Get the last typed character

        if (!typedChar) return; // Should not happen if inputType isn't delete

        if (typedChar === targetChar) {
            charEl.classList.remove('incorrect', 'extra');
            charEl.classList.add('correct');
            totalCorrectChars++;
        } else {
            charEl.classList.remove('correct', 'extra');
            charEl.classList.add('incorrect');
            totalIncorrectChars++;
        }
    }

    currentCharIndex++; // Move to the next expected character index

    // Set the next character as 'current' or handle end of word for caret positioning
    // CRITICAL FIX: Ensure 'current' class is only applied to the character *if it exists* within the word's bounds
    if (currentCharIndex < targetWord.length && currentWordElement.children[currentCharIndex]) {
        currentWordElement.children[currentCharIndex].classList.add('current');
    } else if (currentWordElement.children[targetWord.length - 1]) {
        // If at the end of the word (or beyond it), ensure no 'current' on the last char.
        currentWordElement.children[targetWord.length - 1].classList.remove('current');
    }

    positionCaret(); // Reposition caret after each input
    updateLiveStats();
}

function recalculateCharStatesAndCounts() {
    totalCorrectChars = 0;
    totalIncorrectChars = 0;
    totalExtraChars = 0;
    rawCharsTyped = 0;

    for (let i = 0; i <= currentWordIndex; i++) {
        const wordEl = wordElements[i];
        const wordText = words[i];
        // Use textInput.value for the current word, or the full word text for completed words.
        let currentTypedValue = (i === currentWordIndex) ? textInput.value : words[i];

        // Ensure currentTypedValue doesn't exceed the actual word length if it's a completed word
        if (i < currentWordIndex) {
            currentTypedValue = words[i]; // For completed words, use the actual word for evaluation
        } else if (i === currentWordIndex) {
            currentTypedValue = textInput.value; // For the current word, use what's in the input
        }


        for (let j = 0; j < wordText.length; j++) {
            // Only count chars that were actually typed (within currentTypedValue length)
            if (j < currentTypedValue.length) {
                rawCharsTyped++;
                const charEl = wordEl.children[j];
                if (charEl.classList.contains('correct')) {
                    totalCorrectChars++;
                } else if (charEl.classList.contains('incorrect')) {
                    totalIncorrectChars++;
                }
            }
        }

        // Account for extra characters on the *current* word if present in textInput
        if (i === currentWordIndex && currentTypedValue.length > wordText.length) {
            totalExtraChars += (currentTypedValue.length - wordText.length);
            rawCharsTyped += (currentTypedValue.length - wordText.length);
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

    // Global keydown listener for Tab key restart
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') { // Only Tab for now, Enter is usually for new line or form submission
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