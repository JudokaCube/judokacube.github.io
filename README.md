# JDKCube — Personal Website

A production-ready personal website built with HTML, CSS, and vanilla JavaScript.  
Designed for GitHub Pages deployment. No build step required.

## Structure

```
jdkcube/
├── index.html          ← Home
├── about.html          ← About / Interests
├── discord.html        ← Discord live profile
├── projects.html       ← Projects portfolio
├── css/
│   └── style.css       ← Full design system
├── js/
│   ├── nav.js          ← Navigation + animations
│   └── discord.js      ← Discord Lanyard API fetcher
├── assets/
│   └── favicon.svg
└── .nojekyll           ← Required for GitHub Pages
```

## Deploy to GitHub Pages

1. Push this folder's contents to a GitHub repo (e.g. `yourusername.github.io` or any repo)
2. Go to **Settings → Pages**
3. Set source to the branch containing these files (e.g. `main`, root `/`)
4. Done — GitHub Pages serves it automatically

## Discord Live Data

The Discord page uses the [Lanyard API](https://github.com/Phineas/lanyard) to fetch real-time presence data.

To show live activity/status:
- Join the [Lanyard Discord server](https://discord.gg/lanyard)
- Your presence will appear automatically within a few minutes

If Lanyard is unavailable, the profile displays a graceful static fallback.

## Tech Stack

- HTML5 · CSS3 (custom properties, glassmorphism, grid/flex)
- Vanilla JavaScript (ES2020+)
- Google Fonts: Inter + Space Grotesk
- Lanyard API for Discord presence (no auth key required)
