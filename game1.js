// QWERTZ kiosztás soronként
const keyboardRows = [
    "QWERTZUIOPŐÚ".split(""),
    "ASDFGHJKLÉÁŰ".split(""),
    "ÍYXCVBNMÖÜ".split("")
];
const allKeys = keyboardRows.flat();

const keyboardDiv = document.getElementById('keyboard');
const targetKeyDisplay = document.getElementById('target-key');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const modal = document.getElementById('gameOverModal');
const startScreen = document.getElementById('startScreen');

let score = 0;
let currentTime = 300;
let timerInterval;
let currentTarget = '';
let gameRunning = false;

function createKeyboard() {
    keyboardDiv.innerHTML = '';
    keyboardRows.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('keyboard-row');
        row.forEach(key => {
            const keyDiv = document.createElement('div');
            keyDiv.classList.add('key');
            keyDiv.dataset.key = key;
            keyDiv.innerText = key;
            keyDiv.onclick = () => handleInput(key);
            rowDiv.appendChild(keyDiv);
        });
        keyboardDiv.appendChild(rowDiv);
    });
}

function initGame() {
    startScreen.classList.remove('active');
    gameRunning = true;
    startGame();
}

function restartGame() {
    modal.style.display = 'none';
    gameRunning = true;
    startGame();
}

function startGame() {
    score = 0;
    currentTime = 300;
    scoreDisplay.innerText = score;
    clearInterval(timerInterval);
    
    setNewTarget();
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        if(!gameRunning) return;
        currentTime--;
        updateTimerDisplay();
        if (currentTime <= 0) endGame();
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    timeDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function setNewTarget() {
    const prev = document.querySelector('.key.active-target');
    if (prev) prev.classList.remove('active-target');
    currentTarget = allKeys[Math.floor(Math.random() * allKeys.length)];
    targetKeyDisplay.innerText = currentTarget;
    const keyDiv = document.querySelector(`.key[data-key="${currentTarget}"]`);
    if (keyDiv) keyDiv.classList.add('active-target');
}

function endGame() {
    gameRunning = false;
    clearInterval(timerInterval);
    document.getElementById('finalScore').innerText = score;
    modal.style.display = 'flex';
}

function handleInput(pressedKey) {
    if (!gameRunning) return;
    pressedKey = pressedKey.toUpperCase();
    const keyDiv = document.querySelector(`.key[data-key="${pressedKey}"]`);
    if (keyDiv) {
        keyDiv.classList.add('pressed');
        setTimeout(() => keyDiv.classList.remove('pressed'), 150);
    }
    if (pressedKey === currentTarget) {
        score += 3;
        scoreDisplay.style.color = "#4ECDC4";
        setNewTarget();
    } else if (allKeys.includes(pressedKey)) {
        score -= 1;
        scoreDisplay.style.color = "#FF6B6B";
    }
    scoreDisplay.innerText = score;
    setTimeout(() => scoreDisplay.style.color = "inherit", 300);
}

document.addEventListener('keydown', (e) => handleInput(e.key));
createKeyboard();