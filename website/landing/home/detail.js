// Icon detail modal (icon browser): big preview, the icon in all ten styles, size / colour / stroke,
// copy and download for the free Linear style, and how to use it (React, Vue, SVG, sprite, font, AI agents).
// Pro styles are image previews only (shared/icons.js): their tab shows the Pro paths and an unlock link.
import { STYLE_INFO, KIT, toSVG, icon, catalogIcon, componentName } from '../shared/icons.js';

const FREE = 'linear';
const SIZES = [16, 20, 24, 32, 40, 48, 64, 96, 128, 256, 512];
const TABS = [['react', 'React'], ['vue', 'Vue'], ['svg', 'SVG'], ['sprite', 'Sprite'], ['font', 'Icon font'], ['ai', 'AI agents']];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const title = (s) => s[0].toUpperCase() + s.slice(1);

let dlg, $, D; // the <dialog>, its query helper, the current state

/**
 * Opens the modal. `list` is the browser's current result list (for ←/→ and "more in category"),
 * `all` every icon ({name, category, tags, idx}), `nodes` the Linear geometry (/data/linear.json).
 * onChange(name|null, style) lets the page mirror the open icon in its URL.
 */
export function openDetail({ item, style, list, all, nodes, onChange = () => {} }) {
  if (!dlg) build();
  const prev = D;
  D = { item, style, list, all, nodes, onChange, size: prev?.size ?? 24, color: prev?.color ?? '', stroke: prev?.stroke ?? 1.5, tab: prev?.tab ?? 'react' };
  render();
  if (!dlg.open) { dlg.showModal(); $('#dt-name').focus(); } // focus the title, not the first button
  onChange(item.name, style);
}

const linearSVG = (name, { size = 24, color = 'currentColor', stroke } = {}) =>
  toSVG({ styles: { linear: { nodes: D.nodes[name] } } }, FREE, { size, color, strokeWidth: stroke });
const glyph = (it, style) => (style === FREE ? linearSVG(it.name).replace('<svg', '<svg class="ic" aria-hidden="true"') : catalogIcon(it.idx, style));

function build() {
  dlg = document.createElement('dialog');
  dlg.className = 'dt';
  dlg.setAttribute('aria-labelledby', 'dt-name');
  dlg.innerHTML = `
  <div class="dt-head">
    <nav class="dt-crumbs" id="dt-crumbs"></nav>
    <div class="dt-head-btns">
      <button type="button" class="dt-ib" data-act="link" title="Copy link to this icon" aria-label="Copy link">${icon('link')}</button>
      <button type="button" class="dt-ib" data-act="close" title="Close (Esc)" aria-label="Close">${icon('close')}</button>
    </div>
  </div>
  <div class="dt-main">
    <div class="dt-stage">
      <div class="dt-preview" id="dt-preview"></div>
      <button type="button" class="dt-ib dt-prev" data-act="prev" aria-label="Previous icon" title="Previous (←)">${icon('chevron-left')}</button>
      <button type="button" class="dt-ib dt-next" data-act="next" aria-label="Next icon" title="Next (→)">${icon('chevron-right')}</button>
    </div>
    <div class="dt-info">
      <div class="dt-title"><h3 id="dt-name" tabindex="-1"></h3><button type="button" class="dt-ib sm" data-act="copy-name" title="Copy component name" aria-label="Copy component name">${icon('copy')}</button><span id="dt-tier"></span></div>
      <p class="dt-tags" id="dt-tags"></p>
      <div class="dt-controls">
        <label class="dt-ctl"><span>Size</span><select id="dt-size">${SIZES.map((s) => `<option value="${s}">${s}px</option>`).join('')}</select></label>
        <label class="dt-ctl dt-color"><span>Color</span><input type="color" id="dt-color" value="#1d1d1f" /><b id="dt-color-v">currentColor</b><button type="button" data-act="reset-color" title="Back to currentColor" aria-label="Reset color">↺</button></label>
        <label class="dt-ctl dt-stroke" id="dt-stroke-wrap"><span>Stroke</span><input type="range" id="dt-stroke" min="0.5" max="3" step="0.25" /><b id="dt-stroke-v"></b></label>
      </div>
      <div class="dt-actions" id="dt-actions"></div>
    </div>
  </div>
  <div class="dt-block">
    <p class="dt-label">Styles</p>
    <div class="dt-styles" id="dt-styles"></div>
  </div>
  <div class="dt-block">
    <div class="dt-tabs" id="dt-tabs" role="tablist">${TABS.map(([k, l]) => `<button type="button" role="tab" data-tab="${k}">${l}</button>`).join('')}</div>
    <div class="dt-code"><pre><code id="dt-code"></code></pre><button type="button" class="dt-copy" data-act="copy-code">Copy</button></div>
    <p class="dt-note" id="dt-note"></p>
  </div>
  <div class="dt-block">
    <p class="dt-label" id="dt-rel-label"></p>
    <div class="dt-related" id="dt-related"></div>
  </div>`;
  document.body.append(dlg);
  $ = (s) => dlg.querySelector(s);

  dlg.addEventListener('close', () => D.onChange(null, D.style));
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) return dlg.close(); // backdrop
    const a = e.target.closest('[data-act]')?.dataset.act;
    const st = e.target.closest('[data-style]')?.dataset.style;
    const rel = e.target.closest('[data-rel]')?.dataset.rel;
    const tab = e.target.closest('[data-tab]')?.dataset.tab;
    if (st) { D.style = st; render(); D.onChange(D.item.name, st); }
    else if (rel) go(D.all.find((i) => i.name === rel));
    else if (tab) { D.tab = tab; renderCode(); }
    else if (a === 'close') dlg.close();
    else if (a === 'prev' || a === 'next') step(a === 'next' ? 1 : -1);
    else if (a === 'link') copy(e.target.closest('button'), `${location.origin}/icons/?icon=${D.item.name}${D.style === FREE ? '' : `&style=${D.style}`}`);
    else if (a === 'copy-name') copy(e.target.closest('button'), componentName(D.item.name));
    else if (a === 'copy-code') copy(e.target.closest('button'), $('#dt-code').textContent);
    else if (a === 'copy-svg') copy(e.target.closest('button'), svgOut());
    else if (a === 'dl-svg') save(new Blob([svgOut()], { type: 'image/svg+xml' }), `${D.item.name}.svg`);
    else if (a === 'dl-png') png();
    else if (a === 'reset-color') { D.color = ''; render(); }
  });
  dlg.addEventListener('keydown', (e) => {
    if (e.target.matches('input, select')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });
  $('#dt-size').addEventListener('change', (e) => { D.size = +e.target.value; render(); });
  $('#dt-color').addEventListener('input', (e) => { D.color = e.target.value; render(); });
  $('#dt-stroke').addEventListener('input', (e) => { D.stroke = +e.target.value; render(); });
}

