// Refreshes everything the website takes from the compiled icon kit (../../dist, produced by `npm run build`
// at the repository root). Re-run after every kit build:
//   node website/scripts/sync-from-kit.mjs      (or `npm run sync` inside website/)
//
//   public/data/index.json, public/data/linear.json   catalog + free Linear geometry (icon browser, SEO pages)
//   public/svg/linear/*.svg                           the free SVG downloads
//   public/sprites/**                                 Pro styles as WebP sprite sheets (see sprites.mjs)
//   landing/data/icons.json                           curated showcase icons + the sprite manifest
import { cpSync, copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildSprites } from './sprites.mjs';

const ROOT = resolve(import.meta.dirname, '../..');
const SITE = resolve(import.meta.dirname, '..');
const SRC = join(ROOT, 'dist/site-data');
const OUT = join(SITE, 'landing/data/icons.json');
const SPRITES = join(SITE, 'public/sprites');
const DATA = join(SITE, 'public/data');
const SVG = join(SITE, 'public/svg/linear');
const STYLES = ['linear', 'light', 'bold', 'sharp', 'twotone', 'duotone', 'bulk', 'solid', 'contained', 'soft'];

const NAMES = `
home search settings menu filter plus minus check close eye trash edit link share download upload
bell bell-dot mail mail-unread chat chat-unread send inbox user users user-circle calendar clock
heart star bookmark lock unlock shield shield-check key fingerprint face-id wallet credit-card
card-contactless coins bank piggy-bank chart-bar chart-line chart-pie chart-donut trending-up
trending-down money-transfer invoice exchange coin-bitcoin receipt cash qr-code scan folder file
file-text image images camera video music play pause microphone headphones phone smartphone laptop
monitor cloud wifi bluetooth battery-full location-pin map compass globe plane car bus train bicycle
cart shopping-bag gift tag ticket store package delivery-truck code terminal database server cpu
git-branch bug command layers pen-tool scissors ruler palette paintbrush color-wheel eyedropper
sun moon cloud-sun snowflake flame leaf droplet umbrella trophy target rocket award crown gem
lightbulb heart-pulse dumbbell running yoga cat dog paw sprout mountain tent sailboat hot-air-balloon
smile thumbs-up layout-dashboard sidebar-left sliders-horizontal more-horizontal arrow-right
arrow-up-right chevron-right chevron-down refresh log-out help info alert-triangle check-circle
history timer hourglass stopwatch headset video-call kanban table presentation notebook checklist
pushpin paperclip archive copy sparkles sparkle magic-wand ai-chat agent coffee pizza burger
home-key lamp sofa lightbulb thermostat smart-home planet atom flask graduation-cap dna
bold italic underline strikethrough align-left align-center align-right list-bullet list-ordered calculator
keyboard user-plus plus-circle more-vertical eye-off chevron-up-down chevron-left chevron-up book-open robot
play-circle undo redo at-sign external-link loader alert-circle toggle-right translate reply forward
code-block chart-area inbox-tray calendar-day grip-vertical bell-off mic-off hashtag
volume-high volume-low view-grid view-list bell-ring edit-square
`.split(/\s+/).filter(Boolean);

// 1 · catalog data and the free SVGs, straight from the kit
mkdirSync(DATA, { recursive: true });
for (const f of ['index.json', 'linear.json']) copyFileSync(join(SRC, f), join(DATA, f));
rmSync(SVG, { recursive: true, force: true });
cpSync(join(ROOT, 'dist/svg/linear'), SVG, { recursive: true });
console.log(`✓ public/data/{index,linear}.json and public/svg/linear/ refreshed from dist/`);

// 2 · the landing's showcase subset + Pro sprite sheets
const index = JSON.parse(readFileSync(join(SRC, 'index.json'), 'utf8'));
const known = new Map(index.icons.map(([n, c, t]) => [n, { category: c, tags: t }]));
const names = [...new Set(NAMES)].filter((n) => known.has(n) || (console.warn(`! missing icon: ${n}`), false));

const icons = Object.fromEntries(names.map((n, i) => [n, { name: n, ...known.get(n), i, styles: {} }]));
const okStyles = [];
for (const s of STYLES) {
  let data;
  try {
    data = JSON.parse(readFileSync(join(SRC, `${s}.json`), 'utf8'));
  } catch (e) {
    console.warn(`! skipped style ${s}: ${e.message}`);
    continue;
  }
  okStyles.push(s);
  if (s === 'linear') for (const n of names) icons[n].styles.linear = { nodes: data[n] };
}
const sprites = await buildSprites({ src: SRC, outDir: SPRITES, showcase: names, styles: okStyles.filter((s) => s !== 'linear') });

const out = {
  generated: new Date().toISOString(),
  count: index.icons.length,
  categories: new Set(index.icons.map(([, c]) => c)).size,
  styles: okStyles,
  sprites,
  icons,
};
writeFileSync(OUT, JSON.stringify(out));
console.log(`✓ ${names.length} icons × ${okStyles.length} styles → ${OUT} (${(JSON.stringify(out).length / 1024).toFixed(0)} KB)`);
