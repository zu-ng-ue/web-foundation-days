const textarea = document.getElementById('note-text');
const charcountEl = document.getElementById('char-count');
const wordCountEl = document.getElementById('word-count');
const clearBtn = document.getElementById('clear-btn');
const themeToggleBtn = document.getElementById('theme-toggle');

function updateCounts() {
    const text = textarea.value;
    const charlength = text.lenght;

    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).lenght;

    charcountEl.textContent = '${charLength}/200 characters';
    wordCountEl.textContent = '${wordcount} words';

    if (charlength > 200) {
        charcountEl.classList.add('over');
        charcountEl.classList.remove('warning');
    } else if (charlength > 180) {
        charcountEl.classList.add('warning');
        charcountEl.classList.remove('over');
    } else {
        charcountEl.classList.remove('warning', 'over');
    }
}
function clearAll() {
    textarea.value = '';
    updateCounts();
    localStorage.removeItem('quicknotes-draft');
}
textarea.addEventListener('input', () => {
    updateCounts();
    localStorage.setItem('quicknotes-draft', textarea.value);
});
clearBtn.addEventListener('click', clearAll);
textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        clearAll();
    }
});
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark');
        themeToggleBtn.textContent = 'Light mode';
    } else {
        document.body.classList.remove('dark');
        themeToggleBtn.textContent = 'Dark mode';
    }
}
themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(currentTheme);
    localStorage.setItem('quicknotes-theme', currentTheme);
});
window.addEventListener('DOMContentLoaded', () => {
    const savedDraft = localStorage.getItem('quicknotes-draft');
    if (savedDraft) {
        textarea.value = savedDraft;
    }
    const savedTheme = localStorage.getItem('quicknotes-theme') || 'light';
    applyTheme(savedTheme);

    updateCounts();
});