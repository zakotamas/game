let p1Score = 0;
let p2Score = 0;
let p1Choice = '';
let p2Choice = '';
let turn = 1;

const icons = { 'rock': '🪨', 'paper': '📄', 'scissors': '✂️' };
const ui = {
    instruction: document.getElementById('instruction'),
    subInstruction: document.getElementById('sub-instruction'),
    options: document.getElementById('options-container'),
    resultView: document.getElementById('result-view'),
    hand1: document.getElementById('hand1'),
    hand2: document.getElementById('hand2'),
    resultText: document.getElementById('round-result-text'),
    controls: document.getElementById('controls'),
    interstitial: document.getElementById('interstitial'),
    scores: { p1: document.getElementById('p1-score'), p2: document.getElementById('p2-score') }
};

function startGame() {
    document.getElementById('startScreen').classList.remove('active');
    updateTurnIndicator();
}

function updateTurnIndicator() {
    const p1Card = document.getElementById('p1-card');
    const p2Card = document.getElementById('p2-card');
    if (turn === 1) {
        p1Card.classList.add('active-turn');
        p2Card.classList.remove('active-turn');
    } else {
        p1Card.classList.remove('active-turn');
        p2Card.classList.add('active-turn');
    }
}

function makeChoice(choice) {
    if (turn === 1) {
        p1Choice = choice;
        turn = 2;
        updateTurnIndicator();
        ui.interstitial.style.display = 'flex';
    } else {
        p2Choice = choice;
        showShowdown();
    }
}

function startTurn2() {
    ui.interstitial.style.display = 'none';
    ui.instruction.innerText = "Játékos 2 választ!";
    ui.subInstruction.innerText = "(Játékos 1, ne leskelődj!)";
}

function showShowdown() {
    ui.options.style.display = 'none';
    ui.instruction.style.display = 'none';
    ui.subInstruction.style.display = 'none';
    ui.resultView.style.display = 'block';
    
    ui.hand1.innerText = "🤜"; ui.hand2.innerText = "🤛";
    ui.resultText.innerText = "3... 2... 1...";
    ui.controls.classList.remove('visible');
    ui.hand1.classList.add('shake'); ui.hand2.classList.add('shake');

    setTimeout(() => {
        ui.hand1.classList.remove('shake'); ui.hand2.classList.remove('shake');
        ui.hand1.innerText = icons[p1Choice]; ui.hand2.innerText = icons[p2Choice];
        calculateWinner();
    }, 2000);
}

function calculateWinner() {
    let winner = null;
    if (p1Choice === p2Choice) {
        ui.resultText.innerText = "Döntetlen!";
        ui.resultText.style.color = "#666";
    } else if (
        (p1Choice === 'rock' && p2Choice === 'scissors') ||
        (p1Choice === 'paper' && p2Choice === 'rock') ||
        (p1Choice === 'scissors' && p2Choice === 'paper')
    ) {
        p1Score++;
        ui.resultText.innerText = "Játékos 1 nyert!";
        ui.resultText.style.color = "#FF6B6B";
    } else {
        p2Score++;
        ui.resultText.innerText = "Játékos 2 nyert!";
        ui.resultText.style.color = "#4ECDC4";
    }
    ui.scores.p1.innerText = p1Score;
    ui.scores.p2.innerText = p2Score;
    ui.controls.classList.add('visible');
}

function nextRound() {
    turn = 1;
    updateTurnIndicator();
    p1Choice = ''; p2Choice = '';
    ui.resultView.style.display = 'none';
    ui.options.style.display = 'flex';
    ui.instruction.style.display = 'block';
    ui.subInstruction.style.display = 'block';
    ui.instruction.innerText = "Játékos 1 választ!";
    ui.subInstruction.innerText = "(Játékos 2, ne leskelődj!)";
}

function endGame() {
    window.location.href = 'index.html';
}