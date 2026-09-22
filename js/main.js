// ═══════════════════════════════════════════════════════
// main.js — Core UI interactions
// ═══════════════════════════════════════════════════════

// ─── Reduced-motion check (used throughout) ───────────
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── THEME TOGGLE ────────────────────────────────────
function toggleTheme() {
  const body = document.body;
  const newTheme = body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  const btn = document.querySelector('.theme-toggle');
  if (btn) btn.textContent = newTheme === 'light' ? '🌙' : '☀️';
}

const savedTheme = localStorage.getItem('theme') || 'dark';
document.body.setAttribute('data-theme', savedTheme);
window.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.theme-toggle');
  if (btn) btn.textContent = savedTheme === 'light' ? '🌙' : '☀️';
});

// ─── MOBILE NAV ──────────────────────────────────────
const menuBtn  = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');
    menuBtn.textContent = isOpen ? '✕' : '☰';
    menuBtn.setAttribute('aria-expanded', isOpen);
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuBtn.textContent = '☰';
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// ─── SMOOTH SCROLL ───────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      const offset = 80;
      const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
      if (prefersReducedMotion) {
        window.scrollTo({ top: y });
      } else {
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  });
});

// ─── TYPING ANIMATION ────────────────────────────────
const typingEl = document.querySelector('.typing-text');
const phrases  = [
  'AI Engineer',
  'GenAI Developer',
  'ML Engineer',
  'Python Backend Dev',
  'LangChain Builder',
];
let pIdx = 0, cIdx = 0, deleting = false, speed = 90;

function type() {
  if (!typingEl || prefersReducedMotion) {
    if (typingEl) typingEl.textContent = phrases[0];
    return;
  }
  const phrase = phrases[pIdx];
  typingEl.textContent = phrase.substring(0, cIdx);

  if (!deleting && cIdx === phrase.length) {
    deleting = true;
    speed = 2200;
  } else if (deleting && cIdx === 0) {
    deleting = false;
    pIdx = (pIdx + 1) % phrases.length;
    speed = 380;
  } else {
    speed = deleting ? 42 : 85;
    cIdx += deleting ? -1 : 1;
  }
  setTimeout(type, speed);
}

// ─── 3D TILT ON PROJECT CARDS ────────────────────────
function initTiltCards() {
  if (prefersReducedMotion || window.innerWidth < 768) return;

  const TILT_MAX   = 8;     // degrees
  const SCALE_MAX  = 1.025;

  document.querySelectorAll('.project-card').forEach(card => {
    card.classList.add('tilt-card');

    const onMove = (e) => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      const rx   =  dy * TILT_MAX;   // rotate around X for vertical mouse
      const ry   = -dx * TILT_MAX;   // rotate around Y for horizontal mouse
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${SCALE_MAX})`;
    };

    const onLeave = () => {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
    };

    card.addEventListener('mousemove',  onMove,  { passive: true });
    card.addEventListener('mouseleave', onLeave, { passive: true });
  });
}

// ─── TRAILING CURSOR ────────────────────────────────
let cursorEl;
function initCursor() {
  if (prefersReducedMotion || window.innerWidth < 768) return;
  cursorEl = document.createElement('div');
  cursorEl.className = 'custom-cursor';
  cursorEl.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursorEl);

  let mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  function moveCursor() {
    cx += (mx - cx) * 0.13;
    cy += (my - cy) * 0.13;
    cursorEl.style.left = `${cx}px`;
    cursorEl.style.top  = `${cy}px`;
    requestAnimationFrame(moveCursor);
  }
  moveCursor();
}

// ─── INIT ────────────────────────────────────────────
window.addEventListener('load', () => {
  type();
  initCursor();

  // Loader fade
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 500);
  }

  // Tilt after a short wait so cards are in DOM
  setTimeout(initTiltCards, 300);
});
