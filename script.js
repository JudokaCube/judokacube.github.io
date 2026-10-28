/* ============================================
   JDKCube — script.js
   ============================================ */

'use strict';

/* Wrap everything to guarantee the DOM is ready before we touch it,
   and so each feature is isolated — one failing section won't
   silently take the rest of the page's interactivity down with it. */
document.addEventListener('DOMContentLoaded', function () {

/* ── Modal system (Terminal + Discord) ── */
function setupModal(openBtnId, modalId, closeBtnId, onFirstOpen) {
  const openBtn  = document.getElementById(openBtnId);
  const modal    = document.getElementById(modalId);
  const closeBtn = document.getElementById(closeBtnId);
  if (!openBtn || !modal || !closeBtn) return;

  let openedOnce = false;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-hidden', 'true');

  function open() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    closeBtn.focus();
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';

    // close music volume panel if it's open, so nothing visually overlaps
    const musicWidget = document.getElementById('musicWidget');
    if (musicWidget) musicWidget.classList.remove('open');

    if (!openedOnce && typeof onFirstOpen === 'function') {
      openedOnce = true;
      onFirstOpen();
    }
  }

  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    openBtn.focus();
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const focusable = [...modal.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')].filter(el => !el.disabled && el.getClientRects().length);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

try {
  setupModal('openTerminal', 'terminalModal', 'closeTerminal', () => {
    if (typeof initPyodideTerminal === 'function') initPyodideTerminal();
  });
  setupModal('openDiscord', 'discordModal', 'closeDiscord');
  setupModal('openAbout', 'aboutModal', 'closeAbout');
  setupModal('openSpecs', 'specsModal', 'closeSpecs');
} catch (e) { console.error('modal setup failed:', e); }




/* ── Python terminal (Pyodide REPL) ── */
let initPyodideTerminal = function () {};

try {
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

    // Fetch the optional runtime only when the terminal is opened.
    if (typeof loadPyodide !== 'function') {
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          const timer = setTimeout(() => { script.remove(); reject(new Error('Runtime download timed out')); }, 25000);
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
          script.onload = () => { clearTimeout(timer); resolve(); };
          script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error('Runtime download failed')); };
          document.head.appendChild(script);
        });
      } catch (_) { /* Show the existing unavailable-runtime message below. */ }
    }

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

      // help() tries to open an interactive pager that reads stdin, which
      // doesn't exist in this environment and throws an I/O error. Patch it
      // to just print the help text instead, like a non-interactive call.
      try {
        await pyodide.runPythonAsync(`
import pydoc, builtins

def _browser_help(*args):
    if not args:
        print("Type help(object) for help on a specific module, function, class, etc.")
        return
    text = pydoc.render_doc(args[0], renderer=pydoc.plaintext)
    print(text)

builtins.help = _browser_help
        `);
      } catch (patchErr) {
        // non-fatal — if this fails, help() will still mostly work for simple cases
      }

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

  // Only load Pyodide the first time the terminal modal is opened
  initPyodideTerminal = function () {
    if (!pyodide) initPyodide();
  };
})();
} catch (e) { console.error('terminal setup failed:', e); }

