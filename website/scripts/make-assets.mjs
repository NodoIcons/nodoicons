// Brand assets for the website: favicon.svg, apple-touch-icon.png (180), og.png (1200×630), from release/brand.
//   node website/scripts/make-assets.mjs   → website/public/assets/
// Needs the compiled kit (../../dist/site-data) and Playwright for the two PNG screenshots.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { toSVG } from '../../src/render.js';

const ROOT = resolve(import.meta.dirname, '../..');
const ASSETS = resolve(import.meta.dirname, '../public/assets');
const solid = JSON.parse(readFileSync(join(ROOT, 'dist/site-data/solid.json'), 'utf8'));
const linear = JSON.parse(readFileSync(join(ROOT, 'dist/site-data/linear.json'), 'utf8'));
const glyph = (name, style, data, size, color) => toSVG({ styles: { [style]: { nodes: data[name] } } }, style, { size, color });

// Favicon: the Nodo Icons logo ("NO / DO" on a black tile, release/brand/nodo-logo.svg).
const { nodoWord } = await import('../../release/brand/proposals/logos5.mjs');
const favicon = readFileSync(join(ROOT, 'release/brand/nodo-logo.svg'), 'utf8');
const touch = nodoWord({ rx: 0 }); // iOS rounds the corners itself, so the touch icon is full-bleed
writeFileSync(join(ASSETS, 'favicon.svg'), favicon);

// Open Graph image: headline + a strip of icons, white, matches the landing hero.
const strip = ['home', 'search', 'bell', 'heart', 'camera', 'wallet', 'chat', 'calendar', 'lock', 'cloud', 'music', 'map', 'star', 'settings'];
const og = `<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;700&display=swap" rel="stylesheet"><style>
body{margin:0;width:1200px;height:630px;background:#fff;font-family:'Inter Tight',sans-serif;color:#1d1d1f;display:grid;place-items:center;overflow:hidden}
.c{text-align:center}.logo{display:inline-flex;align-items:center;gap:14px;font-size:30px;font-weight:700;letter-spacing:-.02em}
h1{font-size:96px;letter-spacing:-.05em;line-height:.95;margin:28px 0 18px}p{font-size:30px;color:#6e6e73;margin:0}
.row{display:flex;gap:30px;justify-content:center;margin-top:46px;color:#1d1d1f}.row svg:nth-child(3n){color:#0a84ff}</style></head><body><div class="c">
<div class="logo"><img src="favicon.svg" width="60" height="60">Nodo Icons</div><h1>5,000 icons.<br>Ten styles.</h1><p>React · Vue · SVG · Figma · AI agents — Linear style free</p>
<div class="row">${strip.map((n) => glyph(n, 'linear', linear, 40)).join('')}</div></div></body></html>`;
writeFileSync(join(ASSETS, '_og.html'), og);

// Playwright is not a dependency of the site: `npx playwright install chromium` once, then run with
// PLAYWRIGHT=<path to playwright/index.mjs> if the default npx cache location below does not match.
const { chromium } = await import(process.env.PLAYWRIGHT || '/Users/davide/.npm/_npx/9a46e323c0326ddf/node_modules/playwright/index.mjs');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.goto('file://' + join(ASSETS, '_og.html'), { waitUntil: 'networkidle' });
await p.screenshot({ path: join(ASSETS, 'og.png') });
await p.setViewportSize({ width: 180, height: 180 });
await p.setContent(`<body style="margin:0">${touch.replace('<svg ', '<svg width="180" height="180" ')}</body>`);
await p.waitForTimeout(200);
await p.screenshot({ path: join(ASSETS, 'apple-touch-icon.png'), omitBackground: true });
await b.close();
const { unlinkSync } = await import('node:fs');
unlinkSync(join(ASSETS, '_og.html'));
console.log('✓ favicon.svg, apple-touch-icon.png, og.png →', ASSETS);
