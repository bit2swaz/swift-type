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


// --- Game State Variables ---
let words = [];
let currentWordIndex = 0;
let currentCharIndex = 0;
let startTime;
let timerInterval;
let totalCharactersTyped = 0;
let correctCharactersTyped = 0;
let testStarted = false;
let testFinished = false; // New flag to prevent input after test ends

// Test settings
let currentTestMode = 'time'; // 'time' or 'words'
let currentTestDuration = 30; // default to 30 seconds
let currentWordCount = 50; // default to 50 words
let includeNumbers = false;
let includePunctuation = false;

// --- Word List (significantly expanded) ---
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
    "had", "say", "great", "where", "help", "through", "much", "before", "right", "too",
    "those", "very", "did", "my", "through", "under", "next", "another", "find", "big",
    "small", "word", "sentence", "paragraph", "type", "keyboard", "display", "speed", "accuracy",
    "challenge", "program", "code", "developer", "javascript", "html", "css", "website", "application", "data",
    "number", "punctuation", "mode", "option", "select", "time", "words", "fast", "random", "test",
    "results", "metrics", "error", "correct", "incorrect", "character", "current", "value", "button", "input",
    "change", "focus", "event", "listener", "function", "variable", "const", "let", "array", "object",
    "element", "document", "create", "append", "remove", "class", "style", "transition", "transform", "opacity",
    "margin", "padding", "border", "radius", "shadow", "display", "flex", "grid", "position", "relative",
    "absolute", "fixed", "z-index", "overflow", "scroll", "height", "width", "min-height", "max-width", "font-size",
    "line-height", "text-align", "justify", "align", "center", "start", "end", "space", "between", "around",
    "column", "row", "wrap", "reverse", "pointer", "default", "initial", "inherit", "important", "auto",
    "none", "hidden", "visible", "inline", "block", "inline-block", "table", "cell", "caption", "header",
    "footer", "section", "article", "aside", "nav", "main", "figure", "figcaption", "details", "summary",
    "dialog", "form", "label", "fieldset", "legend", "textarea", "select", "option", "datalist", "output",
    "progress", "meter", "iframe", "embed", "object", "param", "source", "track", "video", "audio",
    "canvas", "map", "area", "svg", "path", "circle", "rect", "line", "polyline", "polygon",
    "ellipse", "text", "image", "picture", "figcaption", "figure", "link", "meta", "style", "script",
    "noscript", "template", "slot", "abbr", "address", "bdo", "blockquote", "cite", "q", "code",
    "del", "ins", "dfn", "em", "strong", "kbd", "mark", "samp", "small", "sub",
    "sup", "time", "var", "data", "meter", "progress", "ruby", "rt", "rp", "s",
    "u", "wbr", "area", "map", "param", "source", "track", "embed", "object", "datalist",
    "details", "summary", "dialog", "menu", "menuitem", "command", "button", "input", "select", "textarea",
    "form", "fieldset", "legend", "label", "output", "meter", "progress", "iframe", "canvas", "audio",
    "video", "source", "track", "embed", "object", "param", "picture", "map", "area", "link",
    "meta", "style", "script", "noscript", "template", "slot", "abbr", "address", "bdo", "blockquote",
    "cite", "q", "code", "del", "ins", "dfn", "em", "strong", "kbd", "mark",
    "samp", "small", "sub", "sup", "time", "var", "data", "meter", "progress", "ruby",
    "rt", "rp", "s", "u", "wbr", "article", "aside", "details", "figcaption", "figure",
    "footer", "header", "main", "mark", "nav", "section", "summary", "time", "audio", "video",
    "embed", "iframe", "object", "param", "picture", "source", "track", "map", "area", "canvas",
    "svg", "math", "html", "body", "head", "title", "base", "link", "meta", "style",
    "script", "noscript", "template", "slot", "doctype", "comment", "entity", "attribute", "element", "tag",
    "class", "id", "selector", "property", "value", "unit", "color", "background", "font", "text",
    "box", "model", "flexbox", "grid", "layout", "responsive", "media", "query", "pseudo", "element",
    "pseudo", "class", "combinator", "specificity", "inheritance", "cascade", "reset", "normalize", "vendor", "prefix",
    "animation", "transition", "transform", "filter", "gradient", "shadow", "border", "radius", "outline", "box-sizing",
    "content", "padding", "margin", "position", "top", "right", "bottom", "left", "width", "height",
    "min-width", "max-width", "min-height", "max-height", "overflow", "visible", "hidden", "scroll", "auto", "clip",
    "display", "block", "inline", "inline-block", "list-item", "flex", "grid", "table", "table-row", "table-cell",
    "table-column", "table-caption", "table-header-group", "table-footer-group", "table-column-group", "table-row-group", "none", "initial", "inherit", "unset",
    "font-family", "font-size", "font-weight", "font-style", "line-height", "text-align", "text-decoration", "text-transform", "letter-spacing", "word-spacing",
    "white-space", "color", "background-color", "background-image", "background-repeat", "background-position", "background-size", "border-color", "border-style", "border-width",
    "border-top", "border-right", "border-bottom", "border-left", "border-radius", "box-shadow", "text-shadow", "outline", "outline-offset", "cursor",
    "pointer", "default", "auto", "grab", "grabbing", "move", "text", "help", "wait", "not-allowed",
    "zoom-in", "zoom-out", "col-resize", "row-resize", "n-resize", "s-resize", "e-resize", "w-resize", "ne-resize", "nw-resize",
    "se-resize", "sw-resize", "alias", "copy", "cell", "crosshair", "progress", "url", "attr", "calc",
    "var", "min", "max", "clamp", "rgb", "rgba", "hsl", "hsla", "hex", "gradient",
    "linear", "radial", "conic", "repeat", "no-repeat", "round", "space", "cover", "contain", "fill",
    "clip-path", "mask", "filter", "backdrop-filter", "transform", "translate", "rotate", "scale", "skew", "matrix",
    "perspective", "origin", "transition-property", "transition-duration", "transition-timing-function", "transition-delay", "animation-name", "animation-duration", "animation-timing-function", "animation-delay",
    "animation-iteration-count", "animation-direction", "animation-fill-mode", "animation-play-state", "flex-direction", "flex-wrap", "justify-content", "align-items", "align-content", "gap",
    "row-gap", "column-gap", "order", "flex-grow", "flex-shrink", "flex-basis", "grid-template-columns", "grid-template-rows", "grid-template-areas", "grid-column-start",
    "grid-column-end", "grid-row-start", "grid-row-end", "grid-area", "place-items", "place-content", "place-self", "overflow-x", "overflow-y", "scrollbar-width",
    "scrollbar-color", "user-select", "appearance", "outline", "resize", "pointer-events", "touch-action", "will-change", "transform-style", "backface-visibility"
];