/* ── Per-tile spotlight + subtle 3D tilt ── */
try {
(function () {
  if (window.matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return;
  const tiles = document.querySelectorAll('.tile');
  const MAX_TILT = 4; // degrees, kept subtle

  tiles.forEach((tile) => {
    let rect = null;
    let pending = null;

    tile.addEventListener('mouseenter', () => {
      rect = tile.getBoundingClientRect();
      tile.classList.remove('tile-resetting');
    });

    tile.addEventListener('mousemove', (e) => {
      if (!rect) rect = tile.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (pending) return;
      pending = requestAnimationFrame(() => {
        pending = null;
        tile.style.setProperty('--mx', x + 'px');
        tile.style.setProperty('--my', y + 'px');

        const px = (x / rect.width) - 0.5;
        const py = (y / rect.height) - 0.5;
        const rotateY = (px * MAX_TILT * 2).toFixed(2);
        const rotateX = (py * -MAX_TILT * 2).toFixed(2);
        tile.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
      });
    });

    window.addEventListener('resize', () => { rect = null; });
    tile.addEventListener('mouseleave', () => {
      if (pending) cancelAnimationFrame(pending);
      pending = null;
      rect = null;
      tile.classList.add('tile-resetting');
      tile.style.transform = '';
    });
  });
})();
} catch (e) { console.error('tile tilt setup failed:', e); }

/* ── Theme toggle (dark / light) ── */
try {
(function () {
  const root   = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    if (isLight) {
      root.removeAttribute('data-theme');
      try { localStorage.setItem('jdkcube-theme', 'dark'); } catch (_) {}
    } else {
      root.setAttribute('data-theme', 'light');
      try { localStorage.setItem('jdkcube-theme', 'light'); } catch (_) {}
    }
  });
})();
} catch (e) { console.error('theme toggle setup failed:', e); }

/* ── Music player ── */
try {
(function () {
  const audio   = document.getElementById('bgMusic');
  const widget  = document.getElementById('musicWidget');
  const btn     = document.getElementById('musicBtn');
  const panel   = document.getElementById('musicPanel');
  const slider  = document.getElementById('volumeSlider');
  const pauseBtn = document.getElementById('musicPauseBtn');

  let playing = false;


  // Set initial volume
  audio.volume = slider.value / 100;
  updateSliderFill();

  // Toggle panel open/close on button click
  btn.addEventListener('click', () => {
    if (!widget.classList.contains('open')) {
      widget.classList.add('open');

      // Start music on first interaction (browser autoplay policy)
      if (audio.paused) {
        audio.play().then(() => {
          playing = true;
          btn.classList.add('playing');
          if (pauseBtn) pauseBtn.classList.remove('paused');
        }).catch(() => {});
      }
    } else {
      widget.classList.remove('open');
    }
  });

  // Close panel when clicking outside
  document.addEventListener('click', e => {
    if (!widget.contains(e.target) && widget.classList.contains('open')) {
      widget.classList.remove('open');
    }
  });

  // Play / pause button inside the panel
  if (pauseBtn) {
    pauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (playing) {
        audio.pause();
        playing = false;
        btn.classList.remove('playing');
        pauseBtn.classList.add('paused');
        pauseBtn.setAttribute('aria-label', 'Play music');
      } else {
        audio.play().then(() => {
          playing = true;
          btn.classList.add('playing');
          pauseBtn.classList.remove('paused');
          pauseBtn.setAttribute('aria-label', 'Pause music');
        }).catch(() => {});
      }
    });
  }

  // Volume slider
  slider.addEventListener('input', () => {
    audio.volume = slider.value / 100;
    updateSliderFill();
  });

  function updateSliderFill() {
    slider.style.setProperty('--val', slider.value + '%');
  }
})();
} catch (e) { console.error('music player setup failed:', e); }

/* ── Easter egg (corner pfp) ──
   This link previously relied only on CSS :hover/:focus-visible to reveal
   the "click me" bubble and animate the avatar. Touch devices have no real
   hover state, so the first tap just triggered the hover styles instead of
   following the link — visitors had to tap twice. We add a small JS-driven
   "touched" state so a single tap reveals the bubble immediately and the
   link still navigates normally right after. */
try {
(function () {
  const egg = document.getElementById('easterEgg');
  if (!egg) return;

  egg.addEventListener('touchstart', () => {
    egg.classList.add('touched');
  }, { passive: true });
})();
} catch (e) { console.error('easter egg setup failed:', e); }

try {
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
} catch (e) { console.error('copy button setup failed:', e); }

