// game3.js — Javított változat: két akadálytípus, nem kereszteződnek, zavaró háttérelemek

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let DPR = window.devicePixelRatio || 1;
function resizeCanvas(){
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * DPR);
  canvas.height = Math.floor(rect.height * DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
window.addEventListener('resize', () => { resizeCanvas(); });

/* Játék állapotok */
let running = false;
let gameOver = false;
let score = 0;
let speed = 0.75;            // alacsonyabb kezdősebesség
let spawnTimer = 0;
let spawnCooldown = 2000;   // ms
let obstacles = [];
let lastTime = 0;

/* Háttérelemek (zavaró tényezők) */
let birds = [];
let balloons = [];
let confetti = [];

/* Játékos paraméterek */
const player = {
  x: 60,
  y: 0,
  width: 44,
  height: 64,
  vy: 0,
  gravity: 0.55,
  jumpForce: -16,
  grounded: false,
  ducking: false,
  color: '#FF6B6B'
};

/* Padló magasság */
function groundY(){
  return canvas.getBoundingClientRect().height * 0.82;
}

/* UI elemek */
const startBtn = document.getElementById('startBtn');
const startOverlay = document.getElementById('startOverlay');
const overlay = document.getElementById('overlay');
const finalScore = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const scoreEl = document.getElementById('score');
const speedEl = document.getElementById('speed');

startBtn.addEventListener('click', () => { startOverlay.classList.add('hidden'); initBackground(); startGame(); });
restartBtn.addEventListener('click', () => { overlay.classList.add('hidden'); resetGame(); initBackground(); startGame(); });

function resetGame(){
  running = false; gameOver = false; score = 0; speed = 0.75; spawnTimer = 0; spawnCooldown = 2000; obstacles = [];
  player.y = 0; player.vy = 0; player.ducking = false; lastTime = 0;
  birds = []; balloons = []; confetti = [];
  scoreEl.innerText = 0; speedEl.innerText = speed.toFixed(2);
}

function startGame(){
  resizeCanvas();
  player.y = groundY() - player.height;
  running = true; gameOver = false; lastTime = performance.now();
  requestAnimationFrame(loop);
}

/* Vezérlés */
const btnUp = document.getElementById('btnUp');
const btnDown = document.getElementById('btnDown');

function jump(){
  if (gameOver) return;
  if (player.grounded){
    player.vy = player.jumpForce;
    player.grounded = false;
  }
}
function duck(on){
  if (gameOver) return;
  if (on === player.ducking) return;
  player.ducking = on;
  player.height = on ? 36 : 64;
  if (player.grounded) {
    player.y = groundY() - player.height;
  }
  if (!on && player.y + player.height > groundY()) {
    player.y = groundY() - player.height;
  }
}

btnUp.addEventListener('touchstart', (e)=>{ e.preventDefault(); jump(); });
btnUp.addEventListener('mousedown', ()=> jump());
btnDown.addEventListener('touchstart', (e)=>{ e.preventDefault(); duck(true); });
btnDown.addEventListener('touchend', (e)=>{ e.preventDefault(); duck(false); });
btnDown.addEventListener('mousedown', ()=> duck(true));
btnDown.addEventListener('mouseup', ()=> duck(false));

window.addEventListener('keydown', (e)=>{
  if (e.code === 'ArrowUp' || e.code === 'Space') { e.preventDefault(); jump(); }
  if (e.code === 'ArrowDown') { e.preventDefault(); duck(true); }
  if (e.code === 'KeyR' && gameOver) { restartBtn.click(); }
});
window.addEventListener('keyup', (e)=>{
  if (e.code === 'ArrowDown') duck(false);
});

/* Segédfüggvények */
function randRange(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }

/* Háttér inicializálás */
function initBackground(){
  const w = canvas.getBoundingClientRect().width;
  birds = []; balloons = []; confetti = [];
  for (let i=0;i<4;i++){
    birds.push({ x: randRange(0,w), y: randRange(30,140), speed: 0.3 + Math.random()*0.6, phase: Math.random()*Math.PI*2 });
  }
  for (let i=0;i<3;i++){
    balloons.push({ x: randRange(40,w-40), y: randRange(80,260), speed: 0.08 + Math.random()*0.18, sway: Math.random()*1.6 });
  }
  // kis konfetti darabok, csak vizuális zaj
  for (let i=0;i<18;i++){
    confetti.push({ x: randRange(0,w), y: randRange(0,canvas.getBoundingClientRect().height), vx: (Math.random()-0.5)*0.4, vy: 0.1 + Math.random()*0.4, color: randConfettiColor() });
  }
}

function randConfettiColor(){
  const cols = ['#FFD166','#06D6A0','#118AB2','#EF476F','#FFB4A2'];
  return cols[Math.floor(Math.random()*cols.length)];
}

/* Obstacles generálás — low (ugrani) és high (hajolni) — nem kereszteződnek */
function spawnObstacle(){
  const canvasW = canvas.getBoundingClientRect().width;
  const spawnX = canvasW + 40;
  // ellenőrizzük az utolsó akadályt: legyen elegendő távolság
  const minSpacing = Math.max(300, 420 - Math.floor(speed*60));
  let canSpawn = true;
  if (obstacles.length > 0) {
    const lastO = obstacles[obstacles.length - 1];
    const dist = spawnX - (lastO.x + lastO.w);
    if (dist < minSpacing) {
      canSpawn = false;
    }
  }
  if (!canSpawn) {
    // ha túl közel van, toljuk a spawnTimer-t, hogy később próbálkozzon
    spawnTimer = 0;
    spawnCooldown = randRange(1400, 2600);
    return;
  }

  const type = Math.random() < 0.6 ? 'low' : 'high';
  const ground = groundY();
  if (type === 'low'){
    const h = randRange(18, 36);
    const w = randRange(28, 44);
    const y = ground - h;
    obstacles.push({ x: spawnX, y, w, h, type });
  } else {
    const normalTop = ground - 64;
    const duckedTop = ground - 36;
    const minBottom = normalTop + 5;
    const maxBottom = duckedTop - 5;
    const bottom = randRange(minBottom, maxBottom);
    const h = randRange(18, 40);
    const y = bottom - h;
    const w = randRange(18, 28);
    obstacles.push({ x: spawnX, y, w, h, type });
  }

  spawnCooldown = randRange(1600, 3200) - Math.floor(speed * 160);
  spawnCooldown = Math.max(1100, spawnCooldown);
}

/* Ütközés (AABB) — barátságos hitbox */
function collides(a,b){
  const marginX = 8;
  const marginY = 8;
  return !(a.x + a.width - marginX < b.x || a.x + marginX > b.x + b.w || a.y + a.height - marginY < b.y || a.y + marginY > b.y + b.h);
}

/* Rajzoló függvények */
function drawGround(){
  const h = 6;
  const y = groundY();
  const w = canvas.getBoundingClientRect().width;
  ctx.fillStyle = '#dfeff0';
  ctx.fillRect(0, y, w, h);
  ctx.fillStyle = '#cfe6e6';
  for(let i=0;i<w;i+=36){
    ctx.fillRect(i, y-2, 18, 2);
  }
}

function drawPlayer(){
  const px = player.x;
  const py = player.y;
  ctx.save();
  // árnyék
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(px+player.width/2, groundY()+6, player.width*0.6, 8, 0, 0, Math.PI*2);
  ctx.fill();

  // test
  ctx.fillStyle = player.color;
  const bodyY = py + (player.ducking ? 12 : 0);
  const bodyH = player.height - (player.ducking ? 12 : 0);
  roundRect(ctx, px, bodyY, player.width, bodyH, 6, true, false);

  // fej
  ctx.fillStyle = '#fff3e6';
  ctx.beginPath();
  ctx.ellipse(px + player.width*0.75, py + 12, player.ducking ? 8 : 12, player.ducking ? 8 : 12, 0, 0, Math.PI*2);
  ctx.fill();

  // kalap
  ctx.fillStyle = '#2d2d2d';
  ctx.fillRect(px + player.width*0.6, py + (player.ducking ? 2 : -2), player.ducking ? 18 : 26, 6);
  ctx.restore();
}

function drawObstacles(){
  obstacles.forEach(o=>{
    ctx.save();
    ctx.fillStyle = '#2d2d2d';
    roundRect(ctx, o.x, o.y, o.w, o.h, 4, true, false);
    // kis dísz
    ctx.fillStyle = '#444';
    ctx.fillRect(o.x + o.w - 6, o.y - 6, 6, 6);
    // jelzés a magas akadálynál (kis csík), hogy könnyebb észrevenni
    if (o.type === 'high' || o.h > 50){
      ctx.fillStyle = '#FFD166';
      ctx.fillRect(o.x + 6, o.y + 6, Math.min(20, o.w-12), 6);
    }
    ctx.restore();
  });
}

/* segédfüggvény: lekerekített téglalap */
function roundRect(ctx, x, y, w, h, r, fill, stroke){
  if (typeof r === 'undefined') r = 5;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

/* Háttérelemek frissítése és rajzolása */
function updateAndDrawBackground(dt){
  const w = canvas.getBoundingClientRect().width;
  const h = canvas.getBoundingClientRect().height;

  // madarak
  birds.forEach(b=>{
    b.x -= b.speed * (0.6 + speed*0.6) * (dt/16);
    b.phase += 0.02 * (dt/16);
    if (b.x < -80) b.x = w + randRange(20,200);
    const by = b.y + Math.sin(b.phase) * 8;
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(b.x, by, 12, 6, 0, 0, Math.PI*2);
    ctx.ellipse(b.x+12, by+4, 8, 4, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  });

  // lufik
  balloons.forEach((bl)=>{
    bl.y -= bl.speed * (0.4 + speed*0.2) * (dt/16);
    bl.x += Math.sin((performance.now()*0.001 + bl.sway)) * 0.2;
    if (bl.y < -40) {
      bl.y = h + randRange(40,120);
      bl.x = randRange(40, w-40);
    }
    ctx.save();
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.ellipse(bl.x, bl.y, 12, 16, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.beginPath();
    ctx.moveTo(bl.x, bl.y+16);
    ctx.lineTo(bl.x, bl.y+28);
    ctx.stroke();
    ctx.restore();
  });

  // konfetti (lassú, csak vizuális zaj)
  confetti.forEach(c=>{
    c.x += c.vx * (dt/16);
    c.y += c.vy * (dt/16);
    if (c.x < -20) c.x = w + 20;
    if (c.x > w + 20) c.x = -20;
    if (c.y > h + 20) c.y = -40;
    ctx.save();
    ctx.fillStyle = c.color;
    ctx.fillRect(c.x, c.y, 4, 6);
    ctx.restore();
  });
}

/* Fő ciklus */
function loop(ts){
  if (!running) return;
  const dt = Math.min(40, ts - lastTime);
  lastTime = ts;

  // sebesség lassan növekszik
  speed += 0.00016 * dt;
  spawnTimer += dt;

  // pontszám növelése
  score += 0.006 * dt * speed;
  scoreEl.innerText = Math.floor(score);
  speedEl.innerText = speed.toFixed(2);

  // spawn logika
  if (spawnTimer > spawnCooldown) {
    spawnObstacle();
    spawnTimer = 0;
  }

  // mozgás
  player.vy += player.gravity * (dt/16);
  player.y += player.vy * (dt/16);

  // talajra érkezés
  const gY = groundY() - player.height;
  if (player.y >= gY){
    player.y = gY;
    player.vy = 0;
    player.grounded = true;
  } else {
    player.grounded = false;
  }

  // akadályok mozgatása és ütközésellenőrzés
  const move = 2.2 * speed * (dt/16);
  for (let i = obstacles.length - 1; i >= 0; i--){
    obstacles[i].x -= move;
    if (obstacles[i].x + obstacles[i].w < -80) obstacles.splice(i,1);
  }

  // ütközés ellenőrzés
  const pBox = { x: player.x, y: player.y, width: player.width, height: player.height };
  for (let o of obstacles){
    const oBox = { x: o.x, y: o.y, w: o.w, h: o.h };
    if (collides(pBox, oBox)){
      endGame();
      break;
    }
  }

  // rajzolás
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawBackground();
  updateAndDrawBackground(dt);
  drawGround();
  drawPlayer();
  drawObstacles();

  if (!gameOver) requestAnimationFrame(loop);
}

/* egyszerű háttér (alap) */
function drawBackground(){
  const w = canvas.getBoundingClientRect().width;
  const h = canvas.getBoundingClientRect().height;
  ctx.fillStyle = '#cfeef0';
  ctx.fillRect(0,0,w,h);
  // távoli dombok
  ctx.fillStyle = '#d6f0ef';
  ctx.beginPath();
  ctx.ellipse(w*0.18, h*0.9, 220, 60, 0, 0, Math.PI*2);
  ctx.ellipse(w*0.62, h*0.9, 260, 70, 0, 0, Math.PI*2);
  ctx.fill();
}

/* Játék vége */
function endGame(){
  running = false;
  gameOver = true;
  finalScore.innerText = 'Elért pont: ' + Math.floor(score);
  overlay.classList.remove('hidden');
}

/* Indításkor beállítások */
resizeCanvas();
resetGame();
initBackground();

/* Érintés gesztus: felfelé húzás = ugrás, rövid érintés = ugrás */
let touchStartY = null;
canvas.addEventListener('touchstart', (e)=>{
  if (e.touches.length === 1){
    touchStartY = e.touches[0].clientY;
  }
});
canvas.addEventListener('touchend', (e)=>{
  if (touchStartY === null) return;
  const endY = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : touchStartY;
  const diff = touchStartY - endY;
  if (diff > 30) jump();
  else jump();
  touchStartY = null;
});