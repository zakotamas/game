// game5.js - Labirintus Logika (Kábelzűrzavar)

const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');

// Játékállapot változók
let currentLevel = 1;
const maxLevel = 20;
let correctExitIndex = 0; // 0=A, 1=B, 2=C (Hova fut be a kijelölt kábel)
let startPositionIndex = 0; // 0, 1 vagy 2 (Melyik pozícióból indul a karakter)
let paths = []; // Tárolja a kereszteződéseket
let animating = false; // Ha esetleg később animációt akarunk

// Beállítások a rajzoláshoz
const colors = {
    background: "#f4f4f9",
    wireDefault: "#bdc3c7", // Inaktív kábel színe (szürke)
    wireActive: "#292f36",  // Aktív kábel színe (sötét, hogy jól látszódjon)
    targets: ["#FF6B6B", "#4ECDC4", "#FF9F1C"] // A, B, C színei
};

// -- RESZPONZIVITÁS KEZELÉSE --
function resizeCanvas() {
    const container = document.querySelector('.canvas-container');
    // A canvas szélessége legyen a konténer szélessége
    canvas.width = container.clientWidth;
    // A magasságot arányosan állítjuk be, de mobilon legyen elég magas a görbékhez
    // Minél nehezebb a szint, annál magasabb lehet a pálya
    let heightMultiplier = window.innerWidth < 600 ? 1.5 : 1.2; 
    canvas.height = canvas.width * heightMultiplier;
    
    // Ha túl alacsony lenne (széles képernyőn), adjunk neki minimum magasságot
    if (canvas.height < 450) canvas.height = 450;

    if (currentLevel > 0) draw(); // Újrarajzolás átméretezéskor
}
window.addEventListener('resize', resizeCanvas);

// -- JÁTÉK INDÍTÁSA --
function initGame() {
    document.getElementById('startScreen').classList.remove('active');
    resizeCanvas();
    generateLevel();
}

// -- PÁLYA GENERÁLÁSA --
function generateLevel() {
    // 1. Véletlenszerűen kiválasztjuk, honnan indul a karakter (0, 1, 2)
    startPositionIndex = Math.floor(Math.random() * 3);
    
    // 2. Meghatározzuk a szakaszok (kereszteződések) számát a szint alapján
    // Szint 1: 4 szakasz, Szint 20: kb 14 szakasz
    const segmentsCount = 4 + Math.floor(currentLevel / 2);
    
    paths = [];
    let currentLane = startPositionIndex; // Itt tart a helyes útvonal logikailag

    // 3. Legeneráljuk a csere pontokat
    for (let i = 0; i < segmentsCount; i++) {
        // Véletlenszerűen döntünk: 0=Nincs csere, 1=Bal-Közép csere, 2=Közép-Jobb csere
        // Ahogy nő a szint, csökkentjük az üres (csere nélküli) szakaszok esélyét
        let chanceForNoSwap = Math.max(0.1, 0.4 - (currentLevel * 0.01));
        let swapType = 0;

        if (Math.random() > chanceForNoSwap) {
            swapType = Math.floor(Math.random() * 2) + 1; // 1 vagy 2
        }

        // Hozzáadjuk a listához
        paths.push(swapType);

        // Frissítjuk a "megoldást" a memóriában
        if (swapType === 1) { // 0 <-> 1 csere
            if (currentLane === 0) currentLane = 1;
            else if (currentLane === 1) currentLane = 0;
        } else if (swapType === 2) { // 1 <-> 2 csere
            if (currentLane === 1) currentLane = 2;
            else if (currentLane === 2) currentLane = 1;
        }
    }

    correctExitIndex = currentLane; // Ez a helyes megoldás (A, B vagy C)
    draw(); // Kirajzoljuk a vizuális pályát
}

