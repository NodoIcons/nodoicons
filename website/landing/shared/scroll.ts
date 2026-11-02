// Tiny scroll toolkit: reveal-on-enter and per-section progress (0→1) exposed as --p.

export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Adds .in to elements as they enter the viewport (once). */
export function reveal(selector = '.reveal', root = document) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
  );
  root.querySelectorAll(selector).forEach((el) => io.observe(el));
}

const tracked = [];
let ticking = false;
const clamp = (v) => Math.max(0, Math.min(1, v));

function measure() {
  ticking = false;
  const vh = innerHeight;
  for (const t of tracked) {
    const r = t.el.getBoundingClientRect();
    // 'pin'  : tall section with a sticky child; 0 when its top hits the viewport top, 1 when its bottom hits the viewport bottom
    // 'pass' : 0 when the element's top enters from below, 1 when its bottom leaves at the top
    const p = t.mode === 'pin'
      ? clamp(-r.top / Math.max(1, r.height - vh))
      : clamp((vh - r.top) / (vh + r.height));
    if (p === t.last) continue;
    t.last = p;
    t.el.style.setProperty('--p', p.toFixed(4));
    t.cb?.(p, t.el);
  }
}
const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(measure); } };
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);

/** Tracks el's scroll progress: sets --p on it and calls cb(p). */
export function progress(el, cb, mode = 'pin') {
  if (!el) return;
  tracked.push({ el, cb, mode, last: -1 });
  onScroll();
}

/** Global page progress (0 top → 1 bottom) as --page on <html>, plus optional callback. */
export function pageProgress(cb) {
  const el = document.documentElement;
  const f = () => {
    const p = clamp(scrollY / Math.max(1, el.scrollHeight - innerHeight));
    el.style.setProperty('--page', p.toFixed(4));
    cb?.(p);
  };
  addEventListener('scroll', () => requestAnimationFrame(f), { passive: true });
  f();
}
