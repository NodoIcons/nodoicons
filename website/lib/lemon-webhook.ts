// POST /api/lemon-webhook — count confirmed Nodo purchases in Vercel Web Analytics.
// Configure Lemon Squeezy to send only order_created events and set the same signing secret
// as LEMON_SQUEEZY_WEBHOOK_SECRET in the Vercel project environment.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { track } from '@vercel/analytics/server';

const STORE_ID = '512068';
const PRODUCTS = new Map([
  [String(process.env.LEMON_SQUEEZY_PRO_PRODUCT_ID || '1490891'), 'pro'],
  [String(process.env.LEMON_SQUEEZY_ENTERPRISE_PRODUCT_ID || '1490899'), 'enterprise'],
]);
const reply = (status, body) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret) return reply(503, { error: 'Webhook secret is not configured.' });

  const rawBody = await request.text();
  const signature = request.headers.get('x-signature') || '';
  const digest = createHmac('sha256', secret).update(rawBody).digest('hex');
  const expected = Buffer.from(digest, 'utf8');
  const received = Buffer.from(signature, 'utf8');
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return reply(401, { error: 'Invalid signature.' });
  }

  let payload;
  try { payload = JSON.parse(rawBody); } catch { return reply(400, { error: 'Invalid JSON payload.' }); }
  if (payload?.meta?.event_name !== 'order_created') return reply(200, { ok: true, ignored: true });

  const order = payload?.data?.attributes;
  if (payload?.data?.type !== 'orders' || String(order?.store_id) !== STORE_ID) {
    return reply(200, { ok: true, ignored: true });
  }

  const productName = String(order.product_name || '').toLowerCase();
  const plan = PRODUCTS.get(String(order.product_id))
    || (productName.includes('enterprise') ? 'enterprise' : productName.includes('pro') ? 'pro' : undefined);
  if (!plan) return reply(200, { ok: true, ignored: true });

  await track('purchase', {
    plan,
    currency: String(order.currency || 'USD'),
    amount_cents: Number(order.total) || 0,
    mode: order.test_mode ? 'test' : 'live',
  });
  return reply(200, { ok: true });
}
