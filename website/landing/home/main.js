import { KIT, STYLE_INFO, fmt, icon, hydrate, swapStyle } from '../shared/icons.js';
import { reveal, reduceMotion } from '../shared/scroll.js';
import { initBrowse } from './browse.js';
import { phone, desktop } from '../shared/mockups.js';
import { dropdown, command, notifications, toolbar, toasts, glassBar, glassScene, sidebarApp, dashboard, settingsForm } from '../shared/ui.js';

const $ = (s) => document.querySelector(s);
const slot = (n) => `<span data-ic="${n}"></span>`;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mob = () => innerWidth < 760;
const KITV = { ...KIT, 'styles-n': KIT.styles.length };
for (const el of document.querySelectorAll('[data-kit]')) el.textContent = fmt(KITV[el.dataset.kit]);

// Deterministic shuffle so the walls look varied but stable between reloads.
const FAV = ['home', 'search', 'bell', 'heart', 'camera', 'wallet', 'chat', 'calendar', 'lock', 'cloud', 'music', 'map', 'sparkles', 'user',
  'settings', 'star', 'rocket', 'mail', 'compass', 'gift', 'headphones', 'leaf', 'sun', 'cart', 'moon', 'image', 'play', 'folder', 'phone',
  'globe', 'trophy', 'key', 'flame', 'droplet', 'umbrella', 'coffee', 'plane', 'smartphone', 'laptop', 'microphone', 'bookmark', 'send',
  'shield-check', 'fingerprint', 'chart-pie', 'lightbulb', 'paw', 'crown', 'gem', 'target', 'tag', 'ticket', 'package', 'code', 'layers'];
const POOL = [...FAV, ...KIT.names.filter((n) => !FAV.includes(n))];
const pick = (k) => POOL[(k * 37) % POOL.length];

// ── 1 · Hero: concentric rings ───────────────────────────
// Rings start just outside the headline block and continue past the viewport corners. Each ring
// turns slowly (compositor-only transforms); icons counter-rotate to stay upright.
const LIT = ['#0a84ff', '#ff375f', '#30d158', '#ff9f0a', '#bf5af2', '#5ac8fa', '#ff453a', '#ffd60a'];
const LIT_STYLES = ['duotone', 'bulk', 'solid', 'duotone'];
let ringIcons = [];
function buildRings() {
  const hero = $('#hero'), copy = $('#hero-copy'), host = $('#rings');
  const W = hero.clientWidth, H = hero.clientHeight;
  const cb = copy.getBoundingClientRect();
  const small = W < 760;
  const size = small ? 20 : 26, gap = small ? 52 : 74, step = small ? 40 : 50;
  const halfDiag = Math.hypot(cb.width / 2, cb.height / 2);
  const r0 = small ? Math.max(cb.height / 2 + 24, 140) : halfDiag * 0.86 + 22;
  const rMax = Math.hypot(W, H) / 2 + size;
  // copy box relative to the rings' centre, padded: static rings skip slots that would sit on the text
  const cx = W / 2, cy = H / 2, hr = hero.getBoundingClientRect();
  const box = { l: cb.left - hr.left - cx - size, r: cb.right - hr.left - cx + size, t: cb.top - hr.top - cy - size, b: cb.bottom - hr.top - cy + size };
  const rings = [];
  for (let r = r0, i = 0; r < rMax; r += gap, i++) rings.push([r, i]);
  let k = 0;
  host.innerHTML = rings.map(([r, i]) => {
    const n = Math.max(8, Math.floor((2 * Math.PI * r) / step));
    const off = i % 2 ? 180 / n : 0;
    const spins = r > halfDiag + size; // rings that can never cross the headline keep turning
    const dur = 150 + i * 40;
    const dir = i % 2 ? 'reverse' : 'normal';
    const slots = Array.from({ length: n }, (_, j) => {
      const a = (360 / n) * j + off;
      const x = r * Math.cos((a * Math.PI) / 180), y = r * Math.sin((a * Math.PI) / 180);
      if (!spins && x > box.l && x < box.r && y > box.t && y < box.b) return '';
      return `<span class="slot" style="transform:rotate(${a}deg) translateX(${r.toFixed(1)}px) rotate(${-a}deg)"><span class="up"><span class="g" data-ic="${pick(k++ * 5 + 3)}"></span></span></span>`;
    }).join('');
    const fade = Math.max(0.16, 1 - i * 0.14);
    return `<div class="ring-s" style="--i:${i};--fade:${fade.toFixed(2)}"><i class="guide" style="--r:${r.toFixed(1)}px"></i><div class="ring${spins ? '' : ' still'}" style="--dur:${dur}s;--dir:${dir}">${slots}</div></div>`;
  }).join('');
  host.style.setProperty('--is', `${size}px`);
  hydrate(host);
  ringIcons = [...host.querySelectorAll('.g')].map((el) => ({ el, ring: +el.closest('.ring-s').style.getPropertyValue('--i') }));
}
buildRings();
let rz;
addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(buildRings, 200); });

