// Interacciones ligeras
// Reveal on scroll
const io = new IntersectionObserver(es => es.forEach(x => x.isIntersecting && x.target.classList.add('in')), {threshold:.12});
document.querySelectorAll('.proj,.skill,.titem,.info-card,.card-organic').forEach(el => io.observe(el));
// Filtros proyectos
document.querySelectorAll('.fbtn').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.fbtn').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  const f = b.dataset.filter;
  document.querySelectorAll('.proj').forEach(p => {
    p.classList.toggle('hide', f !== 'all' && !p.dataset.cat.includes(f));
  });
}));
// Menu movil
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.querySelector('.nav-links');
menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
