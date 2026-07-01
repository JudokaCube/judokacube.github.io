/* ============================================
   Book of Dragons — script.js
   ============================================ */

'use strict';

document.addEventListener('DOMContentLoaded', function () {

/* ── Theme toggle (dark / light), shared storage key with the rest of the site ── */
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



/* ── Dragon data + grid ── */
try {
(function () {

  // Class badges now live locally as assets/<class>.png (the real HTTYD
  // class emblems, dropped in by hand) — this just maps each class name
  // to its filename and renders an <img>, sized/rounded by CSS depending
  // on where it's used (filter chip, class tag, or big tile icon).
  const CLASS_ICON_FILES = {
    Stoker: 'stoker.png',
    Sharp: 'sharp.png',
    Strike: 'strike.png',
    Tidal: 'tidal.png',
    Boulder: 'boulder.png',
    Tracker: 'tracker.png',
    Mystery: 'mystery.png',
  };

  function classIcon(cls) {
    const base = cls.split(' (')[0];
    const file = CLASS_ICON_FILES[base] || CLASS_ICON_FILES.Mystery;
    return `<img src="assets/${file}" alt="${base} class" loading="lazy" />`;
  }

  const dragons = [
    { name: 'Abomibumble', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'A lesser-documented species from the wider franchise (mobile games, comics or spin-offs); solid canon detail is still thin.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Armorwing', cls: 'Sharp', size: '≈ 6–12 m long (est.)', weight: '≈ 400–1,200 kg (est.)', behaviour: 'Curious and generally docile, with magnetic abilities tied to its metal-like hide.', appears: 'Race to the Edge' },
    { name: 'Barklethorn', cls: 'Sharp', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Mostly known from spin-off games and comics rather than the films or TV series, so confirmed details remain limited.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Bewilderbeast', cls: 'Tidal (Alpha)', size: '≈ 158 m long · 45.7 m wingspan', weight: '≈ 90,700 kg', behaviour: 'A calm, commanding alpha that controls and protects an entire dragon nest using ice breath.', appears: 'HTTYD 2 (2014)' },
    { name: 'Boneknapper', cls: 'Mystery', size: '≈ 12–20 m long (est.)', weight: '≈ 1,500–4,000 kg (est.)', behaviour: 'Elusive and almost mythical; camouflages itself with bones and is patient to the point of holding grudges.', appears: 'Legend of the Boneknapper Dragon (short)' },
    { name: 'Bonestormer', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Appears in the extended franchise outside the main films/series; specifics haven\\\'t been fleshed out much yet.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Boomback', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'One of the many species catalogued by the wider fandom rather than featured heavily on-screen; details are sparse.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Bubblegill', cls: 'Tidal', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'A lesser-documented species from the wider franchise (mobile games, comics or spin-offs); solid canon detail is still thin.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Bubblehorn', cls: 'Tidal', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Mostly known from spin-off games and comics rather than the films or TV series, so confirmed details remain limited.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Buffalord', cls: 'Tracker', size: '≈ 6–10 m long, thickset (est.)', weight: '≈ 1,500–4,000 kg (est.)', behaviour: 'Calm grazer that only turns defensive when provoked.', appears: 'Race to the Edge' },
    { name: 'Catastrophic Quaken', cls: 'Boulder', size: '≈ 12–20 m long (est.)', weight: '≈ 5,000–10,000 kg (est.)', behaviour: 'Territorial and easily startled; causes tremors when it stomps.', appears: 'Race to the Edge' },
    { name: 'Cavern Crasher', cls: 'Boulder', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Appears in the extended franchise outside the main films/series; specifics haven\\\'t been fleshed out much yet.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Changewing', cls: 'Mystery', size: '≈ 6–12 m long (est.)', weight: '≈ 400–1,200 kg (est.)', behaviour: 'Shy unless protecting its young, can camouflage and spits corrosive acid.', appears: 'Riders of Berk' },
    { name: 'Chaperang', cls: 'Tracker', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'One of the many species catalogued by the wider fandom rather than featured heavily on-screen; details are sparse.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Chillblaster', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'A lesser-documented species from the wider franchise (mobile games, comics or spin-offs); solid canon detail is still thin.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Chimeragon', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'A human-made hybrid dragon rather than a naturally occurring species, stitched together from traits of others.', appears: 'Extended franchise (games)' },
    { name: 'Copyclaw', cls: 'Sharp', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Appears in the extended franchise outside the main films/series; specifics haven\\\'t been fleshed out much yet.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Crimson Goregutter', cls: 'Sharp', size: '≈ 12–20 m long (est.)', weight: '≈ 400–1,200 kg (est.)', behaviour: 'Mostly peaceful grazer with large antler-like horns, but will fight fiercely if cornered.', appears: 'Race to the Edge' },
    { name: 'Crimson Howler', cls: 'Tracker', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'One of the many species catalogued by the wider fandom rather than featured heavily on-screen; details are sparse.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Crimson Slasher', cls: 'Sharp', size: '≈ 6–12 m long (est.)', weight: '≈ 400–1,200 kg (est.)', behaviour: 'Quick and aggressive, with blade-like claws built for slashing through dense brush.', appears: 'Race to the Edge' },
    { name: 'Deadly Nadder', cls: 'Sharp', size: '9.1 m long · 12.8 m wingspan', weight: '≈ 1,192 kg', behaviour: 'Vain and proud; loves attention and being praised, fires spines when threatened.', appears: 'How to Train Your Dragon (2010)' },
    { name: 'Deadly Spinner', cls: 'Sharp', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'A lesser-documented species from the wider franchise (mobile games, comics or spin-offs); solid canon detail is still thin.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Death Song', cls: 'Mystery', size: '≈ 12–20 m long (est.)', weight: '≈ 1,500–4,000 kg (est.)', behaviour: 'Predatory and dangerous when hungry, lures prey with a hypnotic song and traps them in amber.', appears: 'Race to the Edge' },
    { name: 'Deathgripper', cls: 'Strike', size: '≈ 12–20 m long (est.)', weight: '≈ 1,500–4,000 kg (est.)', behaviour: 'Highly aggressive and territorial, with a venomous stinger and crushing claws; very difficult to tame.', appears: 'HTTYD: The Hidden World (2019)' },
    { name: 'Devilish Dervish', cls: 'Mystery', size: '≈ 6–12 m long (est.)', weight: '≈ 400–1,200 kg (est.)', behaviour: 'Erratic, spinning flight pattern makes it hard to predict or pin down.', appears: 'Race to the Edge' },
    { name: 'Divewing', cls: 'Tidal', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Mostly known from spin-off games and comics rather than the films or TV series, so confirmed details remain limited.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Dramillion', cls: 'Tracker', size: '≈ 6–12 m long (est.)', weight: '≈ 50–300 kg (est.)', behaviour: 'Playful and mischievous, with unusually nimble limbs for climbing and grabbing.', appears: 'Race to the Edge' },
    { name: 'Egg Biter', cls: 'Sharp', size: 'Medium-sized, stockily built (est.)', weight: 'Not officially documented', behaviour: 'Bites the first thing it sees the moment it hatches and stays fiercely protective of its rider ever after; a sturdy, thick-tailed dragon that fires an especially hot blue flame.', appears: 'How to Train Your Dragon Live Spectacular (2012)' },
    { name: 'Eruptodon', cls: 'Boulder', size: '≈ 12–20 m long (est.)', weight: '≈ 5,000–10,000 kg (est.)', behaviour: 'A gentle giant that eats lava rock and sneezes fireballs when it has a cold.', appears: 'Race to the Edge' },
    { name: 'Evolved Scuttleclaw', cls: 'Tracker', size: '≈ 6–12 m long (est.)', weight: '≈ 400–1,200 kg (est.)', behaviour: 'A stronger, more vividly-patterned variant of the Scuttleclaw seen in spin-off games rather than the TV series.', appears: 'Extended franchise (mobile games)' },
    { name: 'Fastfin', cls: 'Tidal', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'One of the many species catalogued by the wider fandom rather than featured heavily on-screen; details are sparse.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Fathomfin', cls: 'Tidal', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'A lesser-documented species from the wider franchise (mobile games, comics or spin-offs); solid canon detail is still thin.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Fault Ripper', cls: 'Sharp', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Mostly known from spin-off games and comics rather than the films or TV series, so confirmed details remain limited.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Featherhide', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Appears in the extended franchise outside the main films/series; specifics haven\\\'t been fleshed out much yet.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Fire Fury', cls: 'Stoker', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'One of the many species catalogued by the wider fandom rather than featured heavily on-screen; details are sparse.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Fire Terror', cls: 'Stoker', size: 'Similar in size to a Night Terror (small)', weight: 'Not officially documented', behaviour: 'A red-hued Night Terror subspecies that lives in volcanic caves and eats fire and lava; hunts in packs but has a long-standing, protective bond with Eruptodon eggs.', appears: 'Race to the Edge ("Out of the Frying Pan")' },
    { name: 'Firefang', cls: 'Stoker', size: 'Medium-sized (est.)', weight: 'Not officially documented', behaviour: 'Normally placid and curious, burrowing into shorelines with only its heated head-frill and fangs showing; became infamous after Drago Bludvist unleashed an armored Firefang on a meeting of chiefs.', appears: 'HTTYD 2 (2014)' },
    { name: 'Fireworm', cls: 'Stoker', size: '≈ 5 cm long', weight: '≈ 0.34 kg', behaviour: 'Lives in large colonies and is placid unless its nest is disturbed.', appears: 'Riders of Berk' },
    { name: 'Fireworm Queen', cls: 'Stoker', size: 'Comparable in size to a Boneknapper', weight: '≈ 2,778 kg (queen); ≈ 2,722–3,629 kg (plain queen variants)', behaviour: 'Highly aggressive and territorial while guarding her nest and firecombs, but not malicious; her venom can reignite a fellow Stoker Class dragon\'s dying flame, as she did for Snotlout\'s Hookfang.', appears: 'Defenders of Berk ("Race to Fireworm Island")' },
    { name: 'Flame Thrower', cls: 'Stoker', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'A lesser-documented species from the wider franchise (mobile games, comics or spin-offs); solid canon detail is still thin.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Flame Whipper', cls: 'Stoker', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Mostly known from spin-off games and comics rather than the films or TV series, so confirmed details remain limited.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Flightmare', cls: 'Mystery', size: '≈ 6–12 m long (est.)', weight: '≈ 400–1,200 kg (est.)', behaviour: 'Eerie and nocturnal, glows and can freeze enemies in place with a paralyzing gaze.', appears: 'Race to the Edge' },
    { name: 'Flood Fang', cls: 'Tidal', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Appears in the extended franchise outside the main films/series; specifics haven\\\'t been fleshed out much yet.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Flyhopper', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'One of the many species catalogued by the wider fandom rather than featured heavily on-screen; details are sparse.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Foreverhorn', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'A lesser-documented species from the wider franchise (mobile games, comics or spin-offs); solid canon detail is still thin.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Foreverwing', cls: 'Tracker', size: '≈ 20–40 m long (est.)', weight: '≈ 20,000+ kg (est.)', behaviour: 'An ancient, long-lived species said to grow larger the longer it lives; generally reclusive.', appears: 'Race to the Edge' },
    { name: 'Gem Blaster', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Mostly known from spin-off games and comics rather than the films or TV series, so confirmed details remain limited.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Gembreaker', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Appears in the extended franchise outside the main films/series; specifics haven\\\'t been fleshed out much yet.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Gigantic Grumplumper', cls: 'Boulder', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'One of the many species catalogued by the wider fandom rather than featured heavily on-screen; details are sparse.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Glass Caster', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'A lesser-documented species from the wider franchise (mobile games, comics or spin-offs); solid canon detail is still thin.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Gobsucker', cls: 'Boulder', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Mostly known from spin-off games and comics rather than the films or TV series, so confirmed details remain limited.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Golden Dragon', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Appears in the extended franchise outside the main films/series; specifics haven\\\'t been fleshed out much yet.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Grapple Grounder', cls: 'Mystery', size: '≈ 6–12 m long (est.)', weight: '≈ 400–1,200 kg (est.)', behaviour: 'Cunning and opportunistic, uses a grappling-hook tail to snare prey.', appears: 'Race to the Edge' },
    { name: 'Grapple Snapper', cls: 'Mystery', size: '≈ 6–12 m long (est.)', weight: '≈ 400–1,200 kg (est.)', behaviour: 'Ambushes prey using strong jaws and a low, ground-hugging hunting style.', appears: 'Race to the Edge' },
    { name: 'Green Death', cls: 'Boulder (Queen)', size: '≈ 30–160 m long (est.)', weight: '≈ 20,000+ kg (est.)', behaviour: 'A giant hive-queen dragon in the same mold as the Red Death, appearing in the wider franchise outside the first film.', appears: 'Extended franchise (comics/games)' },
    { name: 'Grim Gnasher', cls: 'Stoker', size: '≈ 2–6 m long (est.)', weight: '≈ 50–300 kg (est.)', behaviour: 'Quick-tempered and snappy despite its small size, fiercely defends its space.', appears: 'Race to the Edge' },
    { name: 'Groncicle', cls: 'Boulder', size: '≈ 6–10 m long, thickset (est.)', weight: '≈ 1,500–4,000 kg (est.)', behaviour: 'A calm, slow-moving cousin of the Gronckle that breathes ice instead of fire.', appears: 'Race to the Edge' },
    { name: 'Gronckle', cls: 'Boulder', size: '4.5 m long · 5.5 m wingspan', weight: '≈ 2,596 kg', behaviour: 'Lazy and easygoing despite eating rocks; surprisingly strong fliers once moving.', appears: 'How to Train Your Dragon (2010)' },
    { name: 'Hackatoo', cls: 'Sharp', size: '≈ 6–12 m long (est.)', weight: '≈ 400–1,200 kg (est.)', behaviour: 'Restless and easily agitated, with sharp, axe-like head plating.', appears: 'Race to the Edge' },
    { name: 'Hideous Heatwing', cls: 'Stoker', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'A lesser-documented species from the wider franchise (mobile games, comics or spin-offs); solid canon detail is still thin.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Hideous Zippleback', cls: 'Mystery', size: '20.1 m long · 11.6 m wingspan', weight: '≈ 2,738 kg', behaviour: 'Mischievous and a little dim; the two heads have to work together to attack (gas + spark).', appears: 'How to Train Your Dragon (2010)' },
    { name: 'Hobblegrunt', cls: 'Tracker', size: '≈ 6–12 m long (est.)', weight: '≈ 400–1,200 kg (est.)', behaviour: 'Docile, herbivorous grazer, generally calm around others.', appears: 'Race to the Edge' },
    { name: 'Hobgobbler', cls: 'Tidal', size: '≈ 2–6 m long (est.)', weight: '≈ 50–300 kg (est.)', behaviour: 'Skittish scavenger that lives in burrows near water and steals food when it can.', appears: 'Race to the Edge' },
    { name: 'Hotburple', cls: 'Boulder', size: '≈ 4.3 m long · 5.5 m wingspan', weight: '≈ 2,596 kg', behaviour: 'Sleepy and slow-moving, mostly harmless unless woken suddenly.', appears: 'Race to the Edge' },
    { name: 'Jörmungandr', cls: 'Mystery', size: 'Unknown, said to be enormous', weight: 'Unknown', behaviour: 'A mythical serpent-dragon tied to Norse-inspired franchise lore rather than a confirmed, documented species.', appears: 'Referenced in franchise lore (mythical)' },
    { name: 'Large Shadow Wing', cls: 'Strike', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Appears in the extended franchise outside the main films/series; specifics haven\\\'t been fleshed out much yet.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Light Fury', cls: 'Strike', size: '≈ 2–6 m long (est.)', weight: '≈ 50–300 kg (est.)', behaviour: 'Wild and wary of humans; can turn invisible-ish via camouflage scales.', appears: 'HTTYD: The Hidden World (2019)' },
    { name: 'Luminous Krayfin', cls: 'Tidal', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'One of the many species catalogued by the wider fandom rather than featured heavily on-screen; details are sparse.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Lycanwing', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Treated by much of the fandom as a theoretical or unconfirmed species rather than an officially documented one.', appears: 'Disputed / theoretical (fan discussion)' },
    { name: 'Magma Breather', cls: 'Stoker', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Mostly known from spin-off games and comics rather than the films or TV series, so confirmed details remain limited.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Memorazor', cls: 'Sharp', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Appears in the extended franchise outside the main films/series; specifics haven\\\'t been fleshed out much yet.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Mimicore', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'One of the many species catalogued by the wider fandom rather than featured heavily on-screen; details are sparse.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Mist Twister', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'A lesser-documented species from the wider franchise (mobile games, comics or spin-offs); solid canon detail is still thin.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Moldruffle', cls: 'Boulder', size: '≈ 12–20 m long (est.)', weight: '≈ 1,500–4,000 kg (est.)', behaviour: 'Slow, gentle, and easily startled; camouflages well in forests and caves.', appears: 'Race to the Edge' },
    { name: 'Monstrous Nightmare', cls: 'Stoker', size: '18.6 m long · 20.7 m wingspan', weight: '≈ 2,268 kg', behaviour: 'Hot-tempered and aggressive at first, but becomes a stubbornly loyal companion once trained.', appears: 'How to Train Your Dragon (2010)' },
    { name: 'Mudraker', cls: 'Boulder', size: '≈ 6–12 m long (est.)', weight: '≈ 400–1,200 kg (est.)', behaviour: 'Placid and easily startled, prefers wallowing in mud over confrontation.', appears: 'Race to the Edge' },
    { name: 'Night Fury', cls: 'Strike', size: '7.9 m long · 13.7 m wingspan', weight: '≈ 806 kg', behaviour: 'Extremely rare and intelligent; cautious of strangers but fiercely loyal once bonded.', appears: 'How to Train Your Dragon (2010)' },
    { name: 'Night Terror', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Mostly known from spin-off games and comics rather than the films or TV series, so confirmed details remain limited.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Octofin', cls: 'Tidal', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Appears in the extended franchise outside the main films/series; specifics haven\\\'t been fleshed out much yet.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Piercing Shriekscale', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'One of the many species catalogued by the wider fandom rather than featured heavily on-screen; details are sparse.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Prickleboggle', cls: 'Tracker', size: '≈ 2–6 m long (est.)', weight: '≈ 50–300 kg (est.)', behaviour: 'Shy and quick to flee, using sharp quills as its main defense.', appears: 'Race to the Edge' },
    { name: 'Puffertail', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'A lesser-documented species from the wider franchise (mobile games, comics or spin-offs); solid canon detail is still thin.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Purple Death', cls: 'Boulder (Queen)', size: '≈ 30–160 m long (est.)', weight: '≈ 20,000+ kg (est.)', behaviour: 'Another massive hive-queen species, generally treated as distinct from the Red and Green Death by fans.', appears: 'Extended franchise (comics/games)' },
    { name: 'Raincutter', cls: 'Tidal', size: '≈ 12–20 m long (est.)', weight: '≈ 1,500–4,000 kg (est.)', behaviour: 'Playful and fast in water, propelled by powerful jets of water.', appears: 'Race to the Edge' },
    { name: 'Razortooth Metalmaw', cls: 'Sharp', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Appears in the extended franchise outside the main films/series; specifics haven\\\'t been fleshed out much yet.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Razorwhip', cls: 'Sharp', size: '≈ 12–20 m long (est.)', weight: '≈ 400–1,200 kg (est.)', behaviour: 'Proud and graceful in flight; fiercely loyal once a bond is formed.', appears: 'Riders of Berk' },
    { name: 'Red Death', cls: 'Boulder (Queen)', size: '≈ 121.9 m long · 167.6 m wingspan', weight: '≈ 9,979 kg', behaviour: 'A ruthless hive-queen that commands smaller dragons to feed it; territorial and dangerous.', appears: 'How to Train Your Dragon (2010)' },
    { name: 'Relentless Rainbowhorn', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'One of the many species catalogued by the wider fandom rather than featured heavily on-screen; details are sparse.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Relentless Razorwing', cls: 'Sharp', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'A lesser-documented species from the wider franchise (mobile games, comics or spin-offs); solid canon detail is still thin.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Ripwrecker', cls: 'Tidal', size: '≈ 12–20 m long (est.)', weight: '≈ 5,000–10,000 kg (est.)', behaviour: 'Slow but unstoppable, plows through obstacles and ship hulls alike.', appears: 'Race to the Edge' },
    { name: 'Roaming Ramblefang', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Mostly known from spin-off games and comics rather than the films or TV series, so confirmed details remain limited.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Rockspitter', cls: 'Boulder', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Appears in the extended franchise outside the main films/series; specifics haven\\\'t been fleshed out much yet.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Rumblehorn', cls: 'Boulder', size: '≈ 12–20 m long (est.)', weight: '≈ 5,000–10,000 kg (est.)', behaviour: 'Calm and dependable, with thick plating and a powerful tusked headbutt.', appears: 'Race to the Edge' },
    { name: 'Sand Wraith', cls: 'Tracker', size: '≈ 6–12 m long (est.)', weight: '≈ 400–1,200 kg (est.)', behaviour: 'Elusive and social in small groups, blends into sand and leaves a glowing trail.', appears: 'Race to the Edge' },
    { name: 'Sandbuster', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'One of the many species catalogued by the wider fandom rather than featured heavily on-screen; details are sparse.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Scauldron', cls: 'Tidal', size: '≈ 31.3 m long · 31.8 m wingspan', weight: '≈ 1,361 kg', behaviour: 'Patient ambush predator that blasts boiling water at prey.', appears: 'Riders of Berk' },
    { name: 'Screaming Death', cls: 'Boulder', size: '≈ 111 m long (est. from on-screen scale)', weight: 'Colossal (unpublished)', behaviour: 'An obsessive, relentless burrower related to the Whispering Death, known for its piercing screech.', appears: 'Defenders of Berk' },
    { name: 'Scuttleclaw', cls: 'Tracker', size: '≈ 6–12 m long (est.)', weight: '≈ 400–1,200 kg (est.)', behaviour: 'A camouflage-capable dragon used by Dagur the Deranged; blends into rocky terrain and strikes from ambush.', appears: 'Dragons: Race to the Edge' },
    { name: 'Sea Gronckle', cls: 'Tidal', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Mostly known from spin-off games and comics rather than the films or TV series, so confirmed details remain limited.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Seashocker', cls: 'Tidal', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Appears in the extended franchise outside the main films/series; specifics haven\\\'t been fleshed out much yet.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Sentinel', cls: 'Boulder', size: '≈ 12–20 m long (est.)', weight: '≈ 1,500–4,000 kg (est.)', behaviour: 'Guardian-like and protective of its territory, patient until provoked.', appears: 'Race to the Edge' },
    { name: 'Shellfire', cls: 'Stoker', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'One of the many species catalogued by the wider fandom rather than featured heavily on-screen; details are sparse.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Shivertooth', cls: 'Boulder', size: '≈ 12–20 m long (est.)', weight: '≈ 1,500–4,000 kg (est.)', behaviour: 'Mostly solitary and territorial, tunnels through rock like a mole.', appears: 'Race to the Edge' },
    { name: 'Shockjaw', cls: 'Tidal', size: '≈ 12–20 m long (est.)', weight: '≈ 1,500–4,000 kg (est.)', behaviour: 'Obsessive treasure-hoarder that stuns prey with an electric bite.', appears: 'Race to the Edge' },
    { name: 'Shocktail', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'A lesser-documented species from the wider franchise (mobile games, comics or spin-offs); solid canon detail is still thin.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Shovelhelm', cls: 'Boulder', size: '≈ 12–20 m long (est.)', weight: '≈ 1,500–4,000 kg (est.)', behaviour: 'A broad, shovel-headed digger Fishlegs briefly rode early in Race to the Edge before finding Meatlug\\\'s cousins elsewhere.', appears: 'Dragons: Race to the Edge' },
    { name: 'Silkspanner', cls: 'Sharp', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Appears in the extended franchise outside the main films/series; specifics haven\\\'t been fleshed out much yet.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Silver Phantom', cls: 'Stoker', size: '≈ 12–20 m long (est.)', weight: '≈ 400–1,200 kg (est.)', behaviour: 'Elusive and almost ghostlike in flight; rarely seen and highly intelligent.', appears: 'Extended franchise (HTTYD books & School of Dragons game)' },
    { name: 'Silver-tailed Ironclaw', cls: 'Sharp', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'One of the many species catalogued by the wider fandom rather than featured heavily on-screen; details are sparse.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Singetail', cls: 'Stoker', size: '≈ 6–12 m long (est.)', weight: '≈ 400–1,200 kg (est.)', behaviour: 'Hot-tempered and protective, capable of setting its own tails alight.', appears: 'Race to the Edge' },
    { name: 'Skrill', cls: 'Strike (Lightning)', size: 'Similar in size to a Scuttleclaw · ≈ 9.4 m wingspan', weight: 'Heavy (unpublished)', behaviour: 'Solitary and rare; channels lightning, considered one of the most powerful dragons.', appears: 'Defenders of Berk' },
    { name: 'Sky Torcher', cls: 'Stoker', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'A lesser-documented species from the wider franchise (mobile games, comics or spin-offs); solid canon detail is still thin.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Slinkwing', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Mostly known from spin-off games and comics rather than the films or TV series, so confirmed details remain limited.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Slippery Slickscale', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Appears in the extended franchise outside the main films/series; specifics haven\\\'t been fleshed out much yet.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Sliquifier', cls: 'Tidal', size: '≈ 6–12 m long (est.)', weight: '≈ 400–1,200 kg (est.)', behaviour: 'Coats prey and surfaces in a slick secretion to immobilize or escape danger.', appears: 'Race to the Edge' },
    { name: 'Slithersong', cls: 'Mystery', size: '≈ 6–12 m long (est.)', weight: '≈ 50–300 kg (est.)', behaviour: 'Uses a hypnotic singing call to lure and confuse prey before striking.', appears: 'Race to the Edge' },
    { name: 'Slitherwing', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'One of the many species catalogued by the wider fandom rather than featured heavily on-screen; details are sparse.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Slobber Smelter', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'A lesser-documented species from the wider franchise (mobile games, comics or spin-offs); solid canon detail is still thin.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Small Shadow Wing', cls: 'Strike', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Mostly known from spin-off games and comics rather than the films or TV series, so confirmed details remain limited.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Smothering Smokebreath', cls: 'Mystery', size: '≈ 1.8 m long · 3 m wingspan', weight: '≈ 64 kg', behaviour: 'Mischievous and a bit of a thief, hides in thick self-made smokescreens.', appears: 'Riders of Berk' },
    { name: 'Snafflefang', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Appears in the extended franchise outside the main films/series; specifics haven\\\'t been fleshed out much yet.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Snaptrapper', cls: 'Mystery', size: '≈ 12–20 m long (est.)', weight: '≈ 1,500–4,000 kg (est.)', behaviour: 'Territorial pack hunters that coordinate their many heads to corner prey.', appears: 'Riders of Berk' },
    { name: 'Snifflehide', cls: 'Tracker', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'One of the many species catalogued by the wider fandom rather than featured heavily on-screen; details are sparse.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Snifflehunch', cls: 'Tracker', size: '≈ 6–12 m long (est.)', weight: '≈ 50–300 kg (est.)', behaviour: 'Has an extraordinary sense of smell, used to track prey and other dragons over long distances.', appears: 'Race to the Edge' },
    { name: 'Snow Wraith', cls: 'Strike', size: '≈ 6–12 m long (est.)', weight: '≈ 400–1,200 kg (est.)', behaviour: 'Elusive and fiercely territorial, navigates icy terrain using heat-sensing instead of sight.', appears: 'Race to the Edge' },
    { name: 'Snowtail', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'A lesser-documented species from the wider franchise (mobile games, comics or spin-offs); solid canon detail is still thin.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Songwing', cls: 'Tracker', size: '≈ 6–12 m long (est.)', weight: '≈ 400–1,200 kg (est.)', behaviour: 'A tuneful, social dragon from the spin-off series set in its own corner of the wider dragon world.', appears: 'Dragons: Rescue Riders (spin-off)' },
    { name: 'Speed Stinger', cls: 'Tracker', size: '≈ 2–6 m long (est.)', weight: '≈ 50–300 kg (est.)', behaviour: 'Hunts in packs with a paralyzing sting; avoids deep water.', appears: 'Riders of Berk' },
    { name: 'Spiderwing', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Appears in the extended franchise outside the main films/series; specifics haven\\\'t been fleshed out much yet.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Stinger', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'One of the many species catalogued by the wider fandom rather than featured heavily on-screen; details are sparse.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Stinkwing', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'A lesser-documented species from the wider franchise (mobile games, comics or spin-offs); solid canon detail is still thin.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Stormcutter', cls: 'Tracker', size: '≈ 12–20 m long (est.)', weight: '≈ 1,500–4,000 kg (est.)', behaviour: 'Highly intelligent and family-oriented; very protective of its rider and kin.', appears: 'HTTYD 2 (2014)' },
    { name: 'Submaripper', cls: 'Tidal', size: '≈ 12–20 m long (est.)', weight: '≈ 1,500–4,000 kg (est.)', behaviour: 'A deep-sea ambush hunter rarely seen at the surface; aggressive toward anything that strays into its waters.', appears: 'Race to the Edge' },
    { name: 'Sweet Death', cls: 'Mystery', size: '≈ 12–20 m long (est.)', weight: '≈ 1,500–4,000 kg (est.)', behaviour: 'Lures victims in with an irresistibly sweet scent before trapping them in sticky resin.', appears: 'Race to the Edge' },
    { name: 'Swiftwing', cls: 'Strike', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Mostly known from spin-off games and comics rather than the films or TV series, so confirmed details remain limited.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Sword Stealer', cls: 'Sharp', size: '≈ 6–12 m long (est.)', weight: '≈ 400–1,200 kg (est.)', behaviour: 'Dagur the Deranged\\\'s original mount before Shattermaster; agile and blade-tailed, true to its Sharp-class roots.', appears: 'Dragons: Race to the Edge' },
    { name: 'Terrible Terror', cls: 'Stoker', size: '≈ 1.8 m long · 1.8 m wingspan', weight: '≈ 9 kg', behaviour: 'Feisty and sneaky, hunts and travels in swarms, has a venomous bite for its size.', appears: 'How to Train Your Dragon (2010)' },
    { name: 'Thornridge', cls: 'Sharp', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'One of the many species catalogued by the wider fandom rather than featured heavily on-screen; details are sparse.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Threadtail', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'A lesser-documented species from the wider franchise (mobile games, comics or spin-offs); solid canon detail is still thin.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Three-Wing Thrasher', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Mostly known from spin-off games and comics rather than the films or TV series, so confirmed details remain limited.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Thunderclaw', cls: 'Sharp', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Appears in the extended franchise outside the main films/series; specifics haven\\\'t been fleshed out much yet.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Thunderdrum', cls: 'Tidal', size: '≈ 20.7 m long · 16.3 m wingspan', weight: '≈ 408 kg', behaviour: 'Cautious around new people but loyal once trusted; stuns enemies with a sonic roar.', appears: 'Riders of Berk' },
    { name: 'Thunderpede', cls: 'Strike', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'One of the many species catalogued by the wider fandom rather than featured heavily on-screen; details are sparse.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Tide Glider', cls: 'Tidal', size: '≈ 6–12 m long (est.)', weight: '≈ 50–300 kg (est.)', behaviour: 'Calm and social, glides gracefully along the ocean surface in small groups.', appears: 'Race to the Edge' },
    { name: 'Timberjack', cls: 'Sharp', size: '≈ 18–25 m long (est.)', weight: '≈ 1,500–4,000 kg (est.)', behaviour: 'Aloof and territorial, can launch razor-edged wingblasts to fell trees and enemies alike.', appears: 'Race to the Edge' },
    { name: 'Tormentipede', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'A lesser-documented species from the wider franchise (mobile games, comics or spin-offs); solid canon detail is still thin.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Triple Stryke', cls: 'Strike', size: '≈ 12–20 m long (est.)', weight: '≈ 1,500–4,000 kg (est.)', behaviour: 'Aggressive and territorial; wields three tail stingers each with a different venom.', appears: 'Race to the Edge' },
    { name: 'Vine Tail', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Mostly known from spin-off games and comics rather than the films or TV series, so confirmed details remain limited.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Wave Glider', cls: 'Tidal', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Appears in the extended franchise outside the main films/series; specifics haven\\\'t been fleshed out much yet.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Whispering Death', cls: 'Boulder', size: '15.2 m long · 3 m wingspan', weight: 'Very heavy (unpublished)', behaviour: 'Relentless burrower with rings of teeth; territorial and dangerous underground.', appears: 'Riders of Berk' },
    { name: 'Whistling Windwing', cls: 'Strike', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'One of the many species catalogued by the wider fandom rather than featured heavily on-screen; details are sparse.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Whooping Whifflewing', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'A lesser-documented species from the wider franchise (mobile games, comics or spin-offs); solid canon detail is still thin.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Windgnasher', cls: 'Strike', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Mostly known from spin-off games and comics rather than the films or TV series, so confirmed details remain limited.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Windstriker', cls: 'Sharp', size: '≈ 12–20 m long (est.)', weight: '≈ 400–1,200 kg (est.)', behaviour: 'Peaceful but a capable fighter when provoked, breathes superheated air instead of flame and can dive-bomb foes head-on.', appears: 'How to Train Your Dragon 2 (2014)' },
    { name: 'Windwalker', cls: 'Tracker', size: '≈ 12–20 m long (est.)', weight: '≈ 1,500–4,000 kg (est.)', behaviour: 'Wise and ancient, said to be able to sense danger on the wind long before it arrives.', appears: 'Race to the Edge' },
    { name: 'Woodchipper', cls: 'Sharp', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'One of the many species catalogued by the wider fandom rather than featured heavily on-screen; details are sparse.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Woolly Howl', cls: 'Tracker', size: '≈ 12–20 m long (est.)', weight: '≈ 1,500–4,000 kg (est.)', behaviour: 'Cautious and family-oriented; flies almost silently thanks to its fur and sound-based stealth.', appears: 'Race to the Edge' },
    { name: 'Yetiwing', cls: 'Tracker', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'A lesser-documented species from the wider franchise (mobile games, comics or spin-offs); solid canon detail is still thin.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Zoomerang', cls: 'Mystery', size: 'Not officially documented', weight: 'Not officially documented', behaviour: 'Mostly known from spin-off games and comics rather than the films or TV series, so confirmed details remain limited.', appears: 'Extended franchise (games, comics & spin-offs)' },
    { name: 'Typhoomerang', cls: 'Stoker', size: '≈ 10.7 m long · 15.2 m wingspan', weight: '≈ 431 kg', behaviour: 'Ferociously protective parent, attacks in a spinning tornado of fire.', appears: 'Riders of Berk (‘The Terrible Twos’)' },
  ];

  const gridEl    = document.getElementById('dragonsGrid');
  const searchEl  = document.getElementById('dragonsSearch');
  const countEl   = document.getElementById('dragonsCount');
  const emptyEl   = document.getElementById('dragonsEmpty');
  const filterRow = document.getElementById('dragonsFilterRow');
  const sortRow   = document.getElementById('dragonsSortRow');
  if (!gridEl || !searchEl || !filterRow) return;

  // build class filter chips from the data itself, so it stays in sync
  const classNames = Array.from(new Set(dragons.map(d => d.cls.split(' (')[0]))).sort();
  classNames.forEach(cls => {
    const chip = document.createElement('button');
    chip.className = 'dragons-filter-chip';
    chip.dataset.class = cls;
    chip.innerHTML = `<span class="dragons-filter-chip-icon">${classIcon(cls)}</span><span>${cls}</span>`;
    filterRow.appendChild(chip);
  });

  let activeClass = 'all';
  let activeSort  = 'alpha';

  function sortDragons(list) {
    const sorted = list.slice();
    if (activeSort === 'class') {
      sorted.sort((a, b) => {
        const clsA = a.cls.split(' (')[0], clsB = b.cls.split(' (')[0];
        return clsA.localeCompare(clsB) || a.name.localeCompare(b.name);
      });
    } else if (activeSort === 'appears') {
      sorted.sort((a, b) => a.appears.localeCompare(b.appears) || a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }

  function cardHTML(d) {
    const icon = classIcon(d.cls);
    return `
      <article class="dragon-tile">
        <div class="dragon-tile-image">
          <span class="dragon-tile-image-icon">${icon}</span>
          <span class="dragon-tile-image-label">image coming soon</span>
        </div>
        <div class="dragon-tile-body">
          <div class="dragon-tile-head">
            <h3 class="dragon-tile-name">${d.name}</h3>
            <span class="dragon-tile-class"><span class="dragon-tile-class-icon">${icon}</span>${d.cls} Class</span>
          </div>
          <div class="dragon-tile-meta">
            <span><b>Size</b> ${d.size}</span>
            <span><b>Weight</b> ${d.weight}</span>
            <span><b>First appearance</b> ${d.appears}</span>
          </div>
          <p class="dragon-tile-behaviour">${d.behaviour}</p>
        </div>
      </article>
    `;
  }

  function render() {
    const q = searchEl.value.trim().toLowerCase();

    const filtered = dragons.filter(d => {
      const matchesClass = activeClass === 'all' || d.cls.split(' (')[0] === activeClass;
      const matchesQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.cls.toLowerCase().includes(q) ||
        d.appears.toLowerCase().includes(q);
      return matchesClass && matchesQuery;
    });

    if (countEl) countEl.textContent = `${filtered.length} / ${dragons.length}`;

    if (!filtered.length) {
      gridEl.innerHTML = '';
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    if (emptyEl) emptyEl.hidden = true;
    gridEl.innerHTML = sortDragons(filtered).map(cardHTML).join('');
  }

  searchEl.addEventListener('input', render);

  filterRow.addEventListener('click', (e) => {
    const chip = e.target.closest('.dragons-filter-chip');
    if (!chip) return;
    filterRow.querySelectorAll('.dragons-filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeClass = chip.dataset.class;
    render();
  });

  if (sortRow) {
    sortRow.addEventListener('click', (e) => {
      const chip = e.target.closest('.dragons-sort-chip');
      if (!chip) return;
      sortRow.querySelectorAll('.dragons-sort-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeSort = chip.dataset.sort;
      render();
    });
  }

  /* ── Random dragon spotlight ── */
  const randomBtn      = document.getElementById('dragonsRandomBtn');
  const spotlightBg     = document.getElementById('dragonsSpotlightBackdrop');
  const spotlightBody   = document.getElementById('dragonsSpotlightBody');
  const spotlightClose  = document.getElementById('dragonsSpotlightClose');
  const spotlightAgain  = document.getElementById('dragonsSpotlightAgain');

  function showRandomDragon() {
    const pick = dragons[Math.floor(Math.random() * dragons.length)];
    const icon = classIcon(pick.cls);
    spotlightBody.innerHTML = `
      <span class="dragons-spotlight-icon">${icon}</span>
      <span class="dragons-spotlight-eyebrow">your random dragon is…</span>
      <h3 class="dragons-spotlight-name">${pick.name}</h3>
      <span class="dragons-spotlight-class">${pick.cls} Class</span>
      <div class="dragons-spotlight-meta">
        <span><b>Size</b> ${pick.size}</span>
        <span><b>Weight</b> ${pick.weight}</span>
        <span><b>First appearance</b> ${pick.appears}</span>
      </div>
      <p class="dragons-spotlight-behaviour">${pick.behaviour}</p>
    `;
    if (spotlightBg) spotlightBg.hidden = false;
  }

  function hideSpotlight() {
    if (spotlightBg) spotlightBg.hidden = true;
  }

  if (randomBtn)     randomBtn.addEventListener('click', showRandomDragon);
  if (spotlightAgain) spotlightAgain.addEventListener('click', showRandomDragon);
  if (spotlightClose) spotlightClose.addEventListener('click', hideSpotlight);
  if (spotlightBg) {
    spotlightBg.addEventListener('click', (e) => {
      if (e.target === spotlightBg) hideSpotlight();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && spotlightBg && !spotlightBg.hidden) hideSpotlight();
  });

  render();
})();
} catch (e) { console.error('dragon grid setup failed:', e); }

});
