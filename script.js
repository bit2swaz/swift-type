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
    "responsive", "mobile", "desktop", "application", "software", "hardware", "firmware"
];
const numbers = "0123456789";
const symbols = "!@#$%^&*()_+-=[]{};':\"|,.<>/?`~";

let words = [];
let wordElements = [];
let currentWordIndex = 0;
let currentCharIndex = 0;
let timerId = null;
let timeLeft = 60; // Default time
let typingStarted = false;
let totalCorrectChars = 0;
let totalIncorrectChars = 0; // Includes skipped chars and incorrectly typed
let rawCharsTyped = 0; // Total characters typed (correct, incorrect, extra)
let startTime = 0;

// Get the computed line height from CSS variable for scrolling calculations
// We multiply by fontSize to get actual pixels if line-height is in 'em'
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

    // Hide results, show typing area
    resultsScreen.classList.add('hidden');
    wordsContainer.style.display = 'block';
    textInput.style.display = 'block';
    textInput.disabled = false;
    textInput.value = '';

    generateWords(); // Generate new words based on current settings
    textInput.focus(); // Focus input for immediate typing
    scrollWordsDisplay(true); // Reset scroll to top
}

// --- Word Generation ---

function generateWords() {
    wordsDisplay.innerHTML = '';
    words = [];
    wordElements = [];

    let availableChars = baseWordList;
    if (includeNumbersToggle.checked) {
        availableChars = availableChars.concat(numbers.split('')); // Add each number as a 'word'
    }
    if (includePunctuationToggle.checked) {
        availableChars = availableChars.concat(symbols.split('')); // Add each symbol as a 'word'
    }

    // Ensure we generate enough words (a good buffer)
    for (let i = 0; i < 200; i++) { // Generate more words than typically needed for smooth scrolling
        const randomIndex = Math.floor(Math.random() * baseWordList.length); // Always pick from base words first
        let word = baseWordList[randomIndex];

        // Randomly inject numbers/punctuation into words or as standalone 'words'
        if (includeNumbersToggle.checked && Math.random() < 0.15) { // 15% chance to add a number
            const numIndex = Math.floor(Math.random() * numbers.length);
            word += numbers[numIndex];
        }
        if (includePunctuationToggle.checked && Math.random() < 0.15) { // 15% chance to add a punctuation
            const symIndex = Math.floor(Math.random() * symbols.length);
            word += symbols[symIndex];
        }

        words.push(word);
    }


    words.forEach(word => {
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
    });

    // Highlight the first character of the first word
    if (wordElements.length > 0 && wordElements[0].children.length > 0) {
        wordElements[0].children[0].classList.add('current');
    }
}

// --- Timer Logic ---

