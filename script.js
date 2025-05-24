const wordsDisplay = document.getElementById('words-display');
const textInput = document.getElementById('text-input');

// A simple array of words for demonstration
const wordList = [
    "the", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog",
    "apple", "banana", "orange", "grape", "kiwi", "melon", "peach", "plum",
    "keyboard", "mouse", "monitor", "speaker", "headphone", "microphone",
    "program", "code", "develop", "debug", "compile", "execute", "function",
    "variable", "array", "object", "string", "number", "boolean", "null",
    "undefined", "loop", "condition", "statement", "element", "attribute"
];

let words = [];
let currentWordIndex = 0;
let currentCharIndex = 0;
let timerId = null;
let timeLeft = 60; // Initial time in seconds
let typingStarted = false;

// Function to generate and display words
function generateWords() {
    wordsDisplay.innerHTML = ''; // Clear previous words
    words = [];
    // Generate 50 random words for a decent initial display
    for (let i = 0; i < 50; i++) {
        const randomIndex = Math.floor(Math.random() * wordList.length);
        words.push(wordList[randomIndex]);
    }

    words.forEach((word, wordIndex) => {
        const wordSpan = document.createElement('span');
        wordSpan.classList.add('word');
        word.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.classList.add('char');
            charSpan.textContent = char;
            wordSpan.appendChild(charSpan);
        });
        wordsDisplay.appendChild(wordSpan);
    });

    // Highlight the first character of the first word
    if (wordsDisplay.children.length > 0) {
        wordsDisplay.children[0].children[0].classList.add('current');
    }
}

// Function to start the timer
function startTimer() {
    timerId = setInterval(() => {
        timeLeft--;
        // Update a timer display element if we had one (we'll add this later)
        console.log("Time left: " + timeLeft); // For debugging
        if (timeLeft <= 0) {
            clearInterval(timerId);
            // Handle end of test (e.g., calculate WPM, disable input)
            textInput.disabled = true;
            console.log("Time's up!");
        }
    }, 1000);
}

// Event listener for keyboard input
textInput.addEventListener('keydown', (e) => {
    // Prevent default behavior for spacebar if it's the last character of a word
    if (e.key === ' ' && currentCharIndex === words[currentWordIndex].length) {
        e.preventDefault();
    }
});

textInput.addEventListener('input', (e) => {
    if (!typingStarted) {
        typingStarted = true;
        startTimer(); // Start timer on first input
    }

    const typedChar = e.data; // The character just typed
    const currentWordElement = wordsDisplay.children[currentWordIndex];
    const currentCharElement = currentWordElement.children[currentCharIndex];
    const targetChar = words[currentWordIndex][currentCharIndex];

    if (typedChar === ' ') { // Spacebar pressed
        if (currentCharIndex === words[currentWordIndex].length) { // Correct space after a complete word
            // Mark current word as correct (or correct based on its typed chars)
            // For now, just move to the next word
            currentWordElement.classList.remove('current'); // Remove current highlighting from word
            currentCharElement.classList.remove('current'); // Remove current char highlighting

            currentWordIndex++;
            currentCharIndex = 0;

            // Highlight the first char of the next word
            if (currentWordIndex < words.length) {
                wordsDisplay.children[currentWordIndex].children[0].classList.add('current');
            } else {
                // End of test (all words typed)
                clearInterval(timerId);
                textInput.disabled = true;
                console.log("Test finished!");
            }
            textInput.value = ''; // Clear input field
        } else {
            // Incorrect space: user typed space before finishing the word
            // We can add error handling for this, e.g., mark remaining chars as incorrect
            // For now, just prevent moving to next word and let it be an error
            // (The char will be marked incorrect if it doesn't match 'targetChar' below)
        }
    } else if (typedChar === null) { // Backspace (e.data is null for backspace)
        // Handle backspace. This is a bit tricky with `input` event and needs `keyup` or `keydown`.
        // For simplicity, let's just make it remove the current char highlight
        // and go back one position. We'll refine this later for proper error correction.
        if (currentCharIndex > 0) {
            currentCharElement.classList.remove('current', 'correct', 'incorrect');
            currentCharIndex--;
            currentWordElement.children[currentCharIndex].classList.add('current');
        } else if (currentWordIndex > 0) { // If at the beginning of a word, go back to previous word
            currentWordElement.children[currentCharIndex].classList.remove('current');
            currentWordIndex--;
            const prevWordElement = wordsDisplay.children[currentWordIndex];
            currentCharIndex = words[currentWordIndex].length - 1; // Go to last char of prev word
            prevWordElement.children[currentCharIndex].classList.add('current');
            textInput.value = words[currentWordIndex].substring(0, currentCharIndex); // Populate input with correct chars
        }
    }
    else { // Regular character typed
        if (currentCharIndex < words[currentWordIndex].length) {
            if (typedChar === targetChar) {
                currentCharElement.classList.remove('current');
                currentCharElement.classList.add('correct');
            } else {
                currentCharElement.classList.remove('current');
                currentCharElement.classList.add('incorrect');
            }
            currentCharIndex++;
            // Highlight the next character or indicate end of word
            if (currentCharIndex < words[currentWordIndex].length) {
                currentWordElement.children[currentCharIndex].classList.add('current');
            } else {
                // Word is completed, waiting for spacebar
                // The `current` class will be removed when space is pressed
                // We'll add a visual cue here for 'awaiting space' later
            }
        }
    }
});

// Initial setup
generateWords();
textInput.focus(); // Focus on the input field when the page loads