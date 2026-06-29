/* ============================================
   JDKCube — script.js
   ============================================ */

'use strict';

/* ── Smooth scroll for [data-scroll] anchors ── */
document.querySelectorAll('[data-scroll]').forEach(el => {
  el.addEventListener('click', e => {
    const href = el.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ── Intersection Observer — staggered reveals ── */
const observerOpts = {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px',
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const delay = el.style.getPropertyValue('--delay') || '0ms';
    // respect CSS delay for stagger
    el.style.transitionDelay = delay;
    el.classList.add('visible');
    revealObserver.unobserve(el);
  });
}, observerOpts);

/* Observe section titles and labels */
document.querySelectorAll(
  '.section-title, .section-label, .about-intro'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* Staggered cards */
document.querySelectorAll(
  '.interest-card, .project-card'
).forEach(el => {
  revealObserver.observe(el);
});

/* Discord card */
document.querySelectorAll('.dc-card').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* Footer */
document.querySelectorAll('.footer').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* ── Copy username button ── */
const copyBtn = document.getElementById('copyBtn');
if (copyBtn) {
  let resetTimer = null;

  copyBtn.addEventListener('click', async () => {
    const username = 'judokacube';

    try {
      await navigator.clipboard.writeText(username);
    } catch {
      /* fallback for older browsers */
      const ta = document.createElement('textarea');
      ta.value = username;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    copyBtn.classList.add('copied');
    copyBtn.setAttribute('aria-label', 'Username copied!');

    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.setAttribute('aria-label', 'Copy username to clipboard');
    }, 2000);
  });
}