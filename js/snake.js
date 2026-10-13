const cvs = document.getElementById('game'), ctx = cvs.getContext('2d');
const N = 20, C = 20;
let snake, dir, nextDir, food, score, best = +(localStorage.getItem('snakeBest') || 0), timer, alive, paused;
const $ = id => document.getElementById(id);
$('best').textContent = best;

function reset() {
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  dir = nextDir = { x: 1, y: 0 }; score = 0; alive = true; paused = false;
  $('score').textContent = 0; placeFood(); clearInterval(timer);
  timer = setInterval(tick, 140);
}
function placeFood() {
  do { food = { x: Math.random() * N | 0, y: Math.random() * N | 0 }; }
  while (snake.some(s => s.x === food.x && s.y === food.y));
}
function tick() {
  if (!alive || paused) return;
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  if (head.x < 0 || head.y < 0 || head.x >= N || head.y >= N || snake.some(s => s.x === head.x && s.y === head.y)) {
    alive = false; clearInterval(timer);
    const record = score > 0 && score >= best;
    best = Math.max(best, score); localStorage.setItem('snakeBest', best); $('best').textContent = best;
    draw(); record ? window.fiesta?.ganar() : window.fiesta?.perder(); return;
  }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10; $('score').textContent = score; placeFood();
    clearInterval(timer); timer = setInterval(tick, Math.max(60, 140 - score / 4));
  } else snake.pop();
  draw();
}
function draw() {
  ctx.fillStyle = '#3A3340'; ctx.fillRect(0, 0, 400, 400);
  ctx.fillStyle = '#FF6B81'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(food.x * C + 2, food.y * C + 2, C - 4, C - 4, 6); ctx.fill(); ctx.stroke();
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? '#2E7D4F' : '#3FA46A';
    ctx.strokeStyle = '#fff';
    ctx.beginPath(); ctx.roundRect(s.x * C + 1, s.y * C + 1, C - 2, C - 2, i === 0 ? 8 : 5); ctx.fill(); ctx.stroke();
  });
  if (!alive) { ctx.fillStyle = '#fff'; ctx.font = '700 26px Fredoka,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('¡Mordida! Reinicia', 200, 210); }
}
function setDir(x, y) { if (dir.x === -x && dir.y === -y) return; nextDir = { x, y }; }
document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k === 'arrowup' || k === 'w') setDir(0, -1);
  else if (k === 'arrowdown' || k === 's') setDir(0, 1);
  else if (k === 'arrowleft' || k === 'a') setDir(-1, 0);
  else if (k === 'arrowright' || k === 'd') setDir(1, 0);
  if (k.startsWith('arrow')) e.preventDefault();
});
let tx, ty;
cvs.addEventListener('touchstart', e => { const t = e.touches[0]; tx = t.clientX; ty = t.clientY; }, { passive: true });
cvs.addEventListener('touchmove', e => {
  const t = e.touches[0], dx = t.clientX - tx, dy = t.clientY - ty;
  if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
  setDir(Math.abs(dx) > Math.abs(dy) ? Math.sign(dx) : 0, Math.abs(dx) > Math.abs(dy) ? 0 : Math.sign(dy));
  tx = t.clientX; ty = t.clientY; e.preventDefault();
}, { passive: false });
$('btnStart').onclick = reset;
$('btnPause').onclick = () => { paused = !paused; $('btnPause').textContent = paused ? 'Seguir' : 'Pausa'; };
reset();
