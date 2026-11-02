// Raster previews of the Pro styles (the website never ships Pro vectors).
// One WebP sprite sheet per style, used as a CSS mask so the icons still take the page colour:
//   showcase  sprites/<style>.<hash>.webp          the landing's showcase icons (names from sync-from-kit.mjs)
//   catalog   sprites/all/<style>-<nn>.<hash>.webp  all icons in index order, CHUNK per sheet (the browser)
// Layered styles (Twotone, Duotone, Bulk, Soft) get their secondary layer in a second band of rows
// below the first, with its opacity baked in, so it can take its own colour (--tint-2).
// Called by sync-from-kit.mjs; needs the compiled kit (../../dist/site-data) and the kit's renderer (../../src/render.js).
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { STYLE_INFO, rootAttrs, nodesToMarkup } from '../../src/render.js';

export const TILE = 64; // px per icon: crisp up to ~32 CSS px on 2× screens
const SHOW_COLS = 20;
const CHUNK = 250, CHUNK_COLS = 25;
const WEBP = { quality: 50, alphaQuality: 80, effort: 6 }; // only the alpha channel matters (the mask)

const attrs = (o) => Object.entries(o).map(([k, v]) => ` ${k}="${v}"`).join('');

async function sheet(names, data, style, cols) {
  const rows = Math.ceil(names.length / cols);
  const layered = Boolean(STYLE_INFO[style].layers);
  const root = attrs(rootAttrs(style));
  const cell = (nodes, i, band) => (nodes.length
    ? `<g transform="translate(${(i % cols) * TILE} ${(Math.floor(i / cols) + band * rows) * TILE}) scale(${TILE / 24})"${root}>${nodesToMarkup(nodes)}</g>`
    : '');
  let body = '';
  names.forEach((n, i) => {
    const nodes = data[n] || [];
    body += cell(nodes.filter(([, a]) => !a.opacity), i, 0);
    if (layered) body += cell(nodes.filter(([, a]) => a.opacity), i, 1); // keeps each node's own opacity
  });
  const W = cols * TILE, H = rows * TILE * (layered ? 2 : 1);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`.replaceAll('currentColor', '#000');
  const png = new Resvg(svg, { fitTo: { mode: 'original' } }).render().asPng();
  return { buf: await sharp(png).webp(WEBP).toBuffer(), rows };
}

function save(dir, base, buf) {
  const file = `${base}.${createHash('sha256').update(buf).digest('hex').slice(0, 8)}.webp`;
  writeFileSync(join(dir, file), buf);
  return file;
}

/** Writes every sheet into outDir (wiped first) and returns the manifest the page needs. */
export async function buildSprites({ src, outDir, showcase, styles }) {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(join(outDir, 'all'), { recursive: true });
  const all = JSON.parse(readFileSync(join(src, 'index.json'), 'utf8')).icons.map(([n]) => n);
  const manifest = { tile: TILE, show: { cols: SHOW_COLS, rows: Math.ceil(showcase.length / SHOW_COLS), files: {} }, all: { cols: CHUNK_COLS, chunk: CHUNK, rows: CHUNK / CHUNK_COLS, files: {} }, layered: [] };
  let bytes = 0, count = 0;
  for (const style of styles) {
    const data = JSON.parse(readFileSync(join(src, `${style}.json`), 'utf8'));
    if (STYLE_INFO[style].layers) manifest.layered.push(style);
    const show = await sheet(showcase, data, style, SHOW_COLS);
    manifest.show.files[style] = save(outDir, style, show.buf);
    bytes += show.buf.length; count++;
    manifest.all.files[style] = [];
    for (let k = 0; k * CHUNK < all.length; k++) {
      const part = all.slice(k * CHUNK, (k + 1) * CHUNK);
      while (part.length < CHUNK) part.push(''); // every chunk keeps the same grid
      const { buf } = await sheet(part, data, style, CHUNK_COLS);
      manifest.all.files[style].push(`all/${save(join(outDir, 'all'), `${style}-${String(k).padStart(2, '0')}`, buf)}`);
      bytes += buf.length; count++;
    }
    process.stdout.write(`  sprites: ${style} ✓\n`);
  }
  console.log(`✓ ${count} sprite sheets, ${(bytes / 1024 / 1024).toFixed(1)} MB → ${outDir}`);
  return manifest;
}
