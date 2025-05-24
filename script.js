const wordsDisplay = document.getElementById('words-display');
const textInput = document.getElementById('text-input');
const timerElement = document.getElementById('timer');
const wordsContainer = document.getElementById('words-container'); // Get the words-container

const wordList = [
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
    "website", "frontend", "backend", "database", "server", "client", "framework"
];

let words = [];
let currentWordIndex = 0;
let currentCharIndex = 0;
let timerId = null;
let timeLeft = 60;
let typingStarted = false;
let totalCorrectChars = 0;
let totalIncorrectChars = 0;
let wordElements = [];

// Get the computed line height from CSS variable for scrolling calculations
const lineHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--line-height')) * parseFloat(getComputedStyle(document.documentElement).fontSize);

function generateWords() {
    wordsDisplay.innerHTML = '';
    words = [];
    wordElements = [];

    for (let i = 0; i < 50; i++) {
        const randomIndex = Math.floor(Math.random() * wordList.length);
        words.push(wordList[randomIndex]);
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

    if (wordElements.length > 0 && wordElements[0].children.length > 0) {
        wordElements[0].children[0].classList.add('current');
    }
}

function startTimer() {
    timerElement.textContent = `${timeLeft}s`;
    timerId = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timerId);
            endTest();
        }
    }, 1000);
}

function endTest() {
    textInput.disabled = true;
    textInput.value = '';
    typingStarted = false;
    clearInterval(timerId); // Ensure timer is cleared

    // Optionally calculate WPM and accuracy here
    const timeTaken = 60 - timeLeft; // Assuming 60s test
    const grossWPM = (totalCorrectChars / 5) / (timeTaken / 60);
    const accuracy = totalCorrectChars / (totalCorrectChars + totalIncorrectChars) * 100;

    console.log("Test finished!");
    console.log(`Gross WPM: ${grossWPM.toFixed(2)}`);
    console.log(`Accuracy: ${accuracy.toFixed(2)}%`);

    // Reset for a new test or display results
    // We'll add a restart button later
}

function scrollWordsDisplay() {
    if (currentWordIndex >= wordElements.length) return;

    const currentWordElement = wordElements[currentWordIndex];
    const wordsDisplayRect = wordsDisplay.getBoundingClientRect();
    const currentWordRect = currentWordElement.getBoundingClientRect();
    const wordsContainerRect = wordsContainer.getBoundingClientRect();

    // Calculate how many lines are currently above the viewport of words-container
    // This is a simplified approach assuming a relatively uniform line height.
    // We want the current word to be visible, ideally starting a new line if it would go off screen.

    // If the top of the current word is above the top of the words-container's visible area,
    // or if the current word's bottom is below the words-container's bottom.
    // The goal is to keep the current word roughly at the top of the visible lines.

    // Calculate the current scroll position (transformY)
    const currentTransform = getComputedStyle(wordsDisplay).transform;
    let translateY = 0;
    if (currentTransform && currentTransform !== 'none') {
        const matrix = currentTransform.match(/matrix.*\((.+)\)/);
        if (matrix) {
            const matrixValues = matrix[1].split(', ');
            translateY = parseFloat(matrixValues[5]);
        }
    }

    // Determine the vertical position of the current word relative to wordsDisplay's top
    const wordTopRelativeToDisplay = currentWordRect.top - wordsDisplayRect.top;

    // The threshold for scrolling: when the word's top is nearing the bottom of the container
    // We scroll up by one line height if the word goes off screen (or very close to it)
    if (currentWordRect.bottom > (wordsContainerRect.top + wordsContainerRect.height) - lineHeight * 0.5) {
        translateY -= lineHeight;
    } else if (currentWordRect.top < wordsContainerRect.top && translateY < 0) {
        // This condition is for scrolling back up if we typed back into a previous line.
        // It prevents words from disappearing off the top.
        // More robust handling would check if the previous word is *completely* off screen.
        // For now, if we are typing back to a word that is off screen, scroll back down.
        // This part might need further refinement based on user experience.
        const prevWordElement = currentWordIndex > 0 ? wordElements[currentWordIndex - 1] : null;
        if (prevWordElement) {
             const prevWordRect = prevWordElement.getBoundingClientRect();
             if (prevWordRect.top < wordsContainerRect.top) {
                 translateY += lineHeight;
             }
        }
    }

    wordsDisplay.style.transform = `translateY(${translateY}px)`;
}