const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const punctuations = [",", ".", ";", ":", "'", '"', "(", ")", "[", "]", "{", "}", "-", "_", "=", "+", "/", "?", "!", "@", "#", "$", "%", "^", "&", "*", "`", "~", "<", ">", "|", "\\"];

// --- Functions ---

function generateWords() {
    words = [];
    // Shuffle the commonWords array and pick a subset
    const shuffledWords = commonWords.sort(() => 0.5 - Math.random());
    // Pick around 50-70 words for a standard test
    const numWords = Math.floor(Math.random() * (70 - 50 + 1)) + 50;
    words = shuffledWords.slice(0, numWords);
}

function renderWords() {
    wordsDisplay.innerHTML = ''; // Clear previous words
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
            spaceSpan.classList.add('character'); // Space is also a character for tracking
            spaceSpan.textContent = ' ';
            wordSpan.appendChild(spaceSpan); // Append space inside the wordSpan for proper highlighting
        }
    });

    // Highlight the first character of the first word
    highlightCurrentCharacter();
}

function highlightCurrentCharacter() {
    const allCharacters = wordsDisplay.querySelectorAll('.character');
    // Remove 'current' from previously highlighted character
    const previouslyCurrent = wordsDisplay.querySelector('.character.current');
    if (previouslyCurrent) {
        previouslyCurrent.classList.remove('current');
    }

    // Determine the character to highlight
    let charToHighlight = null;
    let charCount = 0;

    for (let i = 0; i < currentWordIndex; i++) {
        charCount += words[i].length + 1; // +1 for the space after each word
    }
    charCount += currentCharIndex;

    if (charCount < allCharacters.length) {
        charToHighlight = allCharacters[charCount];
    }

    if (charToHighlight) {
        charToHighlight.classList.add('current');
        // Scroll the view to keep the current word visible
        scrollWordsDisplay();
    }
}

function scrollWordsDisplay() {
    const currentWordElement = wordsDisplay.querySelectorAll('.word')[currentWordIndex];
    if (currentWordElement) {
        const wordsDisplayRect = wordsDisplay.getBoundingClientRect();
        const currentWordRect = currentWordElement.getBoundingClientRect();

        // If the current word is below the visible area
        if (currentWordRect.bottom > wordsDisplayRect.bottom) {
            wordsDisplay.scrollTop += currentWordRect.bottom - wordsDisplayRect.bottom + 20; // +20 for some padding
        }
        // If the current word is above the visible area (less likely in typing tests)
        else if (currentWordRect.top < wordsDisplayRect.top) {
            wordsDisplay.scrollTop -= wordsDisplayRect.top - currentWordRect.top + 20;
        }
    }
}

function startTimer() {
    startTime = new Date().getTime();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const currentTime = new Date().getTime();
    const elapsedTime = Math.floor((currentTime - startTime) / 1000);
    timerDisplay.textContent = `Time: ${elapsedTime}s`;
    calculateMetrics(); // Update WPM and accuracy continuously
}

function stopTimer() {
    clearInterval(timerInterval);
}

