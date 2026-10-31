// Pricing cards and the early-access form (shadcn Card, Badge, Button, Input).
import { useState } from 'react';
import { fmt } from '../shared/icons.js';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NdIcon } from '@/components/nd-icon';

// Checkout links: filled in once the Lemon Squeezy products are live; until then they lead to the form.
export const CHECKOUT = { pro: '', enterprise: '' };
// Early-access form: until an email service is connected it opens a pre-filled email to hello@nodoicons.com
// (nothing is stored by the page). Set NOTIFY_ENDPOINT to post to a form service instead.
const NOTIFY_ENDPOINT = '';

function Incl({ items, dark }) {
  return (
    <ul className="mt-1 mb-2 grid gap-2 text-[15px]">
      {items.map((t) => <li key={t} className="relative pl-[22px] before:absolute before:left-0 before:font-bold before:text-brand before:content-['✓']">{t}</li>)}
    </ul>
  );
}
const Price = ({ value, note }) => (
  <div className="flex items-baseline gap-2.5"><b className="text-[60px] leading-none font-bold tracking-[-0.05em]">{value}</b><span className="text-[15px] text-zinc-400">{note}</span></div>
);
const planCls = 'gap-3 rounded-[22px] border-0 py-7 shadow-none ring-0 [--card-spacing:28px]';

export function Plans({ count }) {
  // Pro is sold in blocks of 10 people ($49 each in early access, then $99). Past 50 people Enterprise ($499) is cheaper.
  const [blocks, setBlocks] = useState(1);
  return (
    <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
      <Card className={planCls}>
        <CardHeader className="gap-3"><p className="mono text-muted-foreground">Free</p><Price value="$0" note="MIT license" /></CardHeader>
        <CardContent className="flex flex-col gap-3"><p className="text-muted-foreground">The Linear style, free forever.</p>
          <Incl items={[`All ${fmt(count)} icons in Linear`, 'SVG + React & Vue packages', 'Use anywhere, no attribution']} /></CardContent>
        <CardFooter className="mt-auto"><Button asChild variant="secondary" size="pill" className="bg-white hover:bg-white/80"><a href="/docs/">Coming at launch</a></Button></CardFooter>
      </Card>
      <Card className={`${planCls} dark bg-[#18181b] text-zinc-50`}>
        <CardHeader className="gap-3">
          <p className="mono flex items-center gap-2 text-zinc-400">Pro <Badge className="bg-brand text-[10px] text-white">Early access</Badge></p>
          <Price value={`$${49 * blocks}`} note={`then $${99 * blocks}`} />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div role="group" aria-label="Team size" className="inline-flex w-fit items-center gap-1 rounded-full bg-white/10 p-1">
            <Button variant="secondary" size="icon-sm" aria-label="Fewer people" disabled={blocks === 1} onClick={() => setBlocks((b) => Math.max(1, b - 1))} className="rounded-full bg-white/15 text-base text-white hover:bg-white/25">−</Button>
            <span className="min-w-[120px] text-center text-sm">{(blocks - 1) * 10 + 1}–{blocks * 10} people</span>
            <Button variant="secondary" size="icon-sm" aria-label="More people" disabled={blocks === 5} onClick={() => setBlocks((b) => Math.min(5, b + 1))} className="rounded-full bg-white/15 text-base text-white hover:bg-white/25">+</Button>
          </div>
          <Incl items={['All 10 styles, every format', 'React & Vue packages', 'Commercial & client work', 'Free updates, forever']} />
        </CardContent>
        <CardFooter className="mt-auto"><Button asChild variant="brand" size="pill"><a href={CHECKOUT.pro || '#notify'}>Get early access</a></Button></CardFooter>
      </Card>
      <Card className={planCls}>
        <CardHeader className="gap-3"><p className="mono text-muted-foreground">Enterprise</p><Price value="$499" note="one-time" /></CardHeader>
        <CardContent className="flex flex-col gap-3"><p className="text-muted-foreground">Your whole company, unlimited people.</p>
          <Incl items={['Everything in Pro', 'Unlimited people', 'Extended license: templates & UI kits', 'Invoice, procurement, custom icons']} /></CardContent>
        <CardFooter className="mt-auto"><Button asChild size="pill"><a href={CHECKOUT.enterprise || 'mailto:enterprise@nodoicons.com?subject=Nodo%20Icons%20Enterprise'}>Buy Enterprise</a></Button></CardFooter>
      </Card>
    </div>
  );
}

export function Notify() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    const v = email.trim();
    if (NOTIFY_ENDPOINT) {
      try {
        await fetch(NOTIFY_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: v }) });
        setMsg(`Thanks — we'll write to ${v}.`); setEmail('');
      } catch { setMsg('Something went wrong — write to hello@nodoicons.com.'); }
      return;
    }
    location.href = `mailto:hello@nodoicons.com?subject=${encodeURIComponent('Nodo Icons early access')}&body=${encodeURIComponent(`Please notify ${v} when early access opens.`)}`;
    setMsg('Your email app opened a message to hello@nodoicons.com — send it and you are on the list.');
  };
  return (
    <form id="notify" onSubmit={submit} className="mt-4 grid grid-cols-[1fr_minmax(240px,320px)_auto] items-center gap-3 rounded-[22px] border border-border py-[18px] pr-[18px] pl-6 max-[900px]:grid-cols-1 max-[900px]:p-[18px]">
      <div className="grid gap-0.5"><b>Early access opens soon.</b><span className="text-[15px] text-muted-foreground">Leave your email: we write once when checkout opens, and once before early access ends.</span></div>
      <label className="relative">
        <NdIcon name="mail" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" aria-label="Email" className="h-11 rounded-full pl-10 text-[15px] md:text-[15px]" />
      </label>
      <Button type="submit" size="pill">Notify me</Button>
      {msg && <p role="status" className="col-span-full text-sm text-green-700">{msg}</p>}
    </form>
  );
}
