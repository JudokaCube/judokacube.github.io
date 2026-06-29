// ============================================
//  JDKCube — Discord Profile Fetcher
//  Uses Lanyard API (open-source Discord presence)
// ============================================

(function () {
  'use strict';

  const USER_ID = '820292272209002526';
  const LANYARD_URL = `https://api.lanyard.rest/v1/users/${USER_ID}`;
  const CDN = 'https://cdn.discordapp.com';

  // DOM refs
  const avatarImg         = document.getElementById('dc-avatar');
  const statusDot         = document.getElementById('dc-status-dot');
  const displayName       = document.getElementById('dc-display-name');
  const username          = document.getElementById('dc-username');
  const pronouns          = document.getElementById('dc-pronouns');
  const uid               = document.getElementById('dc-uid');
  const statusLabel       = document.getElementById('dc-status-label');
  const bioEl             = document.getElementById('dc-bio');
  const badgesEl          = document.getElementById('dc-badges');
  const activitySection   = document.getElementById('dc-activity-section');
  const activityName      = document.getElementById('dc-activity-name');
  const activityDetail    = document.getElementById('dc-activity-detail');
  const activityIcon      = document.getElementById('dc-activity-icon');
  const errorBanner       = document.getElementById('dc-error');

  // Status config
  const STATUS = {
    online:  { label: 'Online',          cls: 'online',  dot: 'online'  },
    idle:    { label: 'Idle',            cls: 'idle',    dot: 'idle'    },
    dnd:     { label: 'Do Not Disturb',  cls: 'dnd',     dot: 'dnd'     },
    offline: { label: 'Offline',         cls: 'offline', dot: 'offline' },
  };

  function applyStatus(status) {
    const s = STATUS[status] || STATUS.offline;
    if (statusDot)   { statusDot.className   = `discord-status-dot ${s.dot}`; }
    if (statusLabel) { statusLabel.className = `discord-status-label ${s.cls}`; statusLabel.textContent = s.label; }
  }

  function setAvatar(hash, userId) {
    if (!avatarImg) return;
    const ext = hash && hash.startsWith('a_') ? 'gif' : 'webp';
    const url = hash
      ? `${CDN}/avatars/${userId}/${hash}.${ext}?size=128`
      : `${CDN}/embed/avatars/${parseInt(userId) % 6}.png`;
    avatarImg.src = url;
    avatarImg.alt = 'Discord avatar';
    avatarImg.onerror = () => { avatarImg.src = `${CDN}/embed/avatars/0.png`; };
  }

  function renderActivity(activities) {
    if (!activities || activities.length === 0) {
      if (activitySection) activitySection.style.display = 'none';
      return;
    }

    // Pick first non-custom-status activity
    const act = activities.find(a => a.type !== 4) || null;
    if (!act) {
      if (activitySection) activitySection.style.display = 'none';
      return;
    }

    if (activitySection) activitySection.style.display = '';

    if (activityName) activityName.textContent = act.name || '';

    // Build detail lines
    const lines = [act.details, act.state].filter(Boolean);
    if (activityDetail) activityDetail.textContent = lines.join(' · ');

    // Activity icon
    if (activityIcon && act.application_id && act.assets?.large_image) {
      const imgKey = act.assets.large_image;
      let imgUrl = null;
      if (imgKey.startsWith('mp:external/')) {
        imgUrl = 'https://media.discordapp.net/external/' + imgKey.replace('mp:external/', '');
      } else {
        imgUrl = `${CDN}/app-assets/${act.application_id}/${imgKey}.webp?size=64`;
      }
      const iconImg = document.createElement('img');
      iconImg.src = imgUrl;
      iconImg.alt = act.name;
      activityIcon.innerHTML = '';
      activityIcon.appendChild(iconImg);
    }
  }

  function renderBadges(flags) {
    if (!badgesEl || !flags) return;
    badgesEl.innerHTML = '';

    // Discord flag → badge mapping
    const BADGE_MAP = [
      { flag: 1 << 0,  emoji: '👑', label: 'Discord Staff'             },
      { flag: 1 << 1,  emoji: '🤝', label: 'Partnered Server Owner'    },
      { flag: 1 << 2,  emoji: '🛡️', label: 'HypeSquad Events'          },
      { flag: 1 << 3,  emoji: '🐛', label: 'Bug Hunter Lv 1'           },
      { flag: 1 << 6,  emoji: '🏠', label: 'HypeSquad Bravery'         },
      { flag: 1 << 7,  emoji: '💡', label: 'HypeSquad Brilliance'      },
      { flag: 1 << 8,  emoji: '⚖️', label: 'HypeSquad Balance'         },
      { flag: 1 << 9,  emoji: '💎', label: 'Early Supporter'            },
      { flag: 1 << 14, emoji: '🐞', label: 'Bug Hunter Lv 2'           },
      { flag: 1 << 17, emoji: '✅', label: 'Early Verified Bot Dev'    },
      { flag: 1 << 18, emoji: '📜', label: 'Moderator Programs Alumni' },
      { flag: 1 << 22, emoji: '🤖', label: 'Active Developer'          },
    ];

    const found = BADGE_MAP.filter(b => (flags & b.flag) !== 0);
    found.forEach(b => {
      const div = document.createElement('div');
      div.className = 'discord-badge';
      div.setAttribute('data-tooltip', b.label);
      div.textContent = b.emoji;
      badgesEl.appendChild(div);
    });
  }

  async function fetchProfile() {
    try {
      const res = await fetch(LANYARD_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (!json.success) throw new Error('API returned success:false');

      const d = json.data;

      // Avatar
      setAvatar(d.discord_user?.avatar, USER_ID);

      // Names
      if (displayName) displayName.textContent = d.discord_user?.global_name || d.discord_user?.username || 'JDKCube';
      if (username)    username.textContent     = `@${d.discord_user?.username || 'jdkcube'}`;

      // Status
      applyStatus(d.discord_status || 'offline');

      // User ID (always known)
      if (uid) uid.textContent = USER_ID;

      // Badges
      if (d.discord_user?.public_flags !== undefined) {
        renderBadges(d.discord_user.public_flags);
      }

      // Activities
      renderActivity(d.activities || []);

      // Pronouns from Lanyard kv store (if set)
      if (d.kv?.pronouns && pronouns) {
        pronouns.textContent = d.kv.pronouns;
      }

      // Bio from kv (if set)
      if (d.kv?.bio && bioEl) {
        bioEl.textContent = d.kv.bio;
      }

    } catch (err) {
      console.warn('Lanyard fetch failed:', err.message);
      if (errorBanner) {
        errorBanner.textContent = 'Live Discord data unavailable — showing static profile.';
        errorBanner.classList.add('show');
      }
      // Fallback static state
      applyStatus('offline');
      if (displayName) displayName.textContent = 'JDKCube';
      if (username)    username.textContent     = '@jdkcube';
      if (uid)         uid.textContent          = USER_ID;
      if (activitySection) activitySection.style.display = 'none';
    }
  }

  // Run on load
  fetchProfile();

  // Poll every 30s for live updates
  setInterval(fetchProfile, 30000);
})();
