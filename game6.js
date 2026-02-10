// game6.js - Memória Mester logika

const grid = document.getElementById('grid');
const movesDisplay = document.getElementById('moves');
const timeDisplay = document.getElementById('time');
const matchesDisplay = document.getElementById('matches');
const toast = document.getElementById('toast');

// Emojik listája (15 pár kell a 30 kártyához)
const emojis = [
    '🐶', '🐱', '🐭', '🐹', '🐰', 
    '🦊', '🐻', '🐼', '🐨', '🐯', 
    '🦁', '🐮', '🐷', '🐸', '🐙'
];

let cardsArray = [];
let hasFlippedCard = false;
let lockBoard = false; // Megakadályozza a kattintást, amíg a gép "gondolkodik"
let firstCard, secondCard;
let matchesFound = 0;
let moves = 0;
let timerInterval;
let seconds = 0;

// Dicsérő és bátorító üzenetek
const praiseMessages = ["Zseniális! 🌟", "Szép munka! 🔥", "Ez az! 🎯", "Remek memória! 🧠", "Csak így tovább! 🚀"];
const encourageMessages = ["Ne csüggedj! 💪", "Majdnem megvolt! 🤔", "Próbáld újra! 🔄", "Figyelj jobban! 👀", "Sebaj, menni fog! ✨"];

// Játék indítása
function startGame() {
    document.getElementById('startScreen').classList.remove('active');
    resetBoardVars();
    initGrid();
    startTimer();
}

function resetBoardVars() {
    matchesFound = 0;
    moves = 0;
    seconds = 0;
    movesDisplay.innerText = 0;
    matchesDisplay.innerText = "0/15";
    timeDisplay.innerText = "00:00";
    clearInterval(timerInterval);
}

// Kártyák létrehozása és keverése
function initGrid() {
    grid.innerHTML = '';
    // Készítünk párokat: minden emojit kétszer teszünk be
    cardsArray = [...emojis, ...emojis];
    
    // Fisher-Yates keverés
    cardsArray.sort(() => 0.5 - Math.random());

    cardsArray.forEach(emoji => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.emoji = emoji; // Eltároljuk az emojit adatként

        const frontFace = document.createElement('div');
        frontFace.classList.add('card-face', 'card-front');
        frontFace.innerHTML = '🧠'; // Hátlap minta

        const backFace = document.createElement('div');
        backFace.classList.add('card-face', 'card-back');
        backFace.innerText = emoji;

        card.appendChild(frontFace);
        card.appendChild(backFace);
        
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}

// Kártya fordítása
function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return; // Nem kattinthat ugyanarra kétszer

    this.classList.add('flipped');

    if (!hasFlippedCard) {
        // Első kártya
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    // Második kártya
    secondCard = this;
    incrementMoves();
    checkForMatch();
}

// Egyezés ellenőrzése
function checkForMatch() {
    let isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;

    isMatch ? disableCards() : unflipCards();
}

// Ha találat van
function disableCards() {
    lockBoard = true; // Rövid időre zároljuk, hogy ne lehessen gyorsan kattintgatni közben
    
    // Kis késleltetés a "sikerélmény" miatt, mielőtt eltűnik
    setTimeout(() => {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        
        // Eseménykezelők levétele (biztonsági okból)
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);

        showToast(true); // Dicséret
        matchesFound++;
        matchesDisplay.innerText = matchesFound + "/15";
        
        resetBoardState();

        if (matchesFound === emojis.length) {
            gameWon();
        }
    }, 800);
}

// Ha nincs találat
function unflipCards() {
    lockBoard = true;
    showToast(false); // Bátorítás

    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoardState();
    }, 1200); // Kicsit hosszabb idő, hogy meg lehessen jegyezni
}

function resetBoardState() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function incrementMoves() {
    moves++;
    movesDisplay.innerText = moves;
}

// Időzítő
function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timeDisplay.innerText = 
            (mins < 10 ? "0" + mins : mins) + ":" + 
            (secs < 10 ? "0" + secs : secs);
    }, 1000);
}

// Játék vége
function gameWon() {
    clearInterval(timerInterval);
    setTimeout(() => {
        document.getElementById('finalTime').innerText = timeDisplay.innerText;
        document.getElementById('finalMoves').innerText = moves;
        document.getElementById('victoryModal').style.display = 'flex';
    }, 500);
}

// Újraindítás
function restartGame() {
    document.getElementById('victoryModal').style.display = 'none';
    resetBoardVars();
    initGrid();
    startTimer();
}

// Toast üzenet megjelenítése
function showToast(isSuccess) {
    const messages = isSuccess ? praiseMessages : encourageMessages;
    const msg = messages[Math.floor(Math.random() * messages.length)];
    
    toast.innerText = msg;
    toast.style.backgroundColor = isSuccess ? 'rgba(78, 205, 196, 0.95)' : 'rgba(255, 107, 107, 0.95)';
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 1500);
}