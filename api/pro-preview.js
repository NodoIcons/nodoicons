// GET /api/pro-preview?style=duotone&icon=heart&v=<sprite hash> — one Pro icon as a 192px PNG preview
// for the website's icon dialog (the sprite sheets are 64px per icon, too soft at 96 CSS px).
// The image is rasterised here from the private Blob store "nodo-pro", so no Pro vector leaves the server;
// the alpha channel is the icon (secondary layers keep their opacity), the page uses it as a CSS mask.
// Responses are immutable per `v` (the style's sprite hash), so the CDN renders each icon only once.
import { gunzipSync } from 'node:zlib';
import { get } from '@vercel/blob';
import { Resvg } from '@resvg/resvg-js';
import { rootAttrs, nodesToMarkup } from '../lib/render.js';

const PRO_STYLES = new Set(['light', 'bold', 'sharp', 'twotone', 'duotone', 'bulk', 'solid', 'contained', 'soft']);
const SIZE = 192;
const cache = new Map(); // style → { name: nodes }, kept while the function instance is warm

async function styleData(style) {
  if (!cache.has(style)) {
    cache.set(style, (async () => {
      const blob = await get(`pro/v1/${style}.json.gz`, { access: 'private' });
      if (!blob || blob.statusCode !== 200) throw new Error('missing style');
      const buf = Buffer.from(await new Response(blob.stream).arrayBuffer());
      return JSON.parse(gunzipSync(buf).toString('utf8'));
    })().catch((e) => { cache.delete(style); throw e; }));
  }
  return cache.get(style);
}

const attrs = (o) => Object.entries(o).map(([k, v]) => ` ${k}="${v}"`).join('');
const fail = (status, error) => Response.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });

export async function GET(request) {
  const q = new URL(request.url).searchParams;
  const style = q.get('style') || '', icon = q.get('icon') || '';
  if (!PRO_STYLES.has(style) || !/^[a-z0-9-]{1,64}$/.test(icon)) return fail(400, 'Unknown style or icon.');
  let data;
  try { data = await styleData(style); } catch { return fail(503, 'Preview unavailable.'); }
  const nodes = data[icon];
  if (!nodes) return fail(404, 'Unknown icon.');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 24 24"${attrs(rootAttrs(style))}>${nodesToMarkup(nodes)}</svg>`.replaceAll('currentColor', '#000');
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: SIZE } }).render().asPng();
  return new Response(png, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' },
  });
}
