const wordsDisplay = document.getElementById('words-display');
const textInput = document.getElementById('text-input');
const timerElement = document.getElementById('timer');
const wordsContainer = document.getElementById('words-container');
const timeButtons = document.querySelectorAll('.time-btn');
const includeNumbersToggle = document.getElementById('include-numbers');
const includePunctuationToggle = document.getElementById('include-punctuation');
const resultsScreen = document.getElementById('results-screen');
const wpmValue = document.getElementById('wpm-value');
const accuracyValue = document.getElementById('accuracy-value');
const rawWpmValue = document.getElementById('raw-wpm-value');
const restartBtn = document.getElementById('restart-btn');
const themeToggle = document.getElementById('theme-toggle');
const liveWpmElement = document.getElementById('live-wpm');
const liveAccuracyElement = document.getElementById('live-accuracy');

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
const symbols = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"; // More comprehensive symbols

let words = []; // Stores the actual words for the test
let wordElements = []; // Stores references to the DOM word spans
let currentWordIndex = 0;
let currentCharIndex = 0;
let timerId = null;
let timeLeft = 60; // Current test duration
let typingStarted = false;
let totalCorrectChars = 0;
let totalIncorrectChars = 0; // Includes incorrectly typed, skipped, and extra chars
let rawCharsTyped = 0; // Total characters typed (correct, incorrect, extra)
let startTime = 0;
let generatedWordCount = 0; // To track how many words are generated for dynamic loading

// Get the computed line height from CSS variable for scrolling calculations
const lineHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--line-height')) * parseFloat(getComputedStyle(document.documentElement).fontSize);

// --- Game Initialization & Reset ---

function initGame() {
    // Reset state
    currentWordIndex = 0;
    currentCharIndex = 0;
    typingStarted = false;
    totalCorrectChars = 0;
    totalIncorrectChars = 0;
    rawCharsTyped = 0;
    clearInterval(timerId); // Clear any running timer
    timerElement.textContent = timeLeft; // Reset timer display
    liveWpmElement.textContent = 'WPM: 0';
    liveAccuracyElement.textContent = 'Acc: 0%';

    // Hide results, show typing area
    resultsScreen.classList.add('hidden');
    wordsContainer.style.display = 'block';
    textInput.style.display = 'block';
    textInput.disabled = false;
    textInput.value = '';

    generatedWordCount = 0; // Reset generated word count
    generateWords(true); // Generate new words based on current settings (true for initial clear)
    textInput.focus(); // Focus input for immediate typing
    scrollWordsDisplay(true); // Reset scroll to top
}

// --- Word Generation ---

function getRandomWord(isNumbers, isPunctuation) {
    const r = Math.random();
    if (isNumbers && r < 0.1) { // 10% chance for a number
        return numbers[Math.floor(Math.random() * numbers.length)];
    }
    if (isPunctuation && r < 0.2) { // 20% chance for a symbol (if not a number)
        return symbols[Math.floor(Math.random() * symbols.length)];
    }
    return baseWordList[Math.floor(Math.random() * baseWordList.length)];
}

