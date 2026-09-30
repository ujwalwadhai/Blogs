const content = document.getElementById('content');

const wordCount = document.getElementById('word-count');

const characterCount =
    document.getElementById('character-count');

function updateCount() {
    const text = content.value.trim();
    const words = text
        ? text.split(/\s+/).filter(Boolean).length
        : 0;
    wordCount.textContent =
        `${words} ${words === 1 ? 'word' : 'words'}`;
    characterCount.textContent =
        content.value.length;
}

content.addEventListener(
    'input',
    updateCount
);

updateCount();