// A few icons light up in turn: colour + a two-tone style, then back to black Linear.
function lightOne() {
  const pool = ringIcons.filter((o) => o.ring < 4 && !o.el.classList.contains('lit'));
  if (!pool.length) return;
  const { el } = pool[Math.floor(Math.random() * pool.length)];
  const r = el.getBoundingClientRect();
  if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return;
  const c = LIT[Math.floor(Math.random() * LIT.length)];
  el.style.setProperty('--tint', c);
  el.style.setProperty('--tint-2', c);
  el.innerHTML = icon(el.dataset.ic, LIT_STYLES[Math.floor(Math.random() * LIT_STYLES.length)]);
  el.classList.add('lit');
  setTimeout(() => {
    el.classList.remove('lit');
    setTimeout(() => { el.innerHTML = icon(el.dataset.ic, 'linear'); el.style.removeProperty('--tint'); el.style.removeProperty('--tint-2'); }, 500);
  }, 2400 + Math.random() * 1600);
}
if (!reduceMotion) setInterval(() => { if (scrollY < innerHeight) lightOne(); }, 240);
else for (let j = 0; j < 10; j++) lightOne();

// Leaving the hero: rings open outward and fade, headline drifts up.
const heroScroll = () => $('#hero').style.setProperty('--k', clamp(scrollY / innerHeight).toFixed(4));
addEventListener('scroll', heroScroll, { passive: true });
heroScroll();

// ── 2 · Style strip ──────────────────────────────────────
const STRIP = [['linear', '#f4f4f5', '#18181b'], ['light', '#eef4ff', '#1e3a8a'], ['bold', '#fff1ec', '#7c2d12'], ['sharp', '#f2f0ff', '#3b0764'],
  ['twotone', '#ecfdf3', '#14532d'], ['duotone', '#eff6ff', '#1d4ed8'], ['bulk', '#fdf2f8', '#9d174d'], ['solid', '#fefce8', '#713f12'], ['contained', '#f0fdfa', '#115e59'], ['soft', '#faf5ff', '#6b21a8']];
const stripCard = ([s, bg, fg]) => `<article class="sc" style="--bg:${bg};--fg:${fg}"><div class="sc-ic" data-style="${s}">${['home', 'chart-bar', 'bookmark', 'chat', 'camera', 'wallet'].map(slot).join('')}</div><b>${STYLE_INFO[s].label}</b><small class="mono">${STYLE_INFO[s].strokeWidth ? `${STYLE_INFO[s].strokeWidth}px stroke` : 'filled'}</small></article>`;
$('#strip').innerHTML = STRIP.map(stripCard).join('') + STRIP.map(stripCard).join('');

// ── Highlighter: walks through [data-item]s, marks one, optionally drives a tooltip ──
function highlighter(root, { selector = '[data-item]', every = 1500, onMove } = {}) {
  let items = [], k = -1, timer = null, alive = true;
  const refresh = () => { items = [...root.querySelectorAll(selector)].filter((el) => el.querySelector('[data-ic]') && el.offsetParent); };
  const step = () => {
    if (!items.length) refresh();
    if (!items.length) return;
    items[k]?.classList.remove('hl');
    k = (k + 1 + Math.floor(Math.random() * 2)) % items.length;
    const el = items[k];
    el.classList.add('hl');
    onMove?.(el, el.querySelector('[data-ic]'));
  };
  const io = new IntersectionObserver(([e]) => {
    clearInterval(timer);
    if (e.isIntersecting && alive && !reduceMotion) { step(); timer = setInterval(step, every); }
  }, { threshold: 0.25 });
  io.observe(root.closest('.tile') || root);
  return { refresh: () => { items.forEach((el) => el.classList.remove('hl')); k = -1; refresh(); }, stop: () => { alive = false; clearInterval(timer); io.disconnect(); } };
}
const styleNow = (el) => el.closest('[data-style]')?.dataset.style || 'linear';

