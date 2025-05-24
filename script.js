let allWords = [];
const numbers = [];
const punctuations = [
    '.', ',', '!', '?', ':', ';', "'", '"', '/', '\\', '|',
    '(', ')', '[', ']', '{', '}', '-', '_', '=', '+', '&',
    '*', '^', '%', '$', '#', '@', '~', '`'
];

let currentTestWords = [];
let currentWordIndex = 0;
let currentCharIndex = 0;

let testActive = false;
let testFinished = false;
let timerId = null;
let timeLeft = 60;
let initialTestTime = 60;

let correctChars = 0;
let incorrectChars = 0;
let totalTypedChars = 0;
let typedCorrectlyOnce = 0;
let startTime = 0;

