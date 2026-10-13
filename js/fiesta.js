// Fiesta: serpentinas al ganar, tristeza al perder. Reutilizable en todos los juegos.
window.fiesta = (() => {
  const CONF = ['#FF6B81', '#4A7DFF', '#E8A100', '#3FA46A', '#7C5CD6', '#FFFDF7'];
  let canvas, label, raf, parts, endAt, mode;
  function ensure() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'fiesta-canvas';
    Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9998 });
    label = document.createElement('div');
    label.id = 'fiesta-label';
    Object.assign(label.style, { position: 'fixed', top: '16%', left: '50%', transform: 'translateX(-50%) rotate(-2deg)', zIndex: 9999, pointerEvents: 'none', fontFamily: "'Shrikhand','DM Serif Display',serif", fontSize: 'clamp(2rem,7vw,3.4rem)', color: '#3A3340', background: '#FFFDF7', border: '4px solid #3A3340', borderRadius: '18px', padding: '10px 26px', boxShadow: '0 6px 0 rgba(58,51,64,.25)', display: 'none', textAlign: 'center' });
    document.body.append(canvas, label);
  }
  function boom(n, sad) {
    ensure();
    canvas.width = innerWidth; canvas.height = innerHeight;
    const ctx = canvas.getContext('2d');
    parts = Array.from({ length: n }, () => ({
      x: sad ? Math.random() * canvas.width : Math.random() * canvas.width,
      y: sad ? -20 - Math.random() * 100 : -20 - Math.random() * canvas.height * .4,
      w: 6 + Math.random() * 8, h: 8 + Math.random() * 10,
      vy: sad ? 1.5 + Math.random() * 2.5 : 2.5 + Math.random() * 4,
      vx: (Math.random() - .5) * 2, rot: Math.random() * 7, vr: (Math.random() - .5) * .25,
      c: sad ? (Math.random() > .5 ? '#8b8494' : '#A0C4FF') : CONF[Math.random() * CONF.length | 0],
      circle: !sad && Math.random() > .7
    }));
    cancelAnimationFrame(raf);
    endAt = performance.now() + (sad ? 2600 : 3400);
    mode = sad ? 'sad' : 'happy';
    label.style.display = 'block';
    label.textContent = sad ? '☹ ¡Perdiste! ¡Reinténtalo!' : '★ ¡GANASTE! ★';
    label.style.borderColor = '#3A3340';
    const tick = t => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts.forEach(p => {
        p.x += p.vx + Math.sin(t / 300 + p.rot); p.y += p.vy; p.rot += p.vr;
        if (p.y > canvas.height + 30) { p.y = -20; p.x = Math.random() * canvas.width; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c;
        if (p.circle) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, 7); ctx.fill(); }
        else if (mode === 'sad') { ctx.beginPath(); ctx.ellipse(0, 0, p.w / 3, p.h / 2, 0, 0, 7); ctx.fill(); }
        else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (t < endAt) raf = requestAnimationFrame(tick);
      else { ctx.clearRect(0, 0, canvas.width, canvas.height); label.style.display = 'none'; }
    };
    raf = requestAnimationFrame(tick);
  }
  return { ganar: () => boom(170, false), perder: () => boom(110, true) };
})();