function generateWords(clearExisting = false) {
    if (clearExisting) {
        wordsDisplay.innerHTML = '';
        words = [];
        wordElements = [];
    }

    const wordsToGenerate = 50; // Generate 50 words at a time for initial load and dynamic loading
    const isNumbers = includeNumbersToggle.checked;
    const isPunctuation = includePunctuationToggle.checked;

    for (let i = 0; i < wordsToGenerate; i++) {
        const word = getRandomWord(isNumbers, isPunctuation);
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

    // Highlight the first character of the current word
    if (wordElements[currentWordIndex] && wordElements[currentWordIndex].children[currentCharIndex]) {
        wordElements[currentWordIndex].children[currentCharIndex].classList.add('current');
    }
}

// --- Live Stats Update ---
function updateLiveStats() {
    if (!typingStarted || totalCorrectChars + totalIncorrectChars === 0) {
        liveWpmElement.textContent = 'WPM: 0';
        liveAccuracyElement.textContent = 'Acc: 0%';
        return;
    }

    const timeElapsed = (Date.now() - startTime) / 1000; // in seconds
    if (timeElapsed === 0) return;

    const currentWPM = (totalCorrectChars / 5) / (timeElapsed / 60);
    const currentAccuracy = (totalCorrectChars / rawCharsTyped) * 100;

    liveWpmElement.textContent = `WPM: ${Math.max(0, currentWPM).toFixed(0)}`;
    liveAccuracyElement.textContent = `Acc: ${Math.max(0, currentAccuracy).toFixed(0)}%`;
}

// --- Timer Logic ---

function startTimer() {
    startTime = Date.now(); // Record start time
    timerId = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const remainingTime = timeLeft - elapsedTime;
        timerElement.textContent = remainingTime > 0 ? remainingTime : 0;

        updateLiveStats(); // Update live WPM and Accuracy

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
    clearInterval(timerId); // Ensure timer is cleared

    // Hide typing area elements
    wordsContainer.style.display = 'none';
    textInput.style.display = 'none';

    // Calculate results
    const finalTimeTaken = timeLeft; // Total configured time
    const grossWPM = (rawCharsTyped / 5) / (finalTimeTaken / 60); // WPM including errors
    const netWPM = (totalCorrectChars / 5) / (finalTimeTaken / 60); // WPM excluding errors (more common)

    let accuracy = 0;
    if (rawCharsTyped > 0) { // Calculate accuracy based on all chars typed
        accuracy = (totalCorrectChars / rawCharsTyped) * 100;
    }

    wpmValue.textContent = Math.max(0, netWPM).toFixed(0);
    accuracyValue.textContent = `${Math.max(0, accuracy).toFixed(0)}%`;
    rawWpmValue.textContent = Math.max(0, grossWPM).toFixed(0);

    resultsScreen.classList.remove('hidden'); // Show results screen
}

// --- Scrolling Logic ---

function scrollWordsDisplay(reset = false) {
    if (reset) {
        wordsDisplay.style.transform = `translateY(0px)`;
        return;
    }

    if (currentWordIndex >= wordElements.length) return;

    const currentWordElement = wordElements[currentWordIndex];
    // Calculate the top position of the current word relative to its parent (wordsDisplay)
    const wordTopRelativeToDisplay = currentWordElement.offsetTop;

    // We want the current line to be at the second line from the top of the container.
    // This allows for some buffer.
    const targetScrollPosition = lineHeight * 1; // 1 line from top

    // Calculate how much wordsDisplay needs to move up
    // `wordsDisplay.offsetTop` would be 0 or current transform Y
    const requiredTranslateY = -(wordTopRelativeToDisplay - targetScrollPosition);

    // Apply the transform
    wordsDisplay.style.transform = `translateY(${requiredTranslateY}px)`;
}


// --- Event Handlers ---

function handleKeyDown(e) {
    if (textInput.disabled) return;

    // Start timer on first valid keypress
    if (!typingStarted && e.key.length === 1 && e.key !== ' ') {
        typingStarted = true;
        startTimer();
    }

    const currentWordElement = wordElements[currentWordIndex];
    const targetWord = words[currentWordIndex];

    if (e.key === ' ') {
        e.preventDefault(); // Prevent default space behavior

        const typedValue = textInput.value;
        // Check for correct completion
        let wordCorrectlyCompleted = (typedValue === targetWord);

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
             totalIncorrectChars += (typedValue.length - targetWord.length);
        }

        // Apply 'typed' class to the completed word for visual fading
        currentWordElement.classList.add('typed');

        // Remove 'current' highlight from the character that was current
        if (currentWordElement.children[currentCharIndex]) {
            currentWordElement.children[currentCharIndex].classList.remove('current');
        } else if (currentCharIndex > 0 && currentWordElement.children[currentCharIndex - 1]) { // If at end of word
            currentWordElement.children[currentCharIndex - 1].classList.remove('current');
        }


        // Advance to next word
        currentWordIndex++;
        currentCharIndex = 0;
        textInput.value = ''; // Clear input field

        // Dynamic word loading: If we're nearing the end of generated words
        if (currentWordIndex >= generatedWordCount - 20) { // If 20 words left
            generateWords(); // Generate more words
        }

        if (currentWordIndex < wordElements.length) {
            // Highlight the first char of the next word
            wordElements[currentWordIndex].children[0].classList.add('current');
            scrollWordsDisplay(); // Scroll if needed
        } else {
            // End of test (all words typed - though with dynamic generation, this is less likely to happen before timer)
            endTest();
        }
    } else if (e.key === 'Backspace') {
        e.preventDefault(); // Prevent default backspace behavior

        const typedText = textInput.value;

        if (currentCharIndex > 0) {
            const charEl = currentWordElement.children[currentCharIndex - 1];
            charEl.classList.remove('current', 'correct', 'incorrect', 'extra'); // Clean its state
            
            // Decrement counts only if it was genuinely correct/incorrect
            // This is a simplification; perfect accuracy tracking needs more state.
            // For now, assume backspacing on a char means it's no longer counted as typed.
            // rawCharsTyped--; // Careful with this, might lead to negative if not perfectly synced.
            // totalCorrectChars--; // Same
            // totalIncorrectChars--; // Same

            currentCharIndex--;
            textInput.value = typedText.substring(0, typedText.length - 1); // Remove last typed char
            charEl.classList.add('current'); // Re-highlight the char we are backing into
            currentWordElement.classList.remove('typed'); // Untype the word if we backspace into it
        } else if (currentWordIndex > 0) { // If at the beginning of a word, go back to previous word
            // Clear current highlight from the first char of the current word
            if (currentWordElement.children[0]) {
                currentWordElement.children[0].classList.remove('current');
            }
            
            currentWordIndex--;
            const prevWordElement = wordElements[currentWordIndex];
            const prevWord = words[currentWordIndex];
            currentCharIndex = prevWord.length; // Go to end of previous word

            // Reset highlighting for the previous word to re-type
            prevWordElement.classList.remove('typed'); // Make previous word untyped again
            for (let i = 0; i < prevWord.length; i++) {
                prevWordElement.children[i].classList.remove('correct', 'incorrect', 'extra');
                // We're about to type this word again, so all its chars should be ready
                prevWordElement.children[i].classList.add('current');
            }
            // The last character of the previous word should be the 'current' one
            if (prevWordElement.children[prevWord.length - 1]) {
                prevWordElement.children[prevWord.length - 1].classList.add('current');
            }
            
            textInput.value = prevWord; // Populate input with target word (assuming correct re-typing)
            scrollWordsDisplay(); // Adjust scroll if necessary
        }
        updateLiveStats(); // Update stats after backspace
    } else if (e.key.length > 1 && e.key !== 'Enter' && e.key !== 'Tab' && e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Meta') {
        e.preventDefault(); // Prevent default for non-character keys
    }
}

