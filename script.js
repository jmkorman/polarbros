// ===================================================================
//  POLAR BROS — interactions
// ===================================================================

// --- Nav: cream bar after leaving the hero ---
const nav = document.getElementById('nav');
const setNav = () => nav.classList.toggle('scrolled', window.scrollY > window.innerHeight - 90);
setNav();
window.addEventListener('scroll', setNav, { passive: true });
window.addEventListener('resize', setNav);

// --- Mobile menu ---
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
toggle.addEventListener('click', () => {
  toggle.classList.toggle('active');
  links.classList.toggle('open');
});
links.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    toggle.classList.remove('active');
    links.classList.remove('open');
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

// --- Year ---
document.getElementById('year').textContent = new Date().getFullYear();
