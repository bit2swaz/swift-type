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
let currentTestDuration = 60; // default to 60 seconds
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
    let baseWords = [...commonWords]; // Start with common words

    if (includeNumbers) {
        baseWords = baseWords.concat(numbers);
    }
    if (includePunctuation) {
        baseWords = baseWords.concat(punctuations);
    }

    // Shuffle the combined baseWords array
    const shuffledWords = baseWords.sort(() => 0.5 - Math.random());

    if (currentTestMode === 'words') {
        words = shuffledWords.slice(0, currentWordCount);
    } else {
        words = shuffledWords.slice(0, 200); // Generate enough words for time mode
    }
}

function renderWords() {
    // 1. Remove all existing word spans, but keep the caret
    // Iterate in reverse to avoid issues with live NodeList updates
    const existingWordSpans = wordsDisplay.querySelectorAll('.word');
    for (let i = existingWordSpans.length - 1; i >= 0; i--) {
        existingWordSpans[i].remove();
    }

    // 2. Ensure caret is the first child (if it somehow got moved)
    // This makes sure the caret is always at the top of the words-display's children
    // for correct positioning and z-indexing.
    if (wordsDisplay.firstChild !== caret) {
        wordsDisplay.prepend(caret);
    }

    // 3. Append new words
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
    });

    updateCaretPosition(); // Position the caret after words are rendered
}


function updateCaretPosition() {
    const allWordElements = wordsDisplay.querySelectorAll('.word');
    const currentWordElement = allWordElements[currentWordIndex];

    if (!currentWordElement) {
        // No more words or test ended, hide caret
        caret.style.display = 'none';
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

        scrollWordsDisplay(rect.top, rect.height); // Pass character's position for scrolling
    }
}


function scrollWordsDisplay(charTop, charHeight) {
    const wordsDisplayRect = wordsDisplay.getBoundingClientRect();
    const wordsDisplayScrollTop = wordsDisplay.scrollTop;

    // Relative position of the character's top within the scrollable area
    const relativeCharTop = charTop - wordsDisplayRect.top;

    // Define a comfortable buffer zone within the wordsDisplay
    const scrollBuffer = 30; // pixels from top/bottom before scrolling

    // If character is above the visible area or too close to the top
    if (relativeCharTop < scrollBuffer) {
        wordsDisplay.scrollTop = wordsDisplayScrollTop + relativeCharTop - scrollBuffer;
    }
    // If character is below the visible area or too close to the bottom
    else if (relativeCharTop + charHeight > wordsDisplayRect.height - scrollBuffer) {
        wordsDisplay.scrollTop = wordsDisplayScrollTop + (relativeCharTop + charHeight - (wordsDisplayRect.height - scrollBuffer));
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

    if (currentTestMode === 'time' && elapsedTime >= currentTestDuration) {
        endTest();
    } else {
        calculateMetrics();
    }
}

function endTest() {
    stopTimer();
    testFinished = true;
    textInput.disabled = true;
    textInput.blur(); // Remove focus from the hidden input
    caret.style.display = 'none'; // Hide caret
    calculateMetrics();
    alert(`Test finished! Your WPM: ${wpmDisplay.textContent.split(': ')[1]}, Accuracy: ${accuracyDisplay.textContent.split(': ')[1]}`);
}

function resetGame() {
    stopTimer();
    currentWordIndex = 0;
    currentCharIndex = 0;
    totalCharactersTyped = 0;
    correctCharactersTyped = 0;
    testStarted = false;
    testFinished = false;

    timerDisplay.textContent = 'Time: 0s';
    wpmDisplay.textContent = 'WPM: 0';
    accuracyDisplay.textContent = 'Accuracy: 0%';
    textInput.value = '';
    textInput.disabled = false;
    textInput.focus(); // Ensure input is focused
    wordsDisplay.scrollTop = 0; // Reset scroll position

    generateWords();
    renderWords(); // This will also call updateCaretPosition
}

function calculateMetrics() {
    if (!testStarted || testFinished) return; // Only calculate if test is ongoing

    const currentTime = new Date().getTime();
    const elapsedTimeInSeconds = Math.floor((currentTime - startTime) / 1000);
    const elapsedTimeInMinutes = elapsedTimeInSeconds / 60;

    // Calculate WPM and Accuracy based on actual correct characters
    // For live update, we consider characters typed in the current word as well
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
    if (currentTestMode === 'words') { // Only change if different
        currentTestMode = 'time';
        modeTimeBtn.classList.add('active');
        modeWordsBtn.classList.remove('active');
        timeOptionsDiv.classList.remove('hidden');
        wordsOptionsDiv.classList.add('hidden');
        // Set default time option if none is active
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
    if (currentTestMode === 'time') { // Only change if different
        currentTestMode = 'words';
        modeWordsBtn.classList.add('active');
        modeTimeBtn.classList.remove('active');
        wordsOptionsDiv.classList.remove('hidden');
        timeOptionsDiv.classList.add('hidden');
        // Set default word option if none is active
        if (!wordsOptionsDiv.querySelector('.option-btn.active')) {
            wordsOptionsDiv.querySelector('.option-btn[data-value="50"]').classList.add('active');
            currentWordCount = 50;
        } else {
            currentWordCount = parseInt(wordsOptionsDiv.querySelector('.option-btn.active').dataset.value);
        }
        resetGame();
    }
});

// Generic handler for time options
timeOptionsDiv.addEventListener('click', (e) => {
    if (e.target.classList.contains('option-btn')) {
        timeOptionsDiv.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentTestDuration = parseInt(e.target.dataset.value);
        resetGame();
    }
});

// Generic handler for word options
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
        e.preventDefault(); // Prevent typing if test is finished
        return;
    }

    // Prevent spacebar from triggering default browser scroll if input is empty
    if (e.key === ' ' && textInput.value.length === 0 && !testStarted) {
        e.preventDefault();
        return;
    }

    // Start test on first *typing* key press (not Shift, Ctrl, Alt, etc.)
    if (!testStarted && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey && !e.repeat) {
        testStarted = true;
        startTimer();
    }
});

