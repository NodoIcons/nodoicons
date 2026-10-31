// "Browse every icon": all 5,000 icons in the free Linear style, searchable by name or tag, with a
// category filter and a style switcher. The nine other styles are Pro: they carry a PRO badge and are
// previewed only for the showcase icons bundled with the page (the full Pro data is not public).
// Data (/data/index.json + /data/linear.json, ~2 MB) loads only when the section comes into view.
import { KIT, STYLE_INFO, toSVG, icon, previewable, fmt } from '../shared/icons.js';

const PAGE = 210;
const FREE = 'linear';
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function initBrowse(root) {
  const $ = (s) => root.querySelector(s);
  const S = { q: '', cat: '', style: FREE, limit: PAGE, icons: [], nodes: null };

  $('#br-styles').innerHTML = KIT.styles.map((s) => `<button type="button" data-s="${s}" class="${s === FREE ? 'on' : ''}">${STYLE_INFO[s].label}${s === FREE ? '<span class="free">Free</span>' : '<span class="pro">Pro</span>'}</button>`).join('');

  const matches = () => {
    const words = S.q.toLowerCase().split(/\s+/).filter(Boolean);
    return S.icons.filter((i) => (!S.cat || i.category === S.cat) && (S.style === FREE || previewable(i.name, S.style)) && words.every((w) => i.hay.includes(w)));
  };
  const glyph = (name) => (S.style === FREE ? toSVG({ styles: { linear: { nodes: S.nodes[name] } } }, FREE, { size: 24 }).replace('<svg', '<svg class="ic" aria-hidden="true"') : icon(name, S.style));

  function render() {
    const list = matches();
    const shown = list.slice(0, S.limit);
    const pro = S.style !== FREE;
    $('#br-grid').innerHTML = shown.map((i) => `<button type="button" class="br-tile" data-n="${i.name}" title="${pro ? `${i.name} · ${STYLE_INFO[S.style].label} (Pro)` : `${i.name} · click to copy SVG`}">${pro ? '<span class="pro">Pro</span>' : ''}${glyph(i.name)}<span class="nm">${esc(i.name)}</span></button>`).join('');
    $('#br-more').hidden = list.length <= S.limit;
    $('#br-empty').hidden = list.length > 0;
    $('#br-count').textContent = pro
      ? `${fmt(list.length)} ${STYLE_INFO[S.style].label} previews · all ${fmt(KIT.count)} icons in Nodo Icons Pro`
      : `${fmt(list.length)} of ${fmt(S.icons.length)} icons · Linear is free (MIT) · click an icon to copy its SVG`;
  }

  $('#br-q').addEventListener('input', (e) => { S.q = e.target.value; S.limit = PAGE; render(); });
  $('#br-cat').addEventListener('change', (e) => { S.cat = e.target.value; S.limit = PAGE; render(); });
  $('#br-more').addEventListener('click', () => { S.limit += PAGE; render(); });
  $('#br-styles').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-s]'); if (!b) return;
    S.style = b.dataset.s; S.limit = PAGE;
    root.querySelectorAll('#br-styles button').forEach((x) => x.classList.toggle('on', x === b));
    render();
  });
  $('#br-grid').addEventListener('click', async (e) => {
    const t = e.target.closest('.br-tile'); if (!t) return;
    if (S.style !== FREE) { document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' }); return; }
    const svg = toSVG({ styles: { linear: { nodes: S.nodes[t.dataset.n] } } }, FREE, { size: 24 });
    try { await navigator.clipboard.writeText(svg); t.classList.add('copied'); setTimeout(() => t.classList.remove('copied'), 1100); } catch {}
  });

  async function load() {
    $('#br-count').textContent = 'Loading icons…';
    try {
      const [index, nodes] = await Promise.all([fetch('/data/index.json').then((r) => r.json()), fetch('/data/linear.json').then((r) => r.json())]);
      S.nodes = nodes;
      S.icons = index.icons.map(([name, category, tags]) => ({ name, category, hay: `${name.replace(/-/g, ' ')} ${tags.join(' ')} ${category}` }));
      const cats = [...new Set(S.icons.map((i) => i.category))].sort();
      $('#br-cat').innerHTML = `<option value="">All categories</option>${cats.map((c) => `<option value="${c}">${c[0].toUpperCase() + c.slice(1)}</option>`).join('')}`;
      render();
    } catch {
      $('#br-count').textContent = 'Could not load the icons. Reload the page to try again.';
    }
  }
  const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { io.disconnect(); load(); } }, { rootMargin: '600px 0px' });
  io.observe(root);
}
