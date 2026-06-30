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
document.querySelectorAll('.dc-card, .term-window').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* Footer */
document.querySelectorAll('.footer').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* ── Python terminal (Pyodide REPL) ── */
(function () {
  const statusEl = document.getElementById('termStatus');
  const outputEl = document.getElementById('termOutput');
  const inputEl  = document.getElementById('termInput');
  const bodyEl   = document.getElementById('termBody');
  if (!inputEl) return;

  let pyodide   = null;
  let history   = [];
  let histIndex = -1;

  function appendLine(text, cls) {
    const span = document.createElement('div');
    span.className = cls || '';
    span.textContent = text;
    outputEl.appendChild(span);
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  function printWelcome() {
    appendLine('Python 3.11 (Pyodide) — running entirely in your browser', 'term-line-sys');
    appendLine('Type python code below and hit enter. No server involved.', 'term-line-sys');
    appendLine('', '');
  }

  async function initPyodide() {
    statusEl.textContent = 'loading…';

    if (typeof loadPyodide !== 'function') {
      statusEl.textContent = 'failed to load';
      statusEl.style.color = '#ff6b6b';
      appendLine('Pyodide script did not load (likely blocked by network/adblock/CSP). Try disabling any ad blocker or content blocker for this site and refresh.', 'term-line-err');
      return;
    }

    try {
      const loadPromise = loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timed out after 25s — slow or blocked connection')), 25000)
      );

      pyodide = await Promise.race([loadPromise, timeoutPromise]);

      // redirect stdout/stderr into our terminal
      pyodide.setStdout({ batched: (s) => appendLine(s, 'term-line-out') });
      pyodide.setStderr({ batched: (s) => appendLine(s, 'term-line-err') });

      statusEl.textContent = 'ready';
      statusEl.classList.add('ready');
      inputEl.disabled = false;
      inputEl.placeholder = 'type python here…';
      inputEl.focus();
      printWelcome();
    } catch (err) {
      statusEl.textContent = 'failed to load';
      statusEl.style.color = '#ff6b6b';
      appendLine('Could not load the Python runtime: ' + (err && err.message ? err.message : err), 'term-line-err');
      appendLine('Check your internet connection, disable any ad/script blockers for this site, and refresh.', 'term-line-sys');
    }
  }

  async function runCode(code) {
    appendLine(code, 'term-line-in');

    if (code.trim() === 'clear') {
      outputEl.innerHTML = '';
      return;
    }

    try {
      let result = await pyodide.runPythonAsync(code);
      if (result !== undefined && result !== null) {
        appendLine(String(result), 'term-line-out');
      }
    } catch (err) {
      // Pyodide errors are verbose Python tracebacks — show the last meaningful line
      const msg = String(err);
      const lines = msg.trim().split('\n');
      appendLine(lines[lines.length - 1] || msg, 'term-line-err');
    }
  }

  inputEl.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const code = inputEl.value;
      if (!code.trim() || !pyodide) return;

      history.push(code);
      histIndex = history.length;
      inputEl.value = '';
      inputEl.disabled = true;

      await runCode(code);

      inputEl.disabled = false;
      inputEl.focus();
    } else if (e.key === 'ArrowUp') {
      if (history.length === 0) return;
      e.preventDefault();
      histIndex = Math.max(0, histIndex - 1);
      inputEl.value = history[histIndex] || '';
    } else if (e.key === 'ArrowDown') {
      if (history.length === 0) return;
      e.preventDefault();
      histIndex = Math.min(history.length, histIndex + 1);
      inputEl.value = history[histIndex] || '';
    }
  });

  // Clicking anywhere in the terminal body focuses the input
  bodyEl.addEventListener('click', () => {
    if (!inputEl.disabled) inputEl.focus();
  });

  // Only load Pyodide once the terminal section actually scrolls into view
  const termSection = document.getElementById('terminal');
  const termObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !pyodide) {
        initPyodide();
        termObserver.disconnect();
      }
    });
  }, { threshold: 0, rootMargin: '200px 0px' });

  if (termSection) termObserver.observe(termSection);
})();

/* ── Theme toggle (dark / light) ── */
(function () {
  const root   = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    if (isLight) {
      root.removeAttribute('data-theme');
      localStorage.setItem('jdkcube-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('jdkcube-theme', 'light');
    }
  });
})();

/* ── Music player ── */
(function () {
  const audio   = document.getElementById('bgMusic');
  const widget  = document.getElementById('musicWidget');
  const btn     = document.getElementById('musicBtn');
  const panel   = document.getElementById('musicPanel');
  const slider  = document.getElementById('volumeSlider');

  let playing = false;
  let open    = false;

  // Set initial volume
  audio.volume = slider.value / 100;
  updateSliderFill();

  // Toggle panel open/close on button click
  btn.addEventListener('click', () => {
    if (!open) {
      open = true;
      widget.classList.add('open');

      // Start music on first interaction (browser autoplay policy)
      if (!playing) {
        audio.play().then(() => {
          playing = true;
          btn.classList.add('playing');
        }).catch(() => {});
      }
    } else {
      open = false;
      widget.classList.remove('open');
    }
  });

  // Close panel when clicking outside
  document.addEventListener('click', e => {
    if (!widget.contains(e.target) && open) {
      open = false;
      widget.classList.remove('open');
    }
  });

  // Volume slider
  slider.addEventListener('input', () => {
    audio.volume = slider.value / 100;
    updateSliderFill();
  });

  function updateSliderFill() {
    slider.style.setProperty('--val', slider.value + '%');
  }
})();
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
