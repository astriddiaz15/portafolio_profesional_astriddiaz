const cvs = document.getElementById('game'), ctx = cvs.getContext('2d');
const W = 600, H = 400, PW = 12, PH = 80;
let p1, p2, ball, s1, s2, mode = 1, paused, over, audio;
const $ = id => document.getElementById(id);
const beep = f => {
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.value = f; o.connect(g); g.connect(audio.destination);
    o.start(); g.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .12); o.stop(audio.currentTime + .12);
  } catch {}
};
function reset() {
  p1 = { y: H / 2 - PH / 2, vy: 0 }; p2 = { y: H / 2 - PH / 2, vy: 0 };
  s1 = 0; s2 = 0; over = false; paused = false; serve(Math.random() > .5 ? 1 : -1); hud();
}
function serve(dir) {
  ball = { x: W / 2, y: H / 2, vx: 4 * dir, vy: (Math.random() * 4 - 2) };
}
function hud() { $('s1').textContent = s1; $('s2').textContent = s2; }
const keys = {};
document.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; if (e.key.startsWith('Arrow')) e.preventDefault(); });
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
cvs.addEventListener('mousemove', e => {
  const r = cvs.getBoundingClientRect();
  p1.y = (e.clientY - r.top) * (H / r.height) - PH / 2;
});
function step() {
  if (paused || over) return;
  if (keys['w']) p1.y -= 6; if (keys['s']) p1.y += 6;
  if (mode === 2) { if (keys['arrowup']) p2.y -= 6; if (keys['arrowdown']) p2.y += 6; }
  else p2.y += Math.max(-5, Math.min(5, (ball.y - (p2.y + PH / 2)) * .08)); // IA
  p1.y = Math.max(0, Math.min(H - PH, p1.y)); p2.y = Math.max(0, Math.min(H - PH, p2.y));
  ball.x += ball.vx; ball.y += ball.vy;
  if (ball.y < 8 || ball.y > H - 8) { ball.vy *= -1; beep(300); }
  const hit = (p, x) => ball.y > p.y - 6 && ball.y < p.y + PH + 6 && Math.abs(ball.x - x) < 12;
  if (ball.vx < 0 && hit(p1, 20)) { ball.vx *= -1.06; ball.vy += (ball.y - (p1.y + PH / 2)) * .03; beep(500); }
  if (ball.vx > 0 && hit(p2, W - 20)) { ball.vx *= -1.06; ball.vy += (ball.y - (p2.y + PH / 2)) * .03; beep(500); }
  if (ball.x < 0) { s2++; point(); } if (ball.x > W) { s1++; point(); }
}
function point() {
  beep(200); hud();
  if (s1 >= 5 || s2 >= 5) { over = true; $('msg').textContent = s1 >= 5 ? '¡Gana Jugador 1!' : (mode === 2 ? '¡Gana Jugador 2!' : '¡Gana la CPU!'); if (mode === 1) s1 >= 5 ? window.fiesta?.ganar() : window.fiesta?.perder(); else window.fiesta?.ganar(); return; }
  serve(ball.x < W / 2 ? 1 : -1);
}
function draw() {
  ctx.fillStyle = '#3A3340'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.setLineDash([10, 10]);
  ctx.beginPath(); ctx.moveTo(W / 2, 10); ctx.lineTo(W / 2, H - 10); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#FFD97D';
  [[14, p1.y], [W - 26, p2.y]].forEach(([x, y]) => { ctx.beginPath(); ctx.roundRect(x, y, PW, PH, 7); ctx.fill(); });
  ctx.fillStyle = '#FF9AA2'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(ball.x, ball.y, 10, 0, 7); ctx.fill(); ctx.stroke();
}
function frame() { step(); draw(); requestAnimationFrame(frame); }
$('m1').onclick = () => { mode = 1; reset(); $('m1').classList.remove('ghost'); $('m2').classList.add('ghost'); };
$('m2').onclick = () => { mode = 2; reset(); $('m2').classList.remove('ghost'); $('m1').classList.add('ghost'); };
$('btnStart').onclick = reset;
$('btnPause').onclick = () => { paused = !paused; $('btnPause').textContent = paused ? 'Seguir' : 'Pausa'; };
reset(); frame();