// Event listener for keyboard input
textInput.addEventListener('keydown', (e) => {
    if (!typingStarted && e.key.length === 1 && e.key !== ' ') { // Start timer only on valid character input, not space
        typingStarted = true;
        startTimer();
    }

    const currentWordElement = wordElements[currentWordIndex];
    const targetWord = words[currentWordIndex];

    // Handle Spacebar
    if (e.key === ' ') {
        e.preventDefault(); // Prevent default space behavior (e.g., scrolling)

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
            if (!charEl.classList.contains('correct') && !charEl.classList.contains('incorrect')) {
                charEl.classList.add('incorrect');
                totalIncorrectChars++;
            }
        }
        // Mark any extra characters typed beyond the word length as incorrect
        for (let i = targetWord.length; i < typedValue.length; i++) {
            // We don't have explicit char spans for extra characters in the DOM yet,
            // so we just count them as errors.
            totalIncorrectChars++;
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
    }
    // Handle Backspace
    else if (e.key === 'Backspace') {
        e.preventDefault(); // Prevent default backspace behavior

        const typedText = textInput.value;

        if (currentCharIndex > 0) {
            const charEl = currentWordElement.children[currentCharIndex - 1];
            charEl.classList.remove('current', 'correct', 'incorrect', 'extra');
            // We don't add 'current' back directly to charEl as it's handled by input logic
            currentCharIndex--;
            textInput.value = typedText.substring(0, typedText.length - 1); // Remove last typed char
            // If the char was correct, decrement correct count, if incorrect, decrement incorrect count.
            // This is complex. For simplicity, we just reset its state. Accurate WPM/accuracy needs more tracking.
            if (charEl.classList.contains('correct')) totalCorrectChars--; // This isn't perfectly accurate, we'd need to track original status
            else if (charEl.classList.contains('incorrect')) totalIncorrectChars--; // Same here
            
            charEl.classList.add('current'); // Re-highlight the char we are backing into
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
    }
    // Handle any other key that is not a single character (e.g., Alt, Ctrl, Shift, Arrows)
    else if (e.key.length > 1 && e.key !== 'Enter' && e.key !== 'Tab' && e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Meta') {
        // Do nothing for meta keys, arrows, etc.
        e.preventDefault();
    }
});

// Use 'input' event for character comparison
textInput.addEventListener('input', (e) => {
    // Only process input if it's not backspace and test has started/is starting
    if (e.inputType === 'deleteContentBackward') {
        return; // Backspace is handled in keydown
    }

    if (!typingStarted && e.data && e.data.length === 1) { // Start timer only on valid character input
        typingStarted = true;
        startTimer();
    }

    const currentWordElement = wordElements[currentWordIndex];
    const targetWord = words[currentWordIndex];
    const typedValue = textInput.value;

    // Ensure we don't process if textInput value is out of sync or if backspace happened
    if (typedValue.length < currentCharIndex) {
        // This can happen if user holds backspace, we already handled it in keydown,
        // but this acts as a safeguard.
        return;
    }

    // Remove 'current' class from the character that *was* current
    if (currentCharIndex > 0 && currentWordElement.children[currentCharIndex - 1]) {
        currentWordElement.children[currentCharIndex - 1].classList.remove('current');
    }

    // Handle characters typed beyond the current word's length (extra chars)
    if (typedValue.length > targetWord.length) {
        // We'll mark the last character of the word as incorrect if an extra character is typed.
        // Or, we could add 'extra' class to a dynamically created char for the UI.
        // For now, simpler: just count as incorrect and highlight the last actual char of the word as incorrect.
        if (targetWord.length > 0 && currentWordElement.children[targetWord.length - 1]) {
            const lastCharOfWord = currentWordElement.children[targetWord.length - 1];
            lastCharOfWord.classList.remove('current', 'correct');
            lastCharOfWord.classList.add('incorrect', 'extra'); // Mark the last actual char as incorrect/extra
        }
        totalIncorrectChars++;
        return; // Don't process further for valid character comparison
    }

    // Process regular character input
    if (currentCharIndex < targetWord.length) {
        const charEl = currentWordElement.children[currentCharIndex];
        const targetChar = targetWord[currentCharIndex];
        const typedChar = typedValue[typedValue.length - 1]; // Get the last typed char

        // Ensure typedChar exists (e.g. not null from certain mobile keyboard behaviors)
        if (!typedChar) return;

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
            currentWordElement.children[currentCharIndex].classList.add('current');
        } else {
            // If at the end of the word, remove 'current' from the last char.
            // It will be re-added to the first char of the next word on space.
            charEl.classList.remove('current');
        }
    }
});


// Initial setup
generateWords();
textInput.focus(); // Focus on the input field when the page loads