function handleInput(e) {
    if (textInput.disabled) return;

    if (e.inputType === 'deleteContentBackward') {
        return; // Backspace is handled in keydown for precise control
    }

    const currentWordElement = wordElements[currentWordIndex];
    const targetWord = words[currentWordIndex];
    const typedValue = textInput.value;
    rawCharsTyped++; // Increment raw chars typed for WPM calculation

    // Ensure we don't process if textInput value is out of sync or if backspace happened
    if (typedValue.length < currentCharIndex) {
        return;
    }

    // Remove 'current' class from the character that *was* current (if any)
    if (currentWordElement.children[currentCharIndex] && currentCharIndex > 0) { // If the current was on the char about to be typed
        currentWordElement.children[currentCharIndex].classList.remove('current');
    } else if (currentCharIndex > 0 && currentWordElement.children[currentCharIndex - 1]) { // If it was on the prev char
        currentWordElement.children[currentCharIndex - 1].classList.remove('current');
    }


    // Handle characters typed beyond the current word's length (extra chars)
    if (typedValue.length > targetWord.length) {
        // Mark the last character of the word as incorrect/extra.
        // We only add the 'incorrect' and 'extra' class if it wasn't already marked.
        if (targetWord.length > 0 && currentWordElement.children[targetWord.length - 1]) {
            const lastCharOfWord = currentWordElement.children[targetWord.length - 1];
            if (!lastCharOfWord.classList.contains('incorrect')) { // Prevent multiple error counts for same char
                lastCharOfWord.classList.add('incorrect', 'extra');
            }
        }
        totalIncorrectChars++; // Count it as an error
        updateLiveStats();
        return; // Don't process further for valid character comparison
    }

    // Process regular character input
    if (currentCharIndex < targetWord.length) {
        const charEl = currentWordElement.children[currentCharIndex];
        const targetChar = targetWord[currentCharIndex];
        const typedChar = typedValue[typedValue.length - 1]; // Get the last typed char

        if (!typedChar) return; // Should not happen with typical typing, but safety

        if (typedChar === targetChar) {
            charEl.classList.remove('current', 'incorrect', 'extra');
            charEl.classList.add('correct');
            totalCorrectChars++;
        } else {
            charEl.classList.remove('current', 'correct', 'extra');
            charEl.classList.add('incorrect');
            totalIncorrectChars++;
        }
        currentCharIndex++;

        // Highlight the next character or indicate end of word
        if (currentCharIndex < targetWord.length) {
            charEl.classList.remove('current'); // Ensure current is only on the *next* char
            currentWordElement.children[currentCharIndex].classList.add('current');
        } else {
            // If at the end of the word, remove 'current' from the last char.
            // It will be re-added to the first char of the next word on space.
            charEl.classList.remove('current');
        }
    }
    updateLiveStats(); // Update stats after every character input
}

// --- Settings Persistence ---
function saveSettings() {
    localStorage.setItem('selectedTime', timeLeft);
    localStorage.setItem('includeNumbers', includeNumbersToggle.checked);
    localStorage.setItem('includePunctuation', includePunctuationToggle.checked);
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
        includeNumbersToggle.checked = (savedNumbers === 'true');
    }

    const savedPunctuation = localStorage.getItem('includePunctuation');
    if (savedPunctuation !== null) {
        includePunctuationToggle.checked = (savedPunctuation === 'true');
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
            saveSettings(); // Save new time setting
            initGame(); // Restart game with new time
        });
    });

    includeNumbersToggle.addEventListener('change', () => {
        saveSettings(); // Save new setting
        initGame(); // Restart game with new word types
    });
    includePunctuationToggle.addEventListener('change', () => {
        saveSettings(); // Save new setting
        initGame(); // Restart game with new word types
    });

    restartBtn.addEventListener('click', initGame);

    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('light-theme');
        document.body.classList.toggle('dark-theme');
        saveSettings(); // Save new theme setting
    });
}

// --- Initial Game Setup ---
loadSettings(); // Load settings first
setupEventListeners();
initGame(); // Start the first game