/* ── Live Discord activity (Lanyard) ── */
try {
(function () {
  const DISCORD_USER_ID = '820292272209002526';
  const POLL_MS = 20000;

  const dot         = document.getElementById('daStatusDot');
  const statusText  = document.getElementById('daStatusText');
  const activityBox = document.getElementById('daActivity');
  const activityImg = document.getElementById('daActivityImg');
  const activityName = document.getElementById('daActivityName');
  const activityDetail = document.getElementById('daActivityDetail');
  const activityState = document.getElementById('daActivityState');
  const emptyMsg = document.getElementById('daEmptyMsg');
  if (!dot || !statusText) return;

  const STATUS_LABELS = {
    online: 'Online',
    idle: 'Idle',
    dnd: 'Do Not Disturb',
    offline: 'Offline'
  };

  // Builds a usable image URL from a Discord rich-presence asset string.
  // Spotify assets are handled separately since Lanyard gives a direct URL.
  function resolveAssetUrl(applicationId, assetKey) {
    if (!assetKey) return null;
    if (assetKey.startsWith('mp:')) {
      return 'https://media.discordapp.net/' + assetKey.replace(/^mp:/, '');
    }
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${assetKey}.png`;
  }

  const imgWrapEl = activityImg.parentElement;
  activityImg.addEventListener('error', () => {
    activityImg.removeAttribute('src');
    imgWrapEl.hidden = true;
  });

  function showActivity({ imgUrl, name, detail, state }) {
    if (imgUrl) {
      activityImg.src = imgUrl;
      activityImg.alt = name || '';
      imgWrapEl.hidden = false;
    } else {
      // No usable image for this activity — clear the src so a stale or
      // broken icon never lingers, and hide the box entirely.
      activityImg.removeAttribute('src');
      activityImg.alt = '';
      imgWrapEl.hidden = true;
    }
    activityName.textContent = name || '';
    activityDetail.textContent = detail || '';
    activityDetail.hidden = !detail;
    activityState.textContent = state || '';
    activityState.hidden = !state;
    activityBox.hidden = false;
    emptyMsg.hidden = true;
  }

  function showEmpty() {
    activityBox.hidden = true;
    emptyMsg.hidden = false;
  }

  function render(data) {
    const status = data.discord_status || 'offline';
    dot.className = 'da-status-dot ' + status;
    statusText.textContent = STATUS_LABELS[status] || 'Offline';

    // Prefer Spotify (has reliable album art), then the first non-custom-status activity.
    if (data.listening_to_spotify && data.spotify) {
      showActivity({
        imgUrl: data.spotify.album_art_url,
        name: data.spotify.song,
        detail: 'by ' + data.spotify.artist,
        state: data.spotify.album ? 'on ' + data.spotify.album : ''
      });
      return;
    }

    const activity = (data.activities || []).find(a => a.type !== 4); // skip custom status (type 4)
    if (activity) {
      const assets = activity.assets || {};
      const imgUrl = resolveAssetUrl(activity.application_id, assets.large_image);
      showActivity({
        imgUrl,
        name: activity.name,
        detail: activity.details || '',
        state: activity.state || ''
      });
      return;
    }

    // Fall back to a custom status if that's all there is.
    const customStatus = (data.activities || []).find(a => a.type === 4);
    if (customStatus && (customStatus.state || customStatus.emoji)) {
      showActivity({
        imgUrl: null,
        name: [customStatus.emoji ? customStatus.emoji.name : '', customStatus.state].filter(Boolean).join(' ').trim(),
        detail: '',
        state: ''
      });
      return;
    }

    showEmpty();
  }

  async function fetchActivity() {
    try {
      const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
      const json = await res.json();
      if (json && json.success && json.data) render(json.data);
    } catch (err) {
      statusText.textContent = 'unavailable';
      dot.className = 'da-status-dot offline';
    }
  }

  fetchActivity();
  setInterval(fetchActivity, POLL_MS);
})();
} catch (e) { console.error('discord activity widget setup failed:', e); }

/* ── Click counter tile ── */
try {
(function () {
  const btn = document.getElementById('clickCounter');
  const valueEl = document.getElementById('counterValue');
  if (!btn || !valueEl) return;

  const STORAGE_KEY = 'jdkcube-clickcount';
  let count = 0;
  try { count = parseInt(localStorage.getItem(STORAGE_KEY), 10); } catch (_) {}
  if (!Number.isFinite(count) || count < 0) count = 0;
  valueEl.textContent = count.toLocaleString();

  btn.addEventListener('click', () => {
    count += 1;
    valueEl.textContent = count.toLocaleString();
    try { localStorage.setItem(STORAGE_KEY, String(count)); } catch (_) {}

    valueEl.classList.remove('bump');
    // force reflow so the animation can restart on rapid clicks
    void valueEl.offsetWidth;
    valueEl.classList.add('bump');
  });
})();
} catch (e) { console.error('click counter setup failed:', e); }

/* ── Mini paint tile ── */
try {
(function () {
  const canvas = document.getElementById('paintCanvas');
  const wrap = document.getElementById('paintCanvasWrap');
  if (!canvas || !wrap) return;

  const ctx = canvas.getContext('2d');
  const clearBtn = document.getElementById('paintClear');
  const sizeSlider = document.getElementById('paintSize');
  const strengthSlider = document.getElementById('paintStrength');
  const colorPicker = document.getElementById('paintColorPicker');
  const swatches = document.querySelectorAll('.paint-swatch');

  let currentColor = '#00e5ff';
  let drawing = false;
  let lastX = 0;
  let lastY = 0;

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (w === 0 || h === 0) return;
    if (canvas.width === Math.round(w * ratio) && canvas.height === Math.round(h * ratio)) return;
    const previous = document.createElement('canvas');
    previous.width = canvas.width; previous.height = canvas.height;
    previous.getContext('2d').drawImage(canvas, 0, 0);
    drawing = false;
    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.drawImage(previous, 0, 0, previous.width, previous.height, 0, 0, w, h);
  }

  // wait a tick so layout/fonts have settled before measuring the wrapper
  requestAnimationFrame(resizeCanvas);
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resizeCanvas).observe(wrap);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 150);
  });

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const point = e.touches && e.touches.length ? e.touches[0] : e;
    return {
      x: point.clientX - rect.left,
      y: point.clientY - rect.top
    };
  }

  function drawLine(x1, y1, x2, y2) {
    const size = parseFloat(sizeSlider.value) || 6;
    const strength = (parseFloat(strengthSlider.value) || 100) / 100;
    ctx.strokeStyle = currentColor;
    ctx.globalAlpha = strength;
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function startDraw(e) {
    drawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
    drawLine(pos.x, pos.y, pos.x, pos.y); // dot for a single click/tap
    e.preventDefault();
  }

  function moveDraw(e) {
    if (!drawing) return;
    const pos = getPos(e);
    drawLine(lastX, lastY, pos.x, pos.y);
    lastX = pos.x;
    lastY = pos.y;
    e.preventDefault();
  }

  function endDraw() {
    drawing = false;
  }

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', moveDraw);
  window.addEventListener('mouseup', endDraw);

  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove', moveDraw, { passive: false });
  canvas.addEventListener('touchend', endDraw);
  canvas.addEventListener('touchcancel', endDraw);

  function setActiveSwatch(btn) {
    swatches.forEach(s => s.classList.remove('active'));
    if (btn) btn.classList.add('active');
  }

  swatches.forEach(btn => {
    btn.addEventListener('click', () => {
      currentColor = btn.dataset.color;
      if (colorPicker) colorPicker.value = currentColor;
      setActiveSwatch(btn);
    });
  });

  if (colorPicker) {
    colorPicker.addEventListener('input', () => {
      currentColor = colorPicker.value;
      setActiveSwatch(null);
    });
  }

  function bindSliderFill(slider) {
    if (!slider) return;
    const update = () => {
      const min = parseFloat(slider.min) || 0;
      const max = parseFloat(slider.max) || 100;
      const pct = ((slider.value - min) / (max - min)) * 100;
      slider.style.setProperty('--val', pct + '%');
    };
    update();
    slider.addEventListener('input', update);
  }
  bindSliderFill(sizeSlider);
  bindSliderFill(strengthSlider);

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
  }
})();
} catch (e) { console.error('paint tile setup failed:', e); }

}); // end DOMContentLoaded
