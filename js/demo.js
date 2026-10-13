// Demos en vivo: la CPU juega sola cada juego en el home. Liviano y se pausa fuera de pantalla.
let demoLive = true;
const promoEl = document.querySelector('.promo');
if (promoEl && 'IntersectionObserver' in window)
  new IntersectionObserver(e => demoLive = e[0].isIntersecting).observe(promoEl);

/* --- TETRIS demo --- */
(() => {
  const cvs = document.getElementById('demo-tetris');
  if (!cvs) return;
  const ctx = cvs.getContext('2d'), COLS = 6, ROWS = 10, B = 20;
  const TS = [
    { m: [[1, 1, 1, 1]], c: '#4A7DFF' }, { m: [[1, 1], [1, 1]], c: '#E8A100' },
    { m: [[0, 1, 0], [1, 1, 1]], c: '#B678FF' }, { m: [[0, 1, 1], [1, 1, 0]], c: '#3FA46A' },
    { m: [[1, 1, 0], [0, 1, 1]], c: '#FF6B81' },
  ];
  let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null)), cur = null, last = 0;
  const hit = (dx, dy, m) => m.some((r, y) => r.some((v, x) => {
    if (!v) return false;
    const nx = cur.x + x + dx, ny = cur.y + y + dy;
    return nx < 0 || nx >= COLS || ny >= ROWS || (ny >= 0 && grid[ny][nx]);
  }));
  function spawn() {
    const p = TS[Math.random() * TS.length | 0];
    cur = { m: p.m.map(r => [...r]), c: p.c, x: 2, y: 0 };
    if (Math.random() > .5) cur.x = Math.max(0, Math.min(COLS - cur.m[0].length, cur.x + (Math.random() * 3 | 0) - 1));
    if (hit(0, 0, cur.m)) grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }
  function draw() {
    ctx.fillStyle = '#3A3340'; ctx.fillRect(0, 0, cvs.width, cvs.height);
    grid.forEach((r, y) => r.forEach((c, x) => {
      if (!c) return;
      ctx.fillStyle = c; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(x * B + 1, y * B + 1, B - 2, B - 2, 4); ctx.fill(); ctx.stroke();
    }));
    if (cur) cur.m.forEach((r, y) => r.forEach((v, x) => {
      if (!v || cur.y + y < 0) return;
      ctx.fillStyle = cur.c; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect((cur.x + x) * B + 1, (cur.y + y) * B + 1, B - 2, B - 2, 4); ctx.fill(); ctx.stroke();
    }));
  }
  spawn(); draw();
  (function loop(t) {
    requestAnimationFrame(loop);
    if (!demoLive || !cur) return;
    if (t - last > 280) {
      last = t;
      if (!hit(0, 1, cur.m)) cur.y++;
      else {
        cur.m.forEach((r, y) => r.forEach((v, x) => { if (v && cur.y + y >= 0) grid[cur.y + y][cur.x + x] = cur.c; }));
        grid = grid.filter(r => !r.every(Boolean));
        while (grid.length < ROWS) grid.unshift(Array(COLS).fill(null));
        spawn();
      }
      draw();
    }
  })(0);
})();

/* --- SNAKE demo con IA --- */
(() => {
  const cvs = document.getElementById('demo-snake');
  if (!cvs) return;
  const ctx = cvs.getContext('2d'), N = 12, C = 12;
  let snake, dir, food;
  const reset = () => {
    snake = [{ x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }];
    dir = { x: 1, y: 0 }; drop();
  };
  const drop = () => {
    do { food = { x: Math.random() * N | 0, y: Math.random() * N | 0 }; }
    while (snake.some(s => s.x === food.x && s.y === food.y));
  };
  const safe = p => p.x >= 0 && p.y >= 0 && p.x < N && p.y < N &&
    !snake.slice(0, -1).some(s => s.x === p.x && s.y === p.y);
  function brain() {
    const opts = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]
      .filter(d => !(d.x === -dir.x && d.y === -dir.y))
      .map(d => ({ d, p: { x: snake[0].x + d.x, y: snake[0].y + d.y } }))
      .filter(o => safe(o.p));
    if (!opts.length) return reset();
    opts.sort((a, b) => (Math.abs(a.p.x - food.x) + Math.abs(a.p.y - food.y)) - (Math.abs(b.p.x - food.x) + Math.abs(b.p.y - food.y)));
    dir = opts[0].d;
  }
  function draw() {
    ctx.fillStyle = '#3A3340'; ctx.fillRect(0, 0, cvs.width, cvs.height);
    ctx.fillStyle = '#FF6B81';
    ctx.beginPath(); ctx.roundRect(food.x * C + 2, food.y * C + 2, C - 4, C - 4, 4); ctx.fill();
    snake.forEach((s, i) => {
      ctx.fillStyle = i ? '#3FA46A' : '#2E7D4F';
      ctx.beginPath(); ctx.roundRect(s.x * C + 1, s.y * C + 1, C - 2, C - 2, 4); ctx.fill();
    });
  }
  reset(); draw();
  let last = 0;
  (function loop(t) {
    requestAnimationFrame(loop);
    if (!demoLive || t - last < 150) return;
    last = t; brain();
    const h = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (!safe(h)) return reset();
    snake.unshift(h);
    if (h.x === food.x && h.y === food.y) { if (snake.length > 40) return reset(); drop(); }
    else snake.pop();
    draw();
  })(0);
})();

