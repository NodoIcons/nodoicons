// POST /api/pro-style — one Nodo Icons Pro style for the Figma plugin.
// Body (form-encoded, so the plugin's request needs no CORS preflight): license_key, instance_id, style.
// The key must be a valid Lemon Squeezy license of the Nodo Icons store, activated on that instance;
// the style data comes from the private Blob store "nodo-pro" (pro/v1/<style>.json.gz, uploaded by hand).
import { get } from '@vercel/blob';

const STORE_ID = 512068;
const PRO_STYLES = new Set(['light', 'bold', 'sharp', 'twotone', 'duotone', 'bulk', 'solid', 'contained', 'soft']);
const CORS = { 'Access-Control-Allow-Origin': '*' }; // the plugin UI runs in a sandboxed iframe (origin "null")
const reply = (status, error) => Response.json({ error }, { status, headers: CORS });

export async function POST(request) {
  const form = new URLSearchParams(await request.text());
  const key = form.get('license_key') || '';
  const instance = form.get('instance_id') || '';
  const style = form.get('style') || '';
  if (!PRO_STYLES.has(style)) return reply(400, 'Unknown style.');
  if (!key || !instance) return reply(401, 'A license key and its activation are required.');

  const r = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ license_key: key, instance_id: instance }),
  });
  const v = await r.json().catch(() => ({}));
  if (!v.valid || v.meta?.store_id !== STORE_ID) return reply(403, 'This license is not valid for this installation.');

  const blob = await get(`pro/v1/${style}.json.gz`, { access: 'private' });
  if (!blob || blob.statusCode !== 200) return reply(404, 'Style not found.');
  return new Response(blob.stream, {
    headers: { ...CORS, 'Content-Type': 'application/json', 'Content-Encoding': 'gzip', 'Cache-Control': 'private, no-store' },
  });
}