function go(item) { if (!item) return; D.item = item; render(); D.onChange(item.name, D.style); dlg.querySelector('.dt-main').scrollIntoView({ block: 'nearest' }); }
function step(d) {
  const i = D.list.findIndex((x) => x.name === D.item.name);
  if (i < 0 || !D.list.length) return;
  go(D.list[(i + d + D.list.length) % D.list.length]);
}

const svgOut = () => linearSVG(D.item.name, { size: D.size, color: D.color || 'currentColor', stroke: D.stroke });

function render() {
  const { item, style } = D;
  const pro = style !== FREE;
  const comp = componentName(item.name);
  $('#dt-crumbs').innerHTML = `<span>${esc(title(item.category))}</span><i>›</i><span>${STYLE_INFO[style].label}</span><i>›</i><b>${esc(item.name)}</b>`;
  $('#dt-name').textContent = comp;
  $('#dt-tier').className = pro ? 'pro' : 'free';
  $('#dt-tier').textContent = pro ? 'Pro' : 'Free';
  $('#dt-tags').innerHTML = item.tags.slice(0, 10).map((t) => `<span>${esc(t)}</span>`).join('');

  // preview: Linear is redrawn with the chosen stroke; colour applies to every style
  const prev = $('#dt-preview');
  prev.style.color = D.color || '';
  prev.innerHTML = pro ? catalogIcon(item.idx, style) : linearSVG(item.name, { stroke: D.stroke }).replace('<svg', '<svg class="ic" aria-hidden="true"');
  $('#dt-size').value = D.size;
  $('#dt-color-v').textContent = D.color || 'currentColor';
  if (D.color) $('#dt-color').value = D.color;
  $('#dt-stroke-wrap').hidden = pro;
  $('#dt-stroke').value = D.stroke;
  $('#dt-stroke-v').textContent = `${D.stroke}px`;

  $('#dt-actions').innerHTML = pro
    ? `<a class="pill pill-dark" href="/#pricing">Unlock ${STYLE_INFO[style].label} with Pro</a><p>Every style as SVG, PNG, PDF, icon font, sprite and in Figma. Previews here are images.</p>`
    : `<button type="button" class="pill pill-dark" data-act="copy-svg">${icon('copy')}Copy SVG</button><button type="button" class="pill pill-ghost" data-act="dl-svg">${icon('download')}SVG</button><button type="button" class="pill pill-ghost" data-act="dl-png">${icon('download')}PNG ${D.size}px</button>`;

  $('#dt-styles').innerHTML = KIT.styles.map((s) => `<button type="button" data-style="${s}" class="${s === style ? 'on' : ''}" title="${STYLE_INFO[s].label}${s === FREE ? ' · free' : ' · Pro'}">${glyph(item, s)}<span class="lb">${STYLE_INFO[s].label}</span></button>`).join('');

  const rel = D.all.filter((i) => i.category === item.category && i.name !== item.name).slice(0, 14);
  $('#dt-rel-label').textContent = `More in ${title(item.category)}`;
  $('#dt-related').innerHTML = rel.map((i) => `<button type="button" data-rel="${i.name}" title="${i.name}">${glyph(i, style)}</button>`).join('');
  renderCode();
}

