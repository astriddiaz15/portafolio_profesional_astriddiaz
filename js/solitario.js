// Solitario Klondike: tocar para seleccionar y mover. Sin librerías.
const SUITS = ['♥', '♦', '♣', '♠'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const red = s => s === '♥' || s === '♦';
let stock, waste, found, tabs, sel, moves, secs, timer, won;
const $ = id => document.getElementById(id);

function newGame() {
  const deck = [];
  SUITS.forEach(s => RANKS.forEach((r, i) => deck.push({ s, r: i + 1, up: false })));
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [deck[i], deck[j]] = [deck[j], deck[i]]; }
  tabs = Array.from({ length: 7 }, (_, c) => {
    const col = deck.splice(0, c + 1);
    col.forEach((card, k) => card.up = k === col.length - 1);
    return col;
  });
  stock = deck.map(c => ({ ...c, up: false })); waste = []; found = [[], [], [], []];
  sel = null; moves = 0; secs = 0; won = false;
  clearInterval(timer); timer = setInterval(() => { if (!won) { secs++; tick(); } }, 1000);
  $('msg').textContent = 'Solo el Rey (K) puede abrir columna vacía.';
  render();
}
function tick() { $('time').textContent = `${secs / 60 | 0}:${String(secs % 60).padStart(2, '0')}`; $('moves').textContent = moves; }
const top = a => a[a.length - 1];
function validSeq(cards) {
  for (let i = 0; i < cards.length - 1; i++)
    if (!cards[i].up || cards[i].r !== cards[i + 1].r + 1 || red(cards[i].s) === red(cards[i + 1].s)) return false;
  return cards[0].up;
}
function canTab(cards, col) {
  const t = top(tabs[col]);
  if (!t) return cards[0].r === 13;
  return t.up && t.r === cards[0].r + 1 && red(t.s) !== red(cards[0].s);
}
function canFound(card, f) {
  const t = top(found[f]);
  if (!t) return card.r === 1;
  return t.s === card.s && card.r === t.r + 1;
}
function takeSel() {
  if (!sel) return null;
  if (sel.type === 'waste') return [waste.pop()];
  if (sel.type === 'found') return [found[sel.f].pop()];
  return tabs[sel.col].splice(sel.idx);
}
function giveBack(cards) {
  if (sel.type === 'waste') waste.push(...cards);
  else if (sel.type === 'found') found[sel.f].push(...cards);
  else tabs[sel.col].splice(sel.idx, 0, ...cards);
}
function flip(col) { const t = top(tabs[col]); if (t && !t.up) t.up = true; }
function afterMove() { moves++; sel = null; tick(); checkWin(); render(); }
function checkWin() {
  if (found.flat().length === 52) { won = true; clearInterval(timer); $('msg').textContent = `¡Ganaste en ${moves} movimientos y ${$('time').textContent}! 🎉`; window.fiesta?.ganar(); }
}
// --- interacciones ---
function clickStock() {
  if (won) return;
  if (!stock.length && !waste.length) return;
  if (!stock.length) { stock = waste.reverse().map(c => ({ ...c, up: false })); waste = []; }
  else waste.push({ ...stock.pop(), up: true });
  moves++; sel = null; tick(); render();
}
function clickWaste() {
  if (!waste.length) return;
  const c = top(waste);
  if (sel?.type === 'waste') sel = null;
  else sel = { type: 'waste' };
  render();
}
function clickFound(f) {
  if (!sel) { if (found[f].length) sel = { type: 'found', f }; render(); return; }
  const cards = takeSel();
  if (cards.length === 1 && canFound(cards[0], f)) { found[f].push(cards[0]); flip(selCol()); afterMove(); }
  else { giveBack(cards); sel = (sel.type === 'found' && sel.f === f) ? null : { type: 'found', f }; render(); }
}
function selCol() { return sel?.type === 'tab' ? sel.col : -1; }
function clickTab(col, idx) {
  if (idx === undefined) { // zona vacía de la columna
    if (sel) {
      const cards = takeSel();
      if (canTab(cards, col)) { tabs[col].push(...cards); if (selCol() >= 0 || sel?.type !== 'tab') flipPrev(); afterMove(); }
      else { giveBack(cards); sel = null; render(); }
    }
    return;
  }
  const card = tabs[col][idx];
  if (!card.up) return;
  if (!sel) { // seleccionar secuencia válida
    const seq = tabs[col].slice(idx);
    if (validSeq(seq)) sel = { type: 'tab', col, idx };
    render(); return;
  }
  if (sel.type === 'tab' && sel.col === col && sel.idx === idx) { sel = null; render(); return; }
  const keep = sel, keepCol = selCol();
  const cards = takeSel();
  if (canTab(cards, col)) { tabs[col].push(...cards); if (keep.type === 'tab') flip(keep.col); afterMove(); }
  else { giveBack(cards); sel = null; render(); }
}
function flipPrev() { for (let c = 0; c < 7; c++) flip(c); }
function autoFound() { // mueve lo posible a fundaciones
  let moved = true;
  while (moved) {
    moved = false;
    const tryCard = (card, back) => {
      for (let f = 0; f < 4; f++) if (canFound(card, f)) { back(); found[f].push(card); moved = true; moves++; return true; }
      return false;
    };
    if (waste.length && tryCard(top(waste), () => waste.pop())) continue;
    for (let c = 0; c < 7 && !moved; c++) {
      const t = top(tabs[c]);
      if (t?.up && tabs[c].length && validSeq([t]) && tryCard(t, () => tabs[c].pop())) { flip(c); }
    }
  }
  sel = null; tick(); checkWin(); render();
}
// --- render ---
function cardEl(c, i, col) {
  const d = document.createElement('div');
  if (!c.up) { d.className = 'ncard back'; d.innerHTML = '♠'; return d; }
  d.className = 'ncard ' + (red(c.s) ? 'red' : 'black');
  if (sel?.type === 'tab' && sel.col === col && i >= sel.idx) d.classList.add('sel');
  d.innerHTML = `${RANKS[c.r - 1]}<small>${c.s}</small>`;
  d.dataset.col = col; d.dataset.idx = i;
  d.ondblclick = e => { e.stopPropagation(); toFound(c, col, i); };
  return d;
}
function toFound(c, col, i) {
  const isTopWaste = c === top(waste);
  const isTopTab = col !== undefined && i === tabs[col].length - 1;
  for (let f = 0; f < 4; f++) if (canFound(c, f)) {
    if (isTopWaste) waste.pop();
    else if (isTopTab) tabs[col].pop();
    else return;
    found[f].push({ ...c, up: true });
    if (col !== undefined) flip(col);
    moves++; sel = null; tick(); checkWin(); render(); return;
  }
}
function render() {
  tick();
  const st = $('stock'); st.innerHTML = '';
  if (stock.length) { const b = document.createElement('div'); b.className = 'ncard back'; b.innerHTML = '♠'; st.appendChild(b); }
  else st.innerHTML = '<span style="font-size:.7rem;color:var(--gris);font-weight:800">↻</span>';
  st.onclick = clickStock;
  const w = $('waste'); w.innerHTML = '';
  if (waste.length) {
    const c = top(waste), d = document.createElement('div');
    d.className = 'ncard ' + (red(c.s) ? 'red' : 'black') + (sel?.type === 'waste' ? ' sel' : '');
    d.innerHTML = `${RANKS[c.r - 1]}<small>${c.s}</small>`;
    d.ondblclick = e => { e.stopPropagation(); toFound(c); };
    w.appendChild(d);
  }
  w.onclick = clickWaste;
  document.querySelectorAll('.sol-pile.found').forEach(el => {
    const f = +el.dataset.found; el.innerHTML = '';
    const t = top(found[f]);
    if (t) {
      const d = document.createElement('div');
      d.className = 'ncard ' + (red(t.s) ? 'red' : 'black') + (sel?.type === 'found' && sel.f === f ? ' sel' : '');
      d.innerHTML = `${RANKS[t.r - 1]}<small>${t.s}</small>`;
      el.appendChild(d);
    } else el.innerHTML = '<span style="font-size:1.4rem;opacity:.35">A</span>';
    el.onclick = () => clickFound(f);
  });
  const tabsEl = $('tabs'); tabsEl.innerHTML = '';
  tabs.forEach((colArr, col) => {
    const c = document.createElement('div');
    c.className = 'sol-col'; c.onclick = e => { if (e.target === c) clickTab(col); };
    if (!colArr.length) c.innerHTML = '<span style="font-size:1.4rem;opacity:.35">K</span>';
    colArr.forEach((card, i) => {
      const el = cardEl(card, i, col);
      el.onclick = e => { e.stopPropagation(); clickTab(col, i); };
      c.appendChild(el);
    });
    tabsEl.appendChild(c);
  });
}
$('btnNew').onclick = newGame;
$('btnAuto').onclick = autoFound;
newGame();