function calculateMetrics() {
    const currentTime = new Date().getTime();
    const elapsedTimeInMinutes = (currentTime - startTime) / 1000 / 60; // in minutes

    // WPM calculation: (correct characters / 5) / time in minutes
    // A "word" is typically considered 5 characters (including spaces)
    const wpm = elapsedTimeInMinutes > 0 ? Math.round((correctCharactersTyped / 5) / elapsedTimeInMinutes) : 0;
    wpmDisplay.textContent = `WPM: ${wpm}`;

    // Accuracy calculation
    const accuracy = totalCharactersTyped > 0 ? Math.round((correctCharactersTyped / totalCharactersTyped) * 100) : 0;
    accuracyDisplay.textContent = `Accuracy: ${accuracy}%`;
}

function resetGame() {
    stopTimer();
    currentWordIndex = 0;
    currentCharIndex = 0;
    totalCharactersTyped = 0;
    correctCharactersTyped = 0;
    testStarted = false;

    timerDisplay.textContent = 'Time: 0s';
    wpmDisplay.textContent = 'WPM: 0';
    accuracyDisplay.textContent = 'Accuracy: 0%';
    textInput.value = '';
    textInput.disabled = false; // Enable input
    textInput.focus(); // Focus the input again

    generateWords();
    renderWords();
}

// --- Event Listeners ---

textInput.addEventListener('keydown', (e) => {
    // Prevent spacebar from triggering default browser scroll
    if (e.key === ' ' && textInput.value.length === 0 && !testStarted) {
        e.preventDefault();
        return; // Don't start if first character is space
    }

    if (!testStarted && e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Meta' && e.key !== 'CapsLock' && e.key !== 'Tab' && e.key !== 'Escape') {
        testStarted = true;
        startTimer();
    }
});

textInput.addEventListener('input', (e) => {
    if (!testStarted) return; // Don't process input if test hasn't started

    const typedText = textInput.value;
    const currentWordElement = wordsDisplay.querySelectorAll('.word')[currentWordIndex];
    if (!currentWordElement) return; // Should not happen if words are rendered

    const targetWord = words[currentWordIndex];
    let isCorrectWordSoFar = true;

    // Reset character styling for the current word
    Array.from(currentWordElement.children).forEach(charSpan => {
        charSpan.classList.remove('correct', 'incorrect');
    });

    for (let i = 0; i < targetWord.length; i++) {
        const targetChar = targetWord[i];
        const typedChar = typedText[i];
        const charSpan = currentWordElement.children[i];

        if (typedChar === undefined) {
            // User hasn't typed this character yet
            isCorrectWordSoFar = false;
        } else if (typedChar === targetChar) {
            charSpan.classList.add('correct');
        } else {
            charSpan.classList.add('incorrect');
            isCorrectWordSoFar = false;
        }
    }

    // Handle spacebar or end of word
    if (e.inputType === 'insertText' && typedText.endsWith(' ')) {
        // Space pressed
        totalCharactersTyped++; // Count the space
        const targetSpaceChar = words[currentWordIndex][targetWord.length] === undefined ? ' ' : words[currentWordIndex][targetWord.length]; // Check if it's the actual space character
        if (targetSpaceChar === ' ') {
            // We assume the space after the word is always correct if typed
            correctCharactersTyped++;
        }

        // Move to the next word
        currentWordIndex++;
        currentCharIndex = 0;
        textInput.value = ''; // Clear input for the next word

        if (currentWordIndex < words.length) {
            highlightCurrentCharacter();
        } else {
            // End of test
            stopTimer();
            textInput.disabled = true;
            calculateMetrics();
            alert('Test finished! Check your results.');
        }
    } else if (e.inputType === 'deleteContentBackward') {
        // Handle backspace
        // We only decrement correct/total characters if we're deleting a character that was previously counted
        if (currentCharIndex > 0) {
            totalCharactersTyped--;
            // If the character being deleted was correct, decrement correct count
            const currentWordChars = words[currentWordIndex].split('');
            if (currentWordChars[currentCharIndex - 1] === typedText[currentCharIndex - 1]) { // Compare original char with the one that was correct
                 correctCharactersTyped--;
            }
            currentCharIndex--;
        } else if (currentWordIndex > 0 && textInput.value === '') {
            // If at the beginning of a word and backspacing empty input, go to previous word
            currentWordIndex--;
            const prevWord = words[currentWordIndex];
            currentCharIndex = prevWord.length; // Set cursor to end of previous word
            textInput.value = prevWord; // Pre-fill input with previous word
            // Re-evaluate previous word's correct/incorrect characters for styling
            // This is a bit more complex, for now, we'll just move the cursor
        }
        highlightCurrentCharacter();
        calculateMetrics(); // Recalculate metrics on backspace
    } else {
        // Regular typing: Check character by character
        if (typedText.length > currentCharIndex) {
            totalCharactersTyped++;
            const targetChar = targetWord[currentCharIndex];
            const typedChar = typedText[currentCharIndex];

            if (typedChar === targetChar) {
                correctCharactersTyped++;
            }
        }
        currentCharIndex = typedText.length;
        highlightCurrentCharacter();
        calculateMetrics();
    }
});

restartBtn.addEventListener('click', resetGame);

// --- Initialize the game on load ---
resetGame();
