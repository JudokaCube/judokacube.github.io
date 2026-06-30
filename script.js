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

  function open() {
    modal.classList.add('open');
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
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });
}

try {
  setupModal('openTerminal', 'terminalModal', 'closeTerminal', () => {
    if (typeof initPyodideTerminal === 'function') initPyodideTerminal();
  });
  setupModal('openDiscord', 'discordModal', 'closeDiscord');
  setupModal('openAbout', 'aboutModal', 'closeAbout');
  setupModal('openBook', 'bookModal', 'closeBook');
} catch (e) { console.error('modal setup failed:', e); }



/* ── Book of Dragons ── */
try {
(function () {
  const dragons = [
    { name: 'Night Fury', cls: 'Strike', size: 'Small, lean build', weight: 'Light for its length', behaviour: 'Extremely rare and intelligent; cautious of strangers but fiercely loyal once bonded.' },
    { name: 'Light Fury', cls: 'Strike', size: 'Small, lean build', weight: 'Light for its length', behaviour: 'Wild and wary of humans; can turn invisible-ish via camouflage scales.' },
    { name: 'Deadly Nadder', cls: 'Sharp', size: 'Medium', weight: 'Moderate, agile flier', behaviour: 'Vain and proud; loves attention and being praised, fires spines when threatened.' },
    { name: 'Monstrous Nightmare', cls: 'Stoker', size: 'Large', weight: 'Heavy, powerful build', behaviour: 'Hot-tempered and aggressive at first, but becomes a stubbornly loyal companion once trained.' },
    { name: 'Hideous Zippleback', cls: 'Mystery', size: 'Large, two-headed', weight: 'Heavy, twin-bodied', behaviour: 'Mischievous and a little dim; the two heads have to work together to attack (gas + spark).' },
    { name: 'Gronckle', cls: 'Boulder', size: 'Stocky, compact', weight: 'Very heavy for its size', behaviour: 'Lazy and easygoing despite eating rocks; surprisingly strong fliers once moving.' },
    { name: 'Terrible Terror', cls: 'Stoker', size: 'Tiny', weight: 'Very light', behaviour: 'Feisty and sneaky, hunts and travels in swarms, has a venomous bite for its size.' },
    { name: 'Red Death', cls: 'Boulder (Queen)', size: 'Colossal, mountain-sized', weight: 'Immense', behaviour: 'A ruthless hive-queen that commands smaller dragons to feed it; territorial and dangerous.' },
    { name: 'Changewing', cls: 'Mystery', size: 'Medium', weight: 'Moderate', behaviour: 'Shy unless protecting its young, can camouflage and spits corrosive acid.' },
    { name: 'Whispering Death', cls: 'Boulder', size: 'Large, serpentine', weight: 'Heavy', behaviour: 'Relentless burrower with rings of teeth; territorial and dangerous underground.' },
    { name: 'Skrill', cls: 'Strike (Lightning)', size: 'Medium-large', weight: 'Moderate, built for speed', behaviour: 'Solitary and rare; channels lightning, considered one of the most powerful dragons.' },
    { name: 'Scauldron', cls: 'Tidal', size: 'Large, eel-like', weight: 'Heavy', behaviour: 'Patient ambush predator that blasts boiling water at prey.' },
    { name: 'Snaptrapper', cls: 'Mystery', size: 'Large, six-headed', weight: 'Heavy, group body', behaviour: 'Territorial pack hunters that coordinate their many heads to corner prey.' },
    { name: 'Speed Stinger', cls: 'Tracker', size: 'Small, sleek', weight: 'Light, built for speed', behaviour: 'Hunts in packs with a paralyzing sting; avoids deep water.' },
    { name: 'Boneknapper', cls: 'Mystery', size: 'Large', weight: 'Heavy', behaviour: 'Elusive and almost mythical; camouflages itself with bones and is patient to the point of holding grudges.' },
    { name: 'Razorwhip', cls: 'Sharp', size: 'Medium-large', weight: 'Moderate, blade-edged scales', behaviour: 'Proud and graceful in flight; fiercely loyal once a bond is formed.' },
    { name: 'Stormcutter', cls: 'Tracker', size: 'Large, four-winged', weight: 'Heavy', behaviour: 'Highly intelligent and family-oriented; very protective of its rider and kin.' },
    { name: 'Typhoomerang', cls: 'Stoker', size: 'Large', weight: 'Heavy', behaviour: 'Ferociously protective parent, attacks in a spinning tornado of fire.' },
    { name: 'Thunderdrum', cls: 'Tidal', size: 'Large, dolphin-like', weight: 'Heavy', behaviour: 'Cautious around new people but loyal once trusted; stuns enemies with a sonic roar.' },
    { name: 'Smothering Smokebreath', cls: 'Mystery', size: 'Small', weight: 'Light', behaviour: 'Mischievous and a bit of a thief, hides in thick self-made smokescreens.' },
    { name: 'Fireworm', cls: 'Stoker', size: 'Tiny, caterpillar-like', weight: 'Very light', behaviour: 'Lives in large colonies and is placid unless its nest is disturbed.' },
    { name: 'Bewilderbeast', cls: 'Tidal (Alpha)', size: 'Colossal', weight: 'Immense', behaviour: 'A calm, commanding alpha that controls and protects an entire dragon nest using ice breath.' },
    { name: 'Screaming Death', cls: 'Boulder', size: 'Massive', weight: 'Very heavy', behaviour: 'An obsessive, relentless burrower related to the Whispering Death, known for its piercing screech.' },
    { name: 'Flightmare', cls: 'Mystery', size: 'Medium', weight: 'Moderate', behaviour: 'Eerie and nocturnal, glows and can freeze enemies in place with a paralyzing gaze.' },
    { name: 'Catastrophic Quaken', cls: 'Boulder', size: 'Large, rock-plated', weight: 'Very heavy', behaviour: 'Territorial and easily startled; causes tremors when it stomps.' },
    { name: 'Death Song', cls: 'Mystery', size: 'Large', weight: 'Heavy', behaviour: 'Predatory and dangerous when hungry, lures prey with a hypnotic song and traps them in amber.' },
    { name: 'Snow Wraith', cls: 'Strike', size: 'Medium, eyeless', weight: 'Moderate', behaviour: 'Elusive and fiercely territorial, navigates icy terrain using heat-sensing instead of sight.' },
    { name: 'Buffalord', cls: 'Tracker', size: 'Bulky', weight: 'Heavy, can inflate further when threatened', behaviour: 'Calm grazer that only turns defensive when provoked.' },
    { name: 'Eruptodon', cls: 'Boulder', size: 'Large', weight: 'Very heavy', behaviour: 'A gentle giant that eats lava rock and sneezes fireballs when it has a cold.' },
    { name: 'Armorwing', cls: 'Sharp', size: 'Medium', weight: 'Moderate, metallic scales', behaviour: 'Curious and generally docile, with magnetic abilities tied to its metal-like hide.' },
    { name: 'Triple Stryke', cls: 'Strike', size: 'Large', weight: 'Heavy', behaviour: 'Aggressive and territorial; wields three tail stingers each with a different venom.' },
    { name: 'Sand Wraith', cls: 'Tracker', size: 'Medium', weight: 'Moderate', behaviour: 'Elusive and social in small groups, blends into sand and leaves a glowing trail.' },
    { name: 'Groncicle', cls: 'Boulder', size: 'Stocky', weight: 'Heavy', behaviour: 'A calm, slow-moving cousin of the Gronckle that breathes ice instead of fire.' },
    { name: 'Singetail', cls: 'Stoker', size: 'Medium, twin-tailed', weight: 'Moderate', behaviour: 'Hot-tempered and protective, capable of setting its own tails alight.' },
    { name: 'Woolly Howl', cls: 'Tracker', size: 'Large, thick-furred', weight: 'Heavy', behaviour: 'Cautious and family-oriented; flies almost silently thanks to its fur and sound-based stealth.' },
    { name: 'Shivertooth', cls: 'Boulder', size: 'Large, burrowing', weight: 'Heavy', behaviour: 'Mostly solitary and territorial, tunnels through rock like a mole.' },
    { name: 'Grapple Grounder', cls: 'Mystery', size: 'Medium', weight: 'Moderate', behaviour: 'Cunning and opportunistic, uses a grappling-hook tail to snare prey.' },
    { name: 'Hobblegrunt', cls: 'Tracker', size: 'Medium, two-headed', weight: 'Moderate', behaviour: 'Docile, herbivorous grazer, generally calm around others.' },
    { name: 'Mudraker', cls: 'Boulder', size: 'Medium', weight: 'Moderate', behaviour: 'Placid and easily startled, prefers wallowing in mud over confrontation.' },
    { name: 'Raincutter', cls: 'Tidal', size: 'Large', weight: 'Heavy', behaviour: 'Playful and fast in water, propelled by powerful jets of water.' },
  ];

  const listEl   = document.getElementById('bookList');
  const searchEl = document.getElementById('bookSearch');
  const countEl  = document.getElementById('bookCount');
  if (!listEl || !searchEl) return;

  function render(filter) {
    const q = (filter || '').trim().toLowerCase();
    const filtered = dragons.filter(d =>
      d.name.toLowerCase().includes(q) || d.cls.toLowerCase().includes(q)
    );

    if (countEl) countEl.textContent = `${filtered.length} / ${dragons.length}`;

    if (!filtered.length) {
      listEl.innerHTML = '<p class="book-list-empty">no dragons match that search</p>';
      return;
    }

    listEl.innerHTML = filtered.map(d => `
      <div class="dragon-card">
        <div class="dragon-card-head">
          <span class="dragon-card-name">${d.name}</span>
          <span class="dragon-card-class">${d.cls}</span>
        </div>
        <div class="dragon-card-stats">
          <span><b>Size:</b> ${d.size}</span>
          <span><b>Weight:</b> ${d.weight}</span>
        </div>
        <p class="dragon-card-behaviour">${d.behaviour}</p>
      </div>
    `).join('');
  }

  render('');
  searchEl.addEventListener('input', () => render(searchEl.value));
})();
} catch (e) { console.error('book of dragons setup failed:', e); }



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

    tile.addEventListener('mouseleave', () => {
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
      localStorage.setItem('jdkcube-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('jdkcube-theme', 'light');
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
          if (pauseBtn) pauseBtn.classList.remove('paused');
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

}); // end DOMContentLoaded
