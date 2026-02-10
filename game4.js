let currentLevel = 1; // Jelenlegi osztály szintje
let questionCount = 0; // Hányadik kérdésnél tartunk
let correctAnswers = 0; // Hányat oldott meg sikeresen
let currentSolution = 0; // A jelenlegi feladat megoldása
const maxQuestions = 20; // Minden szinten 20 kérdés

// Játék indítása a választott szinttel
function startGame(level) {
    currentLevel = level;
    questionCount = 0;
    document.getElementById('startScreen').classList.remove('active'); // Eltünteti a start képernyőt
    updateHUD();
    generateQuestion(); // Első kérdés generálása
}

// Kijelző frissítése
function updateHUD() {
    document.getElementById('currentLevelDisplay').innerText = currentLevel;
    document.getElementById('progressDisplay').innerText = (questionCount + 1) + "/" + maxQuestions;
}

// Kérdés generáló logika osztályonként
function generateQuestion() {
    let num1, num2, num3, operator;
    const qBox = document.getElementById('questionBox');
    document.getElementById('answerInput').value = ''; // Input törlése
    document.getElementById('feedbackMessage').innerText = ''; // Hibaüzenet törlése
    document.getElementById('answerInput').focus();

    switch(currentLevel) {
        case 1: // 1. Osztály: Összeadás/Kivonás 20-ig
            if(Math.random() > 0.5) {
                num1 = Math.floor(Math.random() * 10) + 1; // 1-10
                num2 = Math.floor(Math.random() * 10) + 1;
                currentSolution = num1 + num2;
                qBox.innerText = `${num1} + ${num2}`;
            } else {
                num1 = Math.floor(Math.random() * 10) + 5; // Hogy ne legyen negatív
                num2 = Math.floor(Math.random() * 5) + 1;
                currentSolution = num1 - num2;
                qBox.innerText = `${num1} - ${num2}`;
            }
            break;

        case 2: // 2. Osztály: 100-ig számolás, egyszerű szorzás
            if(Math.random() > 0.3) {
                num1 = Math.floor(Math.random() * 40) + 10;
                num2 = Math.floor(Math.random() * 40) + 10;
                if(Math.random() > 0.5) {
                    currentSolution = num1 + num2;
                    qBox.innerText = `${num1} + ${num2}`;
                } else {
                    // Biztosítjuk, hogy a kivonás pozitív maradjon
                    let max = Math.max(num1, num2);
                    let min = Math.min(num1, num2);
                    currentSolution = max - min;
                    qBox.innerText = `${max} - ${min}`;
                }
            } else {
                // Kis szorzótábla eleje
                num1 = Math.floor(Math.random() * 5) + 1;
                num2 = Math.floor(Math.random() * 5) + 1;
                currentSolution = num1 * num2;
                qBox.innerText = `${num1} · ${num2}`;
            }
            break;

        case 3: // 3. Osztály: Szorzás, Osztás
            let type = Math.random();
            if(type < 0.5) { // Szorzás
                num1 = Math.floor(Math.random() * 9) + 2;
                num2 = Math.floor(Math.random() * 9) + 2;
                currentSolution = num1 * num2;
                qBox.innerText = `${num1} · ${num2}`;
            } else { // Osztás (csak egészre jöjjön ki)
                num2 = Math.floor(Math.random() * 8) + 2;
                currentSolution = Math.floor(Math.random() * 9) + 1; 
                num1 = currentSolution * num2; // Visszafelé számoljuk ki
                qBox.innerText = `${num1} : ${num2}`;
            }
            break;

        case 4: // 4. Osztály: Vegyes, nagyobb számok
             if(Math.random() > 0.5) {
                 num1 = Math.floor(Math.random() * 200) + 50;
                 num2 = Math.floor(Math.random() * 200) + 50;
                 currentSolution = num1 + num2;
                 qBox.innerText = `${num1} + ${num2}`;
             } else {
                 num1 = Math.floor(Math.random() * 12) + 2;
                 num2 = Math.floor(Math.random() * 12) + 2;
                 currentSolution = num1 * num2;
                 qBox.innerText = `${num1} · ${num2}`;
             }
             break;

        case 5: // 5. Osztály: Kreatív, több tagú műveletek
            // Pl: 5 * 4 + 3
            num1 = Math.floor(Math.random() * 10) + 2;
            num2 = Math.floor(Math.random() * 10) + 2;
            num3 = Math.floor(Math.random() * 20) + 1;
            
            if(Math.random() > 0.5) {
                currentSolution = (num1 * num2) + num3;
                qBox.innerText = `${num1} · ${num2} + ${num3}`;
            } else {
                currentSolution = (num1 * num2) - num3;
                qBox.innerText = `${num1} · ${num2} - ${num3}`;
            }
            break;
            
        default: // Ha túlmentünk az 5. osztályon
             currentLevel = 5;
             generateQuestion();
             break;
    }
}

// Válasz ellenőrzése
function checkAnswer() {
    const input = document.getElementById('answerInput');
    const userVal = parseInt(input.value);
    const feedback = document.getElementById('feedbackMessage');

    if(isNaN(userVal)) {
        feedback.innerText = "Írj be egy számot!";
        return;
    }

    if(userVal === currentSolution) {
        // Helyes válasz
        document.getElementById('successModal').style.display = 'flex'; // Dicsérő ablak megjelenítése
    } else {
        // Helytelen válasz
        feedback.innerText = "Nem jó, próbáld újra! 🤔";
        input.value = '';
        input.focus();
    }
}

// Következő kérdésre lépés
function nextQuestion() {
    document.getElementById('successModal').style.display = 'none'; // Modal bezárása
    questionCount++;

    if(questionCount >= maxQuestions) {
        // Szint vége
        document.getElementById('nextLevelNum').innerText = currentLevel + 1;
        document.getElementById('levelCompleteModal').style.display = 'flex';
    } else {
        updateHUD();
        generateQuestion();
    }
}

// Következő szintre lépés
function nextLevel() {
    document.getElementById('levelCompleteModal').style.display = 'none';
    if(currentLevel < 5) {
        currentLevel++;
        questionCount = 0;
        updateHUD();
        generateQuestion();
    } else {
        alert("Gratulálunk! Te egy igazi Matek Zseni vagy! Minden szintet teljesítettél.");
        window.location.href = 'index.html'; // Vissza a főoldalra
    }
}

// Enter gomb támogatása
document.getElementById('answerInput').addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    checkAnswer();
  }
});