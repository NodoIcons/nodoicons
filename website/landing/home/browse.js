// "Browse every icon": all 5,000 icons, searchable by name or tag, with a category filter and a style
// switcher. Linear is free (MIT): drawn as SVG and copied on click. The nine other styles are Pro
// (badge on their tab) and are shown as image previews from sprite sheets (shared/icons.js).
// Data (/data/index.json + /data/linear.json, ~2 MB) loads when the section comes into view.
//   compact (landing section): at most one screen tall; "See all icons" links to /icons/ with the same filters
//   full (/icons/ page):        reads/writes the filters in the URL, "Show more" appends pages
import { KIT, STYLE_INFO, toSVG, catalogIcon, fmt } from '../shared/icons.js';

const PAGE = 240;
const FREE = 'linear';
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function initBrowse(root, { full = false } = {}) {
  const $ = (s) => root.querySelector(s);
  const url = new URLSearchParams(location.search);
  const S = { q: full ? url.get('q') || '' : '', cat: full ? url.get('cat') || '' : '', style: full && KIT.styles.includes(url.get('style')) ? url.get('style') : FREE, limit: PAGE, icons: [], nodes: null };
  $('#br-q').value = S.q;

  const chips = () => { $('#br-styles').innerHTML = KIT.styles.map((s) => `<button type="button" data-s="${s}" class="${s === S.style ? 'on' : ''}">${STYLE_INFO[s].label}${s === FREE ? '<span class="free">Free</span>' : '<span class="pro">Pro</span>'}</button>`).join(''); };
  chips();

  const matches = () => {
    const words = S.q.toLowerCase().split(/\s+/).filter(Boolean);
    return S.icons.filter((i) => (!S.cat || i.category === S.cat) && words.every((w) => i.hay.includes(w)));
  };
  const glyph = (i) => (S.style === FREE ? toSVG({ styles: { linear: { nodes: S.nodes[i.name] } } }, FREE, { size: 24 }).replace('<svg', '<svg class="ic" aria-hidden="true"') : catalogIcon(i.idx, S.style));
  const tile = (i) => `<button type="button" class="br-tile" data-n="${i.name}" title="${S.style === FREE ? `${i.name} · click to copy SVG` : `${i.name} · ${STYLE_INFO[S.style].label} (Pro)`}">${glyph(i)}<span class="nm">${esc(i.name)}</span></button>`;
  const query = () => { const p = new URLSearchParams(); if (S.q) p.set('q', S.q); if (S.cat) p.set('cat', S.cat); if (S.style !== FREE) p.set('style', S.style); return p.toString(); };

  // compact mode: how many tiles fit in the grid's box (one screen minus the section's chrome)
  const fits = () => {
    const g = $('#br-grid'); const probe = g.querySelector('.br-tile');
    if (!probe) return PAGE;
    const cols = getComputedStyle(g).gridTemplateColumns.split(' ').length;
    const gap = parseFloat(getComputedStyle(g).rowGap) || 0;
    const rows = Math.max(1, Math.floor((g.clientHeight + gap) / (probe.offsetHeight + gap)));
    return cols * rows;
  };

  function render() {
    const list = matches();
    const pro = S.style !== FREE;
    let shown = list.slice(0, full ? S.limit : PAGE);
    $('#br-grid').innerHTML = shown.map(tile).join('');
    if (!full) { const n = fits(); shown = list.slice(0, n); $('#br-grid').innerHTML = shown.map(tile).join(''); }
    const more = $('#br-more');
    // compact: keep the button's room even when hidden, so the grid height (and the fit) stays the same
    if (full) more.hidden = list.length <= shown.length;
    else { more.hidden = false; more.style.visibility = list.length > shown.length ? 'visible' : 'hidden'; }
    more.href = `/icons/${query() ? `?${query()}` : ''}`;
    more.textContent = full ? 'Show more' : `See all ${fmt(list.length)} icons`;
    $('#br-empty').hidden = list.length > 0;
    $('#br-count').textContent = pro
      ? `${fmt(list.length)} of ${fmt(S.icons.length)} icons · ${STYLE_INFO[S.style].label} is a Pro style · previews shown as images`
      : `${fmt(list.length)} of ${fmt(S.icons.length)} icons · Linear is free (MIT) · click an icon to copy its SVG`;
    if (full) history.replaceState(null, '', `${location.pathname}${query() ? `?${query()}` : ''}`);
  }

  $('#br-q').addEventListener('input', (e) => { S.q = e.target.value; S.limit = PAGE; render(); });
  $('#br-cat').addEventListener('change', (e) => { S.cat = e.target.value; S.limit = PAGE; render(); });
  $('#br-more').addEventListener('click', (e) => { if (!full) return; e.preventDefault(); S.limit += PAGE; render(); });
  $('#br-styles').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-s]'); if (!b) return;
    S.style = b.dataset.s; S.limit = PAGE; chips(); render();
  });
  $('#br-grid').addEventListener('click', async (e) => {
    const t = e.target.closest('.br-tile'); if (!t) return;
    if (S.style !== FREE) { location.href = '/#pricing'; return; }
    const svg = toSVG({ styles: { linear: { nodes: S.nodes[t.dataset.n] } } }, FREE, { size: 24 });
    try { await navigator.clipboard.writeText(svg); t.classList.add('copied'); setTimeout(() => t.classList.remove('copied'), 1100); } catch {}
  });

  async function load() {
    $('#br-count').textContent = 'Loading icons…';
    try {
      const [index, nodes] = await Promise.all([fetch('/data/index.json').then((r) => r.json()), fetch('/data/linear.json').then((r) => r.json())]);
      S.nodes = nodes;
      S.icons = index.icons.map(([name, category, tags], idx) => ({ name, category, idx, hay: `${name.replace(/-/g, ' ')} ${tags.join(' ')} ${category}` }));
      const cats = [...new Set(S.icons.map((i) => i.category))].sort();
      $('#br-cat').innerHTML = `<option value="">All categories</option>${cats.map((c) => `<option value="${c}"${c === S.cat ? ' selected' : ''}>${c[0].toUpperCase() + c.slice(1)}</option>`).join('')}`;
      render();
      if (!full) { let w = innerWidth, h = innerHeight; addEventListener('resize', () => { if (innerWidth !== w || innerHeight !== h) { w = innerWidth; h = innerHeight; render(); } }); }
    } catch {
      $('#br-count').textContent = 'Could not load the icons. Reload the page to try again.';
    }
  }
  if (full) load();
  else { const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { io.disconnect(); load(); } }, { rootMargin: '600px 0px' }); io.observe(root); }
}