// ── 3 · Showcase ─────────────────────────────────────────
const TABS = [
  { id: 'web', label: 'Web app', html: () => dashboard() },
  { id: 'settings', label: 'Settings', html: () => settingsForm() },
  { id: 'mail', label: 'Mail', html: () => desktop('mail'), sel: '.m-side a, .m-tools .m-iconbtn, .m-msg' },
  { id: 'mobile', label: 'Mobile', html: () => phone('settings') + phone('wallet'), sel: '.m-group li, .m-actions > div, .m-tabbar span, .m-list li, .m-profile' },
  { id: 'glass', label: 'Liquid Glass', html: () => glassScene() },
];
const stage = $('#show-stage'), tile = $('#show-tile');
let hl = null, tabTimer = null, current = 0;
// Small tooltip naming the icon in the highlighted row (same as the bento tiles).
function tipFor(host) {
  const tip = document.createElement('span');
  tip.className = 'tip';
  host.appendChild(tip);
  return (el, ic) => {
    const tr = host.getBoundingClientRect(), r = ic.getBoundingClientRect();
    tip.textContent = ic.dataset.ic;
    const half = tip.offsetWidth / 2 + 8; // keep the tooltip inside the tile
    const x = Math.max(half, Math.min(tr.width - half, r.left + r.width / 2 - tr.left));
    tip.style.transform = `translate(${x.toFixed(1)}px, ${(r.top - tr.top - 8).toFixed(1)}px) translate(-50%, -100%)`;
    tip.classList.add('on');
  };
}
const showTip = tipFor(tile);
function fitStage() {
  const comp = stage.firstElementChild;
  if (!comp) return;
  comp.style.zoom = 1;
  const w = comp.scrollWidth, h = comp.scrollHeight;
  const z = Math.min(1, (tile.clientWidth - 48) / w, (tile.clientHeight - 48) / h);
  comp.style.zoom = z.toFixed(3);
}
function showTab(i, user = false) {
  current = i;
  const t = TABS[i];
  tile.querySelector('.tip')?.classList.remove('on');
  stage.dataset.tab = t.id;
  stage.innerHTML = `<div class="comp comp-${t.id}">${t.html()}</div>`;
  hydrate(stage);
  fitStage();
  document.querySelectorAll('#show-tabs button').forEach((b, k) => b.classList.toggle('on', k === i));
  hl?.stop();
  hl = highlighter(stage, { selector: t.sel || '[data-item]', every: 1700, onMove: showTip });
  if (user) { clearInterval(tabTimer); tabTimer = null; }
}
$('#show-tabs').innerHTML = TABS.map((t) => `<button role="tab">${t.label}</button>`).join('');
$('#show-tabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) showTab([...b.parentNode.children].indexOf(b), true); });
showTab(innerWidth < 760 ? 3 : 0);
if (!reduceMotion) tabTimer = setInterval(() => { if (tile.getBoundingClientRect().top < innerHeight && tile.getBoundingClientRect().bottom > 0) showTab((current + 1) % TABS.length); }, 9000);
addEventListener('resize', fitStage);

// style switch: applies to the showcase and to every bento tile
const SEG = ['linear', 'sharp', 'duotone', 'bulk', 'solid', 'light'];
$('#style-seg').innerHTML = SEG.map((s) => `<button data-s="${s}" class="${s === 'linear' ? 'on' : ''}">${STYLE_INFO[s].label}</button>`).join('');
$('#style-seg').addEventListener('click', (e) => {
  const s = e.target.closest('button')?.dataset.s;
  if (!s) return;
  swapStyle(stage, s);
  swapStyle($('#bento'), s, { stagger: 4, max: 300 });
  document.querySelectorAll('#style-seg button').forEach((b) => b.classList.toggle('on', b.dataset.s === s));
});

// ── 4 · Bento ────────────────────────────────────────────
$('#b-menu-l').innerHTML = dropdown();
$('#b-menu-d').innerHTML = dropdown();
$('#b-cmd').innerHTML = command();
$('#b-card').innerHTML = notifications();
$('#b-sidebar').innerHTML = `<div class="ui tl-a">${sidebarApp()}</div><div class="ui dark tl-b">${sidebarApp()}</div>`;
$('#b-tools').innerHTML = toolbar();
$('#b-toasts').innerHTML = toasts();
$('#b-glass').innerHTML = glassBar();
$('#b-code').innerHTML = `<div class="code">
  <div class="code-tabs mono"><span class="on">React</span><span>Vue</span><span>HTML</span></div>
<pre><code><i class="k">import</i> { HomeIcon } <i class="k">from</i> <i class="s">'@nodo-icons/react/duotone'</i>;

<i class="t">&lt;HomeIcon</i> <i class="a">size</i>={24} <i class="a">color</i>=<i class="s">"currentColor"</i> <i class="a">strokeWidth</i>={1.5} <i class="a">title</i>=<i class="s">"Home"</i> <i class="t">/&gt;</i></code></pre>
  <div class="code-out"><span data-ic="home" data-style="duotone"></span><small class="mono">HomeIcon · duotone · 24</small></div>
</div>`;
const FORMATS = [['file', 'SVG'], ['pen-tool', 'Outlined SVG'], ['image', 'PNG 16–512'], ['file-text', 'PDF + catalog'], ['tag', 'Icon font'], ['layers', 'SVG sprite'], ['code', 'React'], ['command', 'Vue 3'], ['database', 'icons.json']];
$('#b-formats').innerHTML = `<div class="fmts">${FORMATS.map(([n, l]) => `<span class="fmt">${slot(n)}<b>${l}</b></span>`).join('')}</div>`;
hydrate($('#bento'));

// Each component tile walks through its rows; a small tooltip names the icon under focus.
document.querySelectorAll('#bento .cyc').forEach((t) => highlighter(t, { every: 1400 + Math.random() * 600, onMove: tipFor(t) }));

// Pro is sold in blocks of 10 people ($49 each in early access, then $99). Past 50 people Enterprise ($499) is cheaper.
let blocks = 1;
const renderSeats = () => {
  $('#seat-label').textContent = `${(blocks - 1) * 10 + 1}–${blocks * 10} people`;
  $('#pro-price').textContent = `$${49 * blocks}`;
  $('#pro-then').textContent = `then $${99 * blocks}`;
  $('#seat-minus').disabled = blocks === 1;
  $('#seat-plus').disabled = blocks === 5;
};
$('#seat-minus').addEventListener('click', () => { blocks = Math.max(1, blocks - 1); renderSeats(); });
$('#seat-plus').addEventListener('click', () => { blocks = Math.min(5, blocks + 1); renderSeats(); });
renderSeats();

// Early-access notify form. Until an email service is connected, it opens a pre-filled email to
// hello@nodoicons.com (nothing is stored by the page). Set NOTIFY_ENDPOINT to post to a form service instead.
const NOTIFY_ENDPOINT = '';
$('#notify').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const email = input.value.trim();
  if (NOTIFY_ENDPOINT) {
    try {
      await fetch(NOTIFY_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      $('#notify-ok').textContent = `Thanks — we'll write to ${email}.`;
      input.value = '';
    } catch { $('#notify-ok').textContent = 'Something went wrong — write to hello@nodoicons.com.'; }
    return;
  }
  location.href = `mailto:hello@nodoicons.com?subject=${encodeURIComponent('Nodo Icons early access')}&body=${encodeURIComponent(`Please notify ${email} when early access opens.`)}`;
  $('#notify-ok').textContent = 'Your email app opened a message to hello@nodoicons.com — send it and you are on the list.';
});
// Checkout links: filled in once the Lemon Squeezy products exist; until then they lead to the form.
const CHECKOUT = { pro: '', enterprise: '' };
document.querySelectorAll('[data-checkout]').forEach((a) => { if (CHECKOUT[a.dataset.checkout]) a.href = CHECKOUT[a.dataset.checkout]; });

// Nav switches to light glass over light sections.
const lightSecs = [...document.querySelectorAll('[data-nav="light"]')];
const navTheme = () => {
  const y = 38;
  const on = lightSecs.some((el) => { const r = el.getBoundingClientRect(); return r.top <= y && r.bottom >= y; });
  document.querySelector('.nav').classList.toggle('on-light', on);
};
addEventListener('scroll', navTheme, { passive: true });
navTheme();

hydrate();
initBrowse(document.querySelector('#icons'));
reveal();
