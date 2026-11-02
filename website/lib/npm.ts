// Private npm registry for Nodo Icons Pro: https://nodoicons.com/npm/ (vercel.json rewrites /npm/* here).
// Buyers add to .npmrc:
//   @nodo-icons:registry=https://nodoicons.com/npm/
//   //nodoicons.com/npm/:_authToken=<license key>
// Pro packages (react-pro, vue-pro) need a valid Lemon Squeezy license key of the Nodo Icons store; the
// metadata and tarballs come from the private Blob store "nodo-pro" (pro/npm/, uploaded by release/npm-pro.mjs).
// Installs don't use license activations (CI and new machines would use them up); a refunded or disabled
// key stops working at once. The free packages of the scope are passed through to the public npm registry.
import { get } from '@vercel/blob';

const STORE_ID = 512068;
const PRO = new Set(['react-pro', 'vue-pro']);
const PUBLIC_REGISTRY = 'https://registry.npmjs.org';
const keys = new Map(); // license key → { ok, until }: Lemon Squeezy answers cached for 10 minutes

const json = (status, body, headers = {}) => Response.json(body, { status, headers: { 'Cache-Control': 'private, no-store', ...headers } });
const deny = (status, error) => json(status, { error }, status === 401 ? { 'WWW-Authenticate': 'Bearer realm="Nodo Icons Pro"' } : {});

async function licensed(key) {
  const hit = keys.get(key);
  if (hit && hit.until > Date.now()) return hit.ok;
  const r = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ license_key: key }),
  });
  const v = await r.json().catch(() => ({}));
  const ok = Boolean(v.valid && v.meta?.store_id === STORE_ID && !['disabled', 'expired'].includes(v.license_key?.status));
  keys.set(key, { ok, until: Date.now() + 10 * 60 * 1000 });
  return ok;
}

async function blob(path) {
  const b = await get(path, { access: 'private' });
  return b && b.statusCode === 200 ? b : null;
}

export async function GET(request) {
  const url = new URL(request.url);
  // "@nodo-icons/react-pro", "@nodo-icons%2freact-pro" or "@nodo-icons/react-pro/-/react-pro-0.1.0.tgz"
  const path = decodeURIComponent(url.searchParams.get('p') || '').replace(/^\/+/, '');
  const m = path.match(/^@nodo-icons\/([a-z0-9-]+)(?:\/-\/([a-z0-9.-]+\.tgz))?$/);
  if (!m) return deny(404, 'Not found.');
  const [, pkg, file] = m;

  // free packages of the scope: the public registry's metadata (its tarball links point to npmjs.org)
  if (!PRO.has(pkg)) {
    if (file) return Response.redirect(`${PUBLIC_REGISTRY}/@nodo-icons/${pkg}/-/${file}`, 302);
    const r = await fetch(`${PUBLIC_REGISTRY}/@nodo-icons%2f${pkg}`, { headers: { Accept: request.headers.get('accept') || 'application/json' } });
    return new Response(r.body, { status: r.status, headers: { 'Content-Type': r.headers.get('content-type') || 'application/json', 'Cache-Control': 'public, max-age=300' } });
  }

  const key = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!key) return deny(401, 'Nodo Icons Pro needs your license key in .npmrc: //nodoicons.com/npm/:_authToken=<license key>. See https://nodoicons.com/docs/');
  if (!(await licensed(key))) return deny(403, 'This license key is not valid for Nodo Icons Pro. Questions: support@nodoicons.com');
  console.log(JSON.stringify({ ev: 'npm', pkg, file: file || null, key: key.slice(0, 8), ip: request.headers.get('x-forwarded-for') || '' }));

  if (file) {
    if (!file.startsWith(`${pkg}-`)) return deny(404, 'Not found.');
    const b = await blob(`pro/npm/${file}`);
    if (!b) return deny(404, 'Not found.');
    return new Response(b.stream, { headers: { 'Content-Type': 'application/octet-stream', 'Cache-Control': 'private, no-store' } });
  }
  const b = await blob(`pro/npm/${pkg}.json`);
  if (!b) return deny(404, 'Not found.');
  const doc = (await new Response(b.stream).text()).replaceAll('__REGISTRY__', `${url.origin}/npm`);
  return new Response(doc, { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' } });
}
