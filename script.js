// --- DOM Elements ---
const wordsDisplay = document.getElementById('words-display');
const textInput = document.getElementById('text-input');
const timerDisplay = document.getElementById('timer');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const restartBtn = document.getElementById('restart-btn');

// Game State Variables
let words = [];
let currentWordIndex = 0;
let currentCharIndex = 0;
let startTime;
let timerInterval;
let totalCharactersTyped = 0;
let correctCharactersTyped = 0;
let testStarted = false;

// Word List
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