// -- RAJZOLÁS --
function draw() {
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    // Törlés
    ctx.clearRect(0, 0, w, h);

    // Margók
    const marginTop = 80;
    const marginBottom = 80;
    const drawingHeight = h - marginTop - marginBottom;
    
    // 3 sáv X koordinátája
    const lanesX = [w * 0.2, w * 0.5, w * 0.8];
    
    // Szakasz magassága
    const stepY = drawingHeight / paths.length;

    // -- 1. VEZETÉKEK RAJZOLÁSA --
    // Háromszor futunk le, mindhárom vezetékért (0, 1, 2)
    for (let wireIdx = 0; wireIdx < 3; wireIdx++) {
        
        ctx.beginPath();
        
        // Stílus: Ha ez a startPositionIndex, akkor ez a "Karakter" vezetéke
        // De a játék lényege a követés, így legyen mindegyik hasonló, 
        // csak a karakter legyen jelölve a tetején.
        // NEHÉZSÉG: Legyenek különböző színűek? Nem, az túl könnyű.
        // Legyenek mind szürkék? Igen, az a feladat.
        
        ctx.strokeStyle = colors.wireActive; // Sötét szürke mindenki
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Kezdőpont
        let currentX = lanesX[wireIdx];
        let currentY = marginTop;
        
        ctx.moveTo(currentX, currentY);

        // Végigmegyünk a path tömbön és rajzoljuk a görbéket
        // Ebben a ciklusban egy "logikai sávot" követünk végig
        // Hogy hol van vizuálisan a vezeték
        let trackedLane = wireIdx; 

        for (let i = 0; i < paths.length; i++) {
            let swapType = paths[i];
            let nextY = currentY + stepY;
            let nextLane = trackedLane; // Alapból marad

            // Megnézzük, hogy a mi sávunk érintett-e a cserében
            if (swapType === 1) { // 0 és 1 cserél
                if (trackedLane === 0) nextLane = 1;
                if (trackedLane === 1) nextLane = 0;
            }
            if (swapType === 2) { // 1 és 2 cserél
                if (trackedLane === 1) nextLane = 2;
                if (trackedLane === 2) nextLane = 1;
            }

            let nextX = lanesX[nextLane];

            // Görbe rajzolása (Bezier) a szép fonott hatáshoz
            // A kontrollpontok felelnek az "S" alakért
            const cp1x = currentX;
            const cp1y = currentY + (stepY * 0.5); // Félúton lefelé, de még a régi X-en
            const cp2x = nextX;
            const cp2y = currentY + (stepY * 0.5); // Félúton lefelé, már az új X-en

            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, nextX, nextY);

            // Frissítés a következő körre
            currentX = nextX;
            currentY = nextY;
            trackedLane = nextLane;
        }

        // Végső egyenes a célba
        ctx.lineTo(currentX, h - marginBottom + 40);
        ctx.stroke();
    }

    // -- 2. CSOMÓPONT PÖTTYÖK (Opcionális, díszítésnek) --
    // Ahol a vezeték "belép" a cserébe, tehetünk kis pöttyöt, de a bezier görbe önmagában is szép.

    // -- 3. START ELEMEK (KARAKTER) --
    for (let i = 0; i < 3; i++) {
        // Alap start pont
        ctx.beginPath();
        ctx.arc(lanesX[i], marginTop - 20, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#ccc";
        ctx.fill();

        // Ha ez a kiválasztott start
        if (i === startPositionIndex) {
            // Rajzolunk egy Robot fejet vagy ikont
            ctx.font = "40px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("🤖", lanesX[i], marginTop - 50);
            
            // Nyíl
            ctx.fillStyle = "#e74c3c";
            ctx.beginPath();
            ctx.moveTo(lanesX[i] - 10, marginTop - 25);
            ctx.lineTo(lanesX[i] + 10, marginTop - 25);
            ctx.lineTo(lanesX[i], marginTop - 10);
            ctx.fill();
        }
    }

    // -- 4. CÉL ELEMEK (DOBOZOK) --
    const labels = ["A", "B", "C"];
    const boxWidth = 50;
    const boxHeight = 50;
    const boxY = h - marginBottom + 20;

    for (let i = 0; i < 3; i++) {
        // Doboz rajzolása
        ctx.fillStyle = colors.targets[i];
        
        // Kerekített téglalap-szerűség
        roundRect(ctx, lanesX[i] - boxWidth/2, boxY, boxWidth, boxHeight, 10, true);
        
        // Betű
        ctx.fillStyle = "white";
        ctx.font = "bold 30px Nunito";
        ctx.fillText(labels[i], lanesX[i], boxY + boxHeight/2 + 2);
    }
}

// Segédfüggvény lekerekített téglalaphoz
function roundRect(ctx, x, y, width, height, radius, fill) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
}

// -- ESEMÉNYKEZELŐK --

function checkAnswer(selectedIndex) {
    if (selectedIndex === correctExitIndex) {
        // Helyes válasz
        document.getElementById('successModal').style.display = 'flex';
    } else {
        // Helytelen
        document.getElementById('failModal').style.display = 'flex';
    }
}

function nextLevel() {
    document.getElementById('successModal').style.display = 'none';
    currentLevel++;
    
    if (currentLevel > maxLevel) {
        document.getElementById('endModal').style.display = 'flex';
    } else {
        document.getElementById('levelDisplay').innerText = currentLevel;
        generateLevel();
    }
}

function retryLevel() {
    document.getElementById('failModal').style.display = 'none';
    // Nem generálunk újat, a játékosnak újra meg kell próbálnia ugyanazt megfejteni
}