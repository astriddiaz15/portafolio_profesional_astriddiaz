// Inclinación suave al mover el mouse sobre las cartas
document.querySelectorAll('.poker-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `rotate(${x * 6}deg) scale(1.02)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// Carrusel promo: un juego a la vez, avanza cada 10 s con desliz
(() => {
  const track = document.getElementById('carTrack');
  if (!track) return;
  const n = track.children.length;
  const dotsBox = document.getElementById('carDots');
  const view = track.parentElement;
  let i = 0, timer, visible = true;
  const dots = [];
  for (let k = 0; k < n; k++) {
    const d = document.createElement('button');
    d.className = 'car-dot' + (k === 0 ? ' on' : '');
    d.setAttribute('aria-label', 'Ver juego ' + (k + 1));
    d.onclick = () => { go(k); restart(); };
    dotsBox.appendChild(d); dots.push(d);
  }
  function go(k) {
    i = (k + n) % n;
    track.style.transform = 'translateX(-' + (i * 100) + '%)';
    dots.forEach((d, j) => d.classList.toggle('on', j === i));
  }
  function restart() { clearInterval(timer); timer = setInterval(() => { if (visible && !document.hidden) go(i + 1); }, 10000); }
  document.getElementById('carPrev').onclick = () => { go(i - 1); restart(); };
  document.getElementById('carNext').onclick = () => { go(i + 1); restart(); };
  let tx = null;
  view.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
  view.addEventListener('touchend', e => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 40) { go(i + (dx < 0 ? 1 : -1)); restart(); }
  });
  const promo = document.querySelector('.promo');
  if (promo && 'IntersectionObserver' in window)
    new IntersectionObserver(es => visible = es[0].isIntersecting).observe(promo);
  restart();
})();