function startTimer() {
    startTime = Date.now(); // Record start time
    timerId = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const remainingTime = timeLeft - elapsedTime;
        timerElement.textContent = remainingTime > 0 ? remainingTime : 0;

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
    const grossWPM = (rawCharsTyped / 5) / (finalTimeTaken / 60);
    const netWPM = (totalCorrectChars / 5) / (finalTimeTaken / 60); // Or (correct_words / time_in_minutes)

    let accuracy = 0;
    if (totalCorrectChars + totalIncorrectChars > 0) {
        accuracy = (totalCorrectChars / (totalCorrectChars + totalIncorrectChars)) * 100;
    }

    wpmValue.textContent = netWPM.toFixed(0);
    accuracyValue.textContent = `${accuracy.toFixed(0)}%`;
    rawWpmValue.textContent = grossWPM.toFixed(0); // Display raw WPM or WPM with errors

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
    // Get the top position of the current word relative to its parent (wordsDisplay)
    const wordTopRelativeToDisplay = currentWordElement.offsetTop;

    // Get the current scroll position (translateY) of wordsDisplay
    const currentTransform = getComputedStyle(wordsDisplay).transform;
    let translateY = 0;
    if (currentTransform && currentTransform !== 'none') {
        const matrix = currentTransform.match(/matrix.*\((.+)\)/);
        if (matrix) {
            const matrixValues = matrix[1].split(', ');
            translateY = parseFloat(matrixValues[5]);
        }
    }

    // Calculate the current visible range of the wordsContainer
    const containerHeight = wordsContainer.offsetHeight; // Actual height of the container
    const currentScrollBottom = -translateY + containerHeight; // Bottom of the visible area relative to full wordsDisplay

    // We want the current word's line to be visible and ideally at the top of the container.
    // If the current word's top is off-screen (above the current translateY offset)
    // or if its bottom is below the visible container, adjust.

    // Calculate the line number for the current word (rough estimation)
    let currentWordLine = Math.floor(wordTopRelativeToDisplay / lineHeight);
    let currentVisibleLineOffset = Math.floor(Math.abs(translateY) / lineHeight);

    // If the current word's line is beyond the first visible line (after 0, 1, or 2 lines)
    // We want to scroll up such that the current line is always the first or second visible line.
    const scrollThresholdLines = 1; // When the current word passes the 1st line, scroll
    if (currentWordLine > currentVisibleLineOffset + scrollThresholdLines) {
        wordsDisplay.style.transform = `translateY(${-currentWordLine * lineHeight}px)`;
    } else if (currentWordLine < currentVisibleLineOffset) {
        // This handles backing up to a previous line
        wordsDisplay.style.transform = `translateY(${-currentWordLine * lineHeight}px)`;
    }
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
        let wordCorrectlyTyped = true;

        // Check if the typed value matches the target word exactly
        if (typedValue.length !== targetWord.length) {
            wordCorrectlyTyped = false;
        } else {
            for (let i = 0; i < targetWord.length; i++) {
                if (typedValue[i] !== targetWord[i]) {
                    wordCorrectlyTyped = false;
                    break;
                }
            }
        }

        // Mark any untyped characters as incorrect on spacebar press
        for (let i = typedValue.length; i < targetWord.length; i++) {
            const charEl = currentWordElement.children[i];
            if (charEl) { // Ensure charEl exists
                if (!charEl.classList.contains('correct') && !charEl.classList.contains('incorrect')) {
                    charEl.classList.add('incorrect');
                    totalIncorrectChars++;
                }
            }
        }
        // Mark any extra characters typed beyond the word length as incorrect
        if (typedValue.length > targetWord.length) {
             totalIncorrectChars += (typedValue.length - targetWord.length);
        }

        // Remove 'current' highlight from the character that was current
        if (currentCharIndex > 0 && currentWordElement.children[currentCharIndex - 1]) {
            currentWordElement.children[currentCharIndex - 1].classList.remove('current');
        } else if (currentWordElement.children[0]) { // If at start of word and current on first char
            currentWordElement.children[0].classList.remove('current');
        }

        // Advance to next word
        currentWordIndex++;
        currentCharIndex = 0;
        textInput.value = ''; // Clear input field

        if (currentWordIndex < words.length) {
            // Highlight the first char of the next word
            wordElements[currentWordIndex].children[0].classList.add('current');
            scrollWordsDisplay(); // Scroll if needed
        } else {
            // End of test (all words typed)
            endTest();
        }
    } else if (e.key === 'Backspace') {
        e.preventDefault(); // Prevent default backspace behavior

        const typedText = textInput.value;

        if (currentCharIndex > 0) {
            const charEl = currentWordElement.children[currentCharIndex - 1];
            charEl.classList.remove('current', 'correct', 'incorrect', 'extra');
            currentCharIndex--;
            textInput.value = typedText.substring(0, typedText.length - 1); // Remove last typed char
            charEl.classList.add('current'); // Re-highlight the char we are backing into
            // Note: Accurate WPM/accuracy tracking with backspace needs more complex state management
            // For now, we simplify: just revert class.
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
            for (let i = 0; i < prevWord.length; i++) {
                prevWordElement.children[i].classList.remove('correct', 'incorrect', 'extra');
                prevWordElement.children[i].classList.add('current'); // Mark all as current for re-typing
            }
            // The last character of the previous word should be the 'current' one
            if (prevWordElement.children[prevWord.length - 1]) {
                prevWordElement.children[prevWord.length - 1].classList.add('current');
            }

            textInput.value = prevWord; // Populate input with target word (assuming correct re-typing)
            scrollWordsDisplay(); // Adjust scroll if necessary
        }
    } else if (e.key.length > 1 && e.key !== 'Enter' && e.key !== 'Tab' && e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Meta') {
        e.preventDefault(); // Prevent default for non-character keys
    }
}

function handleInput(e) {
    if (textInput.disabled) return;

    if (e.inputType === 'deleteContentBackward') {
        return; // Backspace is handled in keydown for better control
    }

    const currentWordElement = wordElements[currentWordIndex];
    const targetWord = words[currentWordIndex];
    const typedValue = textInput.value;
    rawCharsTyped++; // Increment raw chars typed for WPM calculation

    // Ensure we don't process if textInput value is out of sync
    if (typedValue.length < currentCharIndex) {
        return;
    }

    // Remove 'current' class from the character that *was* current
    if (currentCharIndex > 0 && currentWordElement.children[currentCharIndex - 1]) {
        currentWordElement.children[currentCharIndex - 1].classList.remove('current');
    }

    // Handle characters typed beyond the current word's length (extra chars)
    if (typedValue.length > targetWord.length) {
        // Mark the last character of the word as incorrect/extra.
        if (targetWord.length > 0 && currentWordElement.children[targetWord.length - 1]) {
            const lastCharOfWord = currentWordElement.children[targetWord.length - 1];
            lastCharOfWord.classList.remove('current', 'correct');
            if (!lastCharOfWord.classList.contains('incorrect')) { // Only add if not already marked
                lastCharOfWord.classList.add('incorrect', 'extra');
            }
        }
        totalIncorrectChars++; // Count it as an error
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
            charEl.classList.remove('current');
            // We wait for spacebar for word transition
        }
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
            initGame(); // Restart game with new time
        });
    });

    includeNumbersToggle.addEventListener('change', initGame);
    includePunctuationToggle.addEventListener('change', initGame);

    restartBtn.addEventListener('click', initGame);

    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('light-theme');
        document.body.classList.toggle('dark-theme');
    });
}

// --- Initial Game Setup ---
setupEventListeners();
initGame(); // Start the first game