textInput.addEventListener('input', (e) => {
    if (!testStarted || testFinished) return;

    const typedText = textInput.value;
    const currentWordElement = wordsDisplay.querySelectorAll('.word')[currentWordIndex];
    if (!currentWordElement) {
        endTest(); // Should not happen if words are present, but a safeguard
        return;
    }

    const targetWord = words[currentWordIndex];
    const targetWordLength = targetWord.length;

    // Remove existing correctness classes and extra spans for the current word
    Array.from(currentWordElement.children).forEach(charSpan => {
        charSpan.classList.remove('correct', 'incorrect');
        // If it's an extra char, remove it
        if (charSpan.classList.contains('extra')) {
            charSpan.remove();
        }
    });

    let correctCharsInCurrentVisualWord = 0; // Track for visual correctness

    // Apply correctness classes to target characters
    for (let i = 0; i < targetWordLength; i++) {
        const targetChar = targetWord[i];
        const typedChar = typedText[i];
        const charSpan = currentWordElement.children[i]; // Get the original character span

        if (typedChar === undefined) {
            // User hasn't typed this character yet, no class
        } else if (typedChar === targetChar) {
            charSpan.classList.add('correct');
            correctCharsInCurrentVisualWord++;
        } else {
            charSpan.classList.add('incorrect');
        }
    }

    // Handle "extra" characters typed beyond the word length
    if (typedText.length > targetWordLength) {
        for (let i = targetWordLength; i < typedText.length; i++) {
            const extraCharSpan = document.createElement('span');
            extraCharSpan.classList.add('character', 'extra', 'incorrect'); // Mark extra chars as incorrect
            extraCharSpan.textContent = typedText[i];
            currentWordElement.appendChild(extraCharSpan);
        }
    }

    // --- Logic for moving to next word or ending test ---
    if (e.inputType === 'insertText' && typedText.endsWith(' ')) {
        // User typed a space (finished current word)
        e.preventDefault(); // Prevent actual space from appearing in input field before clearing

        // Calculate total and correct characters based on the *completed word*
        totalCharactersTyped += typedText.length; // Total characters user *attempted* to type for this word + space
        correctCharactersTyped += correctCharsInCurrentVisualWord; // Only count correct characters of the *actual word*

        if (typedText.substring(0, targetWordLength) === targetWord) {
             correctCharactersTyped++; // Count the space as correct if the word before it was correct
        } else {
            // If the word typed was incorrect, the space is still counted as total typed,
            // but not correct unless specific rules dictate it.
        }

        currentWordIndex++;
        currentCharIndex = 0; // Reset char index for the next word
        textInput.value = ''; // Clear input for the next word

        if (currentTestMode === 'words' && currentWordIndex >= words.length) {
            endTest(); // End test if word count reached
        } else if (currentWordIndex < words.length) {
            updateCaretPosition(); // Move caret to the start of the next word
        } else {
            // All generated words are typed (e.g., in time mode if test ends early or words run out)
            endTest();
        }
    } else if (e.inputType === 'deleteContentBackward') {
        // Backspace: Just update caret position and recalculate metrics
        currentCharIndex = typedText.length;
        updateCaretPosition();
        calculateMetrics(); // Recalculate metrics on backspace for live feedback
    } else {
        // Regular typing: Update char index and caret position
        currentCharIndex = typedText.length;
        updateCaretPosition();
        calculateMetrics(); // Update metrics as user types within a word
    }
});


restartBtn.addEventListener('click', resetGame);

// --- Initialize the game on load ---
// Set initial active states for buttons
document.querySelector('#time-options .option-btn[data-value="60"]').classList.add('active');
document.querySelector('#mode-time').classList.add('active');
resetGame();

// Initial focus on the hidden input field when the page loads
// This is important because the user doesn't click on a visible input
window.addEventListener('load', () => {
    textInput.focus();
});

// Re-focus the input if user clicks anywhere else, but not on restart button or settings elements
document.addEventListener('click', (e) => {
    // Check if the click target is NOT the text input itself, NOT the restart button,
    // NOT within the wordsDisplay (which we'll make focus the input), and NOT within settings panel
    if (!textInput.contains(e.target) &&
        !restartBtn.contains(e.target) &&
        !wordsDisplay.contains(e.target) &&
        !document.querySelector('.settings-panel').contains(e.target)) {
        textInput.focus();
    }
});

// Also, if wordsDisplay itself is clicked, focus the hidden input
wordsDisplay.addEventListener('click', () => {
    textInput.focus();
});