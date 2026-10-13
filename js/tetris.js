const cvs = document.getElementById('game'), ctx = cvs.getContext('2d');
const COLS = 10, ROWS = 20, B = 30;
const SHAPES = {
  I: { m: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], c: '#4A7DFF' },
  O: { m: [[1,1],[1,1]], c: '#FFD97D' },
  T: { m: [[0,1,0],[1,1,1],[0,0,0]], c: '#B678FF' },
  S: { m: [[0,1,1],[1,1,0],[0,0,0]], c: '#3FA46A' },
  Z: { m: [[1,1,0],[0,1,1],[0,0,0]], c: '#FF6B81' },
  J: { m: [[1,0,0],[1,1,1],[0,0,0]], c: '#FF9AA2' },
  L: { m: [[0,0,1],[1,1,1],[0,0,0]], c: '#E8A100' },
};
let grid, cur, score, lines, level, dropMs, last, paused, over;
const $ = id => document.getElementById(id);

function reset() {
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  score = 0; lines = 0; level = 1; paused = false; over = false;
  dropMs = 800; last = performance.now(); $('msg').textContent = '';
  spawn(); updateHUD(); requestAnimationFrame(loop);
}
function spawn() {
  const keys = Object.keys(SHAPES);
  const k = keys[Math.random() * keys.length | 0];
  cur = { m: SHAPES[k].m.map(r => [...r]), c: SHAPES[k].c, x: 3, y: 0 };
  if (collide(0, 0, cur.m)) { over = true; $('msg').textContent = '¡Fin del juego! Pulsa Reiniciar.'; window.fiesta?.perder(); }
}
function collide(dx, dy, m) {
  for (let y = 0; y < m.length; y++) for (let x = 0; x < m[y].length; x++) {
    if (!m[y][x]) continue;
    const nx = cur.x + x + dx, ny = cur.y + y + dy;
    if (nx < 0 || nx >= COLS || ny >= ROWS || (ny >= 0 && grid[ny][nx])) return true;
  }
  return false;
}
function rotate(m) { return m[0].map((_, i) => m.map(r => r[i]).reverse()); }
function merge() {
  cur.m.forEach((r, y) => r.forEach((v, x) => {
    if (v && cur.y + y >= 0) grid[cur.y + y][cur.x + x] = cur.c;
  }));
}
function clearLines() {
  let n = 0;
  grid = grid.filter(row => { if (row.every(Boolean)) { n++; return false; } return true; });
  while (grid.length < ROWS) grid.unshift(Array(COLS).fill(null));
  if (n) { lines += n; score += [0, 100, 300, 500, 800][n] * level; const prev = level; level = 1 + Math.floor(lines / 10); dropMs = Math.max(100, 800 - (level - 1) * 70); if (level > prev) window.fiesta?.ganar(); }
}
function step() { if (!collide(0, 1, cur.m)) cur.y++; else { merge(); clearLines(); spawn(); } updateHUD(); }
function loop(t) {
  if (over || paused) return;
  if (t - last > dropMs) { step(); last = t; }
  draw(); requestAnimationFrame(loop);
}
function draw() {
  ctx.fillStyle = '#3A3340'; ctx.fillRect(0, 0, cvs.width, cvs.height);
  const drawBlock = (x, y, c) => {
    ctx.fillStyle = c; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(x * B + 2, y * B + 2, B - 4, B - 4, 7); ctx.fill(); ctx.stroke();
  };
  grid.forEach((r, y) => r.forEach((c, x) => c && drawBlock(x, y, c)));
  cur.m.forEach((r, y) => r.forEach((v, x) => v && (cur.y + y) >= 0 && drawBlock(cur.x + x, cur.y + y, cur.c)));
}
function updateHUD() { $('score').textContent = score; $('lines').textContent = lines; $('level').textContent = level; }
document.addEventListener('keydown', e => {
  if (over || paused || !cur) return;
  if (e.key === 'ArrowLeft' && !collide(-1, 0, cur.m)) cur.x--;
  else if (e.key === 'ArrowRight' && !collide(1, 0, cur.m)) cur.x++;
  else if (e.key === 'ArrowDown') step();
  else if (e.key === 'ArrowUp' || e.key === 'z' || e.key === 'Z' || e.key === 'x' || e.key === 'X') {
    const r = rotate(cur.m); if (!collide(0, 0, r)) cur.m = r;
  }
  else if (e.key === ' ') { while (!collide(0, 1, cur.m)) cur.y++; step(); e.preventDefault(); return; }
  draw();
});
$('btnPause').onclick = () => { if (over) return; paused = !paused; $('btnPause').textContent = paused ? 'Seguir' : 'Pausa'; if (!paused) { last = performance.now(); requestAnimationFrame(loop); } };
$('btnRestart').onclick = reset;
reset();
