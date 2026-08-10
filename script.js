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