/* --- GATO demo: CPU vs CPU --- */
(() => {
  const box = document.getElementById('demo-gato');
  if (!box) return;
  const WINS = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  let cells = Array(9).fill(''), turn = 'X', pause = 0;
  box.innerHTML = Array.from({ length: 9 }, () => '<span></span>').join('');
  const els = [...box.children];
  setInterval(() => {
    if (!demoLive) return;
    if (pause > 0) { pause--; if (!pause) { cells = Array(9).fill(''); turn = 'X'; paint(); } return; }
    const free = cells.map((v, i) => v ? null : i).filter(v => v !== null);
    if (!free.length) { pause = 2; return; }
    const i = free[Math.random() * free.length | 0];
    cells[i] = turn; paint();
    const w = WINS.find(([a, b, c]) => cells[a] && cells[a] === cells[b] && cells[a] === cells[c]);
    if (w) { w.forEach(k => els[k].style.background = '#FFD97D'); pause = 3; }
    else if (!cells.includes('')) pause = 2;
    else turn = turn === 'X' ? 'O' : 'X';
  }, 600);
  function paint() {
    els.forEach((s, i) => {
      s.textContent = cells[i];
      s.style.color = cells[i] === 'X' ? '#4A7DFF' : '#FF6B81';
      s.style.background = '#fff';
    });
  }
})();

/* --- PONG demo: rally infinito IA vs IA --- */
(() => {
  const cvs = document.getElementById('demo-pong');
  if (!cvs) return;
  const ctx = cvs.getContext('2d'), W = 180, H = 110, PH = 26;
  let p1 = H / 2, p2 = H / 2, b = serve(1);
  function serve(d) { return { x: W / 2, y: H / 2, vx: 2 * d, vy: Math.random() * 2 - 1 }; }
  (function loop() {
    requestAnimationFrame(loop);
    if (!demoLive) return;
    p1 += Math.max(-2.4, Math.min(2.4, (b.y - p1) * .12));
    p2 += Math.max(-2.2, Math.min(2.2, (b.y - p2) * .1));
    b.x += b.vx; b.y += b.vy;
    if (b.y < 4 || b.y > H - 4) b.vy *= -1;
    if (b.vx < 0 && b.x < 12 && Math.abs(b.y - p1) < PH / 2 + 4) { b.vx *= -1.05; b.vy += (Math.random() - .5); }
    if (b.vx > 0 && b.x > W - 12 && Math.abs(b.y - p2) < PH / 2 + 4) { b.vx *= -1.05; b.vy += (Math.random() - .5); }
    if (b.x < -6) b = serve(1); if (b.x > W + 6) b = serve(-1);
    ctx.fillStyle = '#3A3340'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#fff'; ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(W / 2, 4); ctx.lineTo(W / 2, H - 4); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#FFD97D';
    ctx.beginPath(); ctx.roundRect(4, p1 - PH / 2, 6, PH, 3); ctx.fill();
    ctx.beginPath(); ctx.roundRect(W - 10, p2 - PH / 2, 6, PH, 3); ctx.fill();
    ctx.fillStyle = '#FF9AA2';
    ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, 7); ctx.fill();
  })();
})();

/* --- SOLITARIO demo: fundaciones que se llenan A → K --- */
(() => {
  const box = document.getElementById('demo-sol');
  if (!box) return;
  const R = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const S = ['♥', '♦', '♣', '♠'];
  let k = 0;
  setInterval(() => {
    if (!demoLive) return;
    box.innerHTML = S.map(s => `<span class="${s === '♥' || s === '♦' ? 'red' : ''}">${R[k]}<small>${s}</small></span>`).join('');
    k = (k + 1) % 13;
  }, 700);
})();
