// POST /api/notify — early-access waitlist. Body (JSON): { email, company }  (`company` is a honeypot: humans leave it empty)
// Each address is one private blob, waitlist/<sha256 of the address>.json, in the Blob store "nodo-pro": signing up twice
// keeps one entry and the first sign-up date. Nothing else is stored (no IP, no user agent).
// Export: sh release/waitlist-export.sh
import { createHash } from 'node:crypto';
import { get, put } from '@vercel/blob';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const reply = (status, body) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request) {
  let data;
  try { data = await request.json(); } catch { return reply(400, { error: 'Send a JSON body.' }); }
  const email = String(data?.email || '').trim().toLowerCase();
  if (data?.company) return reply(200, { ok: true }); // bot: pretend it worked, store nothing
  if (email.length > 254 || !EMAIL.test(email)) return reply(400, { error: 'Enter a valid email address.' });

  const path = `waitlist/${createHash('sha256').update(email).digest('hex')}.json`;
  const old = await get(path, { access: 'private' }).catch(() => null);
  if (old?.statusCode === 200) return reply(200, { ok: true, already: true });
  await put(path, JSON.stringify({ email, at: new Date().toISOString(), source: 'nodoicons.com early access', consent: 'early-access emails' }), {
    access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true,
  });
  return reply(200, { ok: true });
}
