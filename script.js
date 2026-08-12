// ===================================================================
//  POLAR BROS — interactions
// ===================================================================

// --- Nav: cream bar after leaving the hero ---
const nav = document.getElementById('nav');
const heroEl = document.querySelector('.hero, .pagehead');
const setNav = () =>
  nav.classList.toggle('scrolled', window.scrollY > (heroEl ? heroEl.offsetHeight : 0) - 90);
setNav();
window.addEventListener('scroll', setNav, { passive: true });
window.addEventListener('resize', setNav);

// --- Mobile menu ---
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
toggle.addEventListener('click', () => {
  const open = toggle.classList.toggle('active');
  links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});
links.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    toggle.classList.remove('active');
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  })
);

// --- Reveal on scroll ---
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
);
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// --- Offering CTAs pre-select the contact form interest ---
const interestSelect = document.getElementById('interest');
document.querySelectorAll('.index__cta[data-interest]').forEach((cta) =>
  cta.addEventListener('click', () => {
    if (!interestSelect) return;
    const want = cta.getAttribute('data-interest');
    const match = [...interestSelect.options].find((o) => o.value === want || o.text === want);
    if (match) interestSelect.value = match.value;
  })
);

// --- Hero particle fog (canvas), reacts to scroll ---
(() => {
  const canvas = document.getElementById('fogFx');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let dpr = 1, W = 0, H = 0, puffs = [], running = false, rafId = 0, scrollP = 0;

  // Pre-baked soft puff sprite (radial gradient) — cheap to draw many times.
  const sprite = document.createElement('canvas');
  const S = 256;
  sprite.width = sprite.height = S;
  const sctx = sprite.getContext('2d');
  const g = sctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(240,245,251,0.72)');
  g.addColorStop(0.35, 'rgba(224,234,247,0.38)');
  g.addColorStop(0.7, 'rgba(210,226,244,0.10)');
  g.addColorStop(1, 'rgba(210,226,244,0)');
  sctx.fillStyle = g;
  sctx.fillRect(0, 0, S, S);

  const rand = (a, b) => a + Math.random() * (b - a);

  function makePuff(seed) {
    const r = rand(W * 0.14, W * 0.34);
    return {
      x: rand(-0.1, 1.1) * W,
      y: seed ? rand(0, H) : rand(H * 0.55, H * 1.25),
      r,
      vx: rand(-6, 6) * (W / 1400),
      vy: -rand(10, 26) * (H / 900),
      sway: rand(0, Math.PI * 2),
      swaySpd: rand(0.006, 0.018),
      alpha: rand(0.5, 1),
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth;
    H = hero.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = W < 700 ? 10 : W < 1200 ? 16 : 22;
    puffs = Array.from({ length: count }, () => makePuff(true));
  }

  let last = 0;
  function frame(t) {
    if (!running) return;
    const dt = Math.min((t - last) || 16, 40) / 1000;
    last = t;
    ctx.clearRect(0, 0, W, H);
    // Scroll pours the fog downward and thickens it as the hero exits.
    const downBias = scrollP * 60;
    const thick = 0.95 + scrollP * 0.5;
    ctx.globalCompositeOperation = 'lighter';
    for (const p of puffs) {
      p.sway += p.swaySpd;
      p.x += (p.vx + Math.sin(p.sway) * 8) * dt;
      p.y += (p.vy + downBias) * dt;
      if (p.y + p.r < -20 && downBias < 40) { p.y = H + p.r; p.x = rand(-0.1, 1.1) * W; }
      if (p.y - p.r > H + 40) { p.y = -p.r; p.x = rand(-0.1, 1.1) * W; }
      ctx.globalAlpha = p.alpha * thick;
      ctx.drawImage(sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    }
    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(frame);
  }

  function start() { if (!running) { running = true; last = 0; rafId = requestAnimationFrame(frame); } }
  function stop() { running = false; cancelAnimationFrame(rafId); }

  const onScroll = () => {
    scrollP = Math.max(0, Math.min(1, window.scrollY / (hero.clientHeight || 1)));
  };

  resize();
  onScroll();
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', onScroll, { passive: true });

  // Only animate while the hero is on screen.
  new IntersectionObserver(
    (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
    { threshold: 0 }
  ).observe(hero);
})();

// --- Year ---
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// --- Stockist map (map.html only) ---
const mapEl = document.getElementById('map');
if (mapEl && window.L && Array.isArray(window.POLAR_STOCKISTS)) {
  const map = L.map(mapEl, { scrollWheelZoom: false });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  }).addTo(map);

  const pin = L.divIcon({
    className: 'pb-pin',
    html: '<span></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  const bounds = [];
  window.POLAR_STOCKISTS.forEach((s) => {
    const q = encodeURIComponent(s.addr);
    const marker = L.marker([s.lat, s.lng], { icon: pin, title: s.name }).addTo(map);
    marker.bindPopup(
      `<strong>${s.name}</strong><br>${s.addr}<br>` +
        `<a href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">Get directions</a>`
    );
    bounds.push([s.lat, s.lng]);
  });

  map.fitBounds(bounds, { padding: [40, 40] });
  map.on('click', () => map.scrollWheelZoom.enable());
  map.on('mouseout', () => map.scrollWheelZoom.disable());
}
