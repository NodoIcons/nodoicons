// Copy buttons, code tabs and the browse-page search.
const $ = (s, r = document) => r.querySelector(s);
document.addEventListener('click', async (e) => {
  const copy = e.target.closest('[data-copy]');
  if (copy) {
    const tpl = $(`#src-${copy.dataset.copy}`);
    const text = copy.dataset.copy === 'svg' ? tpl.innerHTML : tpl.content.textContent || tpl.innerHTML;
    try { await navigator.clipboard.writeText(text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')); } catch {}
    const label = copy.textContent; copy.textContent = 'Copied'; setTimeout(() => (copy.textContent = label), 1200);
  }
  const tab = e.target.closest('[data-tab]');
  if (tab) {
    tab.parentNode.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === tab));
    document.querySelectorAll('[data-pane]').forEach((p) => (p.hidden = p.dataset.pane !== tab.dataset.tab));
  }
});
const q = $('#q');
if (q) {
  let icons = [];
  const box = $('#results');
  const draw = () => {
    const words = q.value.toLowerCase().split(/\s+/).filter(Boolean);
    // name matches first (exact word, then prefix, then anywhere), tag/category matches after
    const rank = ([n]) => words.reduce((r, w) => r + (n.split('-').includes(w) ? 0 : n.startsWith(w) ? 1 : n.includes(w) ? 2 : 4), 0);
    const hits = words.length ? icons.filter(([n, c, t]) => words.every((w) => n.includes(w) || t.some((x) => x.includes(w)) || c === w)) : icons;
    const list = (words.length ? hits.map((i) => [rank(i), i]).sort((a, b) => a[0] - b[0]).map(([, i]) => i) : hits).slice(0, 300);
    box.innerHTML = list.map(([n]) => `<a class="cell" href="/icons/${n}/"><img src="/svg/linear/${n}.svg" alt="" loading="lazy" /><span>${n}</span></a>`).join('');
  };
  fetch('/icons/index.json').then((r) => r.json()).then((d) => { icons = d; draw(); });
  q.addEventListener('input', draw);
}
