const board = document.getElementById('board');
const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
let cells, turn, mode = '2', lock = false;
let sx = 0, so = 0, sd = 0;
const $ = id => document.getElementById(id);

function build() {
  board.innerHTML = ''; cells = Array(9).fill('');
  for (let i = 0; i < 9; i++) {
    const b = document.createElement('button');
    b.className = 'cell'; b.onclick = () => play(i);
    board.appendChild(b);
  }
  turn = 'X'; lock = false; $('turn').textContent = 'Turno: X';
}
function play(i) {
  if (cells[i] || lock || winner()[0]) return;
  cells[i] = turn; render();
  let [w, combo] = winner();
  if (w) return endRound(w, combo);
  if (cells.every(Boolean)) return endRound('D');
  turn = turn === 'X' ? 'O' : 'X'; $('turn').textContent = 'Turno: ' + turn;
  if (mode === '1' && turn === 'O') { lock = true; setTimeout(cpu, 450); }
}
function cpu() {
  const empty = cells.map((v, i) => v ? null : i).filter(v => v !== null);
  // ganar > bloquear > centro > aleatorio
  const tryLine = p => {
    for (const [a, b, c] of WINS) {
      const l = [cells[a], cells[b], cells[c]];
      if (l.filter(v => v === p).length === 2 && l.includes('')) return [a, b, c][l.indexOf('')];
    }
    return null;
  };
  let m = tryLine('O') ?? tryLine('X') ?? (cells[4] === '' ? 4 : null) ?? empty[Math.random() * empty.length | 0];
  cells[m] = 'O'; render();
  let [w, combo] = winner();
  if (w) return endRound(w, combo);
  if (cells.every(Boolean)) return endRound('D');
  turn = 'X'; lock = false; $('turn').textContent = 'Turno: X';
}
function winner() {
  for (const combo of WINS) {
    const [a, b, c] = combo;
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) return [cells[a], combo];
  }
  return [null, null];
}
function render() {
  [...board.children].forEach((b, i) => {
    b.textContent = cells[i];
    b.style.color = cells[i] === 'X' ? '#4A7DFF' : '#FF6B81';
  });
}
function endRound(w, combo) {
  if (combo) combo.forEach(i => board.children[i].classList.add('win'));
  if (w === 'X') sx++; else if (w === 'O') so++; else sd++;
  $('sx').textContent = sx; $('so').textContent = so; $('sd').textContent = sd;
  $('turn').textContent = w === 'D' ? '¡Empate!' : '¡Gana ' + w + '!';
  if (w !== 'D') { if (mode === '1') w === 'X' ? window.fiesta?.ganar() : window.fiesta?.perder(); else window.fiesta?.ganar(); }
  lock = true; setTimeout(build, 1600);
}
$('m2').onclick = () => { mode = '2'; build(); $('m2').classList.remove('ghost'); $('m1').classList.add('ghost'); };
$('m1').onclick = () => { mode = '1'; build(); $('m1').classList.remove('ghost'); $('m2').classList.add('ghost'); };
$('btnClear').onclick = build;
build();
