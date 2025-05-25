// Theme Logic
const toggle = document.getElementById('theme-toggle');
const body = document.body;

// Initialize theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  body.classList.add('dark');
  toggle.checked = true;
} else {
  body.classList.remove('dark');
  toggle.checked = false;
}

// Toggle theme
toggle.addEventListener('change', () => {
  if (toggle.checked) {
    body.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    body.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
});

// Typing Logic (preserved)
const wordsContainer = document.getElementById('words-container');
const input = document.getElementById('input');

const words = ['swift', 'type', 'clone', 'fast', 'javascript', 'html', 'css', 'monkeytype', 'keyboard', 'code'];

let currentWordIndex = 0;

function renderWords() {
  wordsContainer.innerHTML = words
    .map((word, index) => {
      return `<span class="word${index === currentWordIndex ? ' active' : ''}">${word}</span>`;
    })
    .join(' ');
}

input.addEventListener('input', () => {
  const currentWord = words[currentWordIndex];
  const typed = input.value.trim();

  if (typed === currentWord) {
    currentWordIndex++;
    input.value = '';
    renderWords();
  }
});

renderWords();
