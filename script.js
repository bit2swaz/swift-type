// --- DOM Elements ---
const wordsDisplay = document.getElementById('words-display');
const textInput = document.getElementById('text-input');
const timerDisplay = document.getElementById('timer');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const restartBtn = document.getElementById('restart-btn');

// --- Game State Variables ---
let words = [];
let currentWordIndex = 0;
let currentCharIndex = 0;
let startTime;
let timerInterval;
let totalCharactersTyped = 0;
let correctCharactersTyped = 0;
let testStarted = false;

// --- Word List (you can expand this significantly or fetch from an API) ---
const commonWords = [
    "the", "be", "is", "of", "and", "a", "to", "in", "he", "have",
    "it", "that", "for", "they", "i", "with", "as", "not", "on", "she",
    "at", "by", "this", "we", "you", "do", "but", "his", "from", "her",
    "or", "which", "one", "all", "would", "there", "their", "what", "so", "up",
    "out", "if", "about", "who", "get", "which", "go", "me", "when", "make",
    "can", "like", "time", "no", "just", "him", "know", "take", "people", "into",
    "year", "your", "good", "some", "could", "them", "see", "other", "than", "then",
    "now", "look", "only", "come", "its", "over", "think", "also", "back", "after",
    "use", "two", "how", "our", "work", "first", "well", "way", "even", "new",
    "want", "because", "any", "these", "give", "day", "most", "us", "had", "say",
    "great", "where", "help", "through", "much", "before", "right", "too", "much", "too",
    "those", "also", "very", "did", "my", "through", "under", "next", "another", "find",
    "big", "small", "word", "sentence", "paragraph", "type", "keyboard", "display", "speed", "accuracy",
    "challenge", "program", "code", "developer", "javascript", "html", "css", "website", "application", "data"
];

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