function renderCode() {
  const { item, style, size, stroke } = D;
  const pro = style !== FREE;
  const c = componentName(item.name), n = item.name, color = D.color;
  const sw = !pro && stroke !== 1.5;
  const pkg = (fw) => (pro ? `@nodo-icons/${fw}-pro/${style}` : `@nodo-icons/${fw}`);
  const reactProps = [`size={${size}}`, color && `color="${color}"`, sw && `strokeWidth={${stroke}}`].filter(Boolean).join(' ');
  const vueProps = [`:size="${size}"`, color && `color="${color}"`, sw && `:stroke-width="${stroke}"`].filter(Boolean).join(' ');
  const code = {
    react: `${pro ? '' : 'npm install @nodo-icons/react\n\n'}import { ${c} } from '${pkg('react')}';\n\n<${c} ${reactProps} />`,
    vue: `${pro ? '' : 'npm install @nodo-icons/vue\n\n'}<script setup>\nimport { ${c} } from '${pkg('vue')}';\n</script>\n\n<template>\n  <${c} ${vueProps} />\n</template>`,
    svg: pro ? `<!-- svg/${style}/${n}.svg from your Pro download -->\n<img src="svg/${style}/${n}.svg" width="${size}" height="${size}" alt="" />` : svgOut(),
    sprite: `<!-- ${pro ? `sprite/${style}.svg from your Pro download` : 'sprite/linear.svg from @nodo-icons/static'} -->\n<svg width="${size}" height="${size}"${color ? ` color="${color}"` : ''}>\n  <use href="sprite/${style}.svg#nd-${n}" />\n</svg>`,
    font: `<!-- ${pro ? `font/${style}/ from your Pro download` : 'font/linear/ from @nodo-icons/static'} -->\n<link rel="stylesheet" href="font/${style}/nodo-icons-${style}.css" />\n\n<i class="nd-${style} nd-${n}" style="font-size: ${size}px${color ? `; color: ${color}` : ''}"></i>`,
    ai: `# Claude Code (other MCP clients: see the docs)\nclaude mcp add nodo-icons -- npx -y @nodo-icons/mcp${pro ? '\n# Pro styles: set NODO_PRO_DIR to your unzipped Pro download' : ''}\n\n# or from the terminal\nnpx @nodo-icons/mcp get ${n}${pro ? ` --style ${style}` : ''} --format ${pro ? 'svg' : 'react'}`,
  }[D.tab];
  $('#dt-code').textContent = code;
  for (const b of dlg.querySelectorAll('[data-tab]')) b.classList.toggle('on', b.dataset.tab === D.tab);
  $('#dt-note').innerHTML = pro
    ? `${STYLE_INFO[style].label} is part of <a href="/#pricing">Nodo Icons Pro</a>. <a href="/docs/">Docs</a>`
    : `Linear is free under the <a href="/license/free/">MIT license</a>. <a href="/docs/">Docs</a>`;
}

async function copy(btn, text) {
  try { await navigator.clipboard.writeText(text); } catch { return; }
  btn.classList.add('done');
  setTimeout(() => btn.classList.remove('done'), 1100);
}
function save(blob, file) {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: file });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function png() {
  const s = D.size;
  const svg = linearSVG(D.item.name, { size: s, color: D.color || '#000000', stroke: D.stroke });
  const img = new Image();
  img.onload = () => {
    const c = Object.assign(document.createElement('canvas'), { width: s, height: s });
    c.getContext('2d').drawImage(img, 0, 0, s, s);
    c.toBlob((b) => save(b, `${D.item.name}-${s}.png`), 'image/png');
  };
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
