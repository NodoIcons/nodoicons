// SEO site: one page per icon + category pages + browse page + sitemap, from the built kit (dist/).
//   node release/site/build.mjs            → release/out/site/
//   SITE_URL=https://nodoicons.com LS_STORE=<lemon squeezy store slug> node release/site/build.mjs
// Free Linear icons are inline SVG (copy / download). Pro styles are shown only as 64px PNG previews,
// so the site never hands out Pro vectors.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { STYLE_INFO, STYLES, toSVG, componentName } from '../../lib/render.js';
import { markdown } from './markdown.mjs';

const ROOT = resolve(import.meta.dirname, '../..');
const DIST = join(ROOT, 'dist');
// DATA_DIR: icon index + Linear geometry (default dist/site-data). LICENSES_DIR: license texts.
const DATA = process.env.DATA_DIR ? resolve(process.env.DATA_DIR) : join(DIST, 'site-data');
const LICENSES = process.env.LICENSES_DIR ? resolve(process.env.LICENSES_DIR) : join(import.meta.dirname, '../licenses');
// OUT_DIR: where to write (default release/out/site). ICONS=0: skip the 5,000 icon pages (pre-launch site).
const OUT = process.env.OUT_DIR ? resolve(process.env.OUT_DIR) : join(import.meta.dirname, '../out/site');
const ICONS = process.env.ICONS !== '0';
const SITE = (process.env.SITE_URL || 'https://nodoicons.com').replace(/\/$/, '');
const LS_STORE = process.env.LS_STORE ?? 'nodoicons';
const PRICING = '/#pricing';
const FREE = 'linear';
const PRO_STYLES = STYLES.filter((s) => s !== FREE);

const index = JSON.parse(readFileSync(join(DATA, 'index.json'), 'utf8')).icons.map(([name, category, tags]) => ({ name, category, tags }));
const linear = JSON.parse(readFileSync(join(DATA, `${FREE}.json`), 'utf8'));
const COUNT = index.length;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const title = (n) => n.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
const svg = (name, size = 24) => toSVG({ styles: { [FREE]: { nodes: linear[name] } } }, FREE, { size });
const TODAY = new Date().toISOString().slice(0, 10);
const write = (path, text) => { mkdirSync(join(path, '..'), { recursive: true }); writeFileSync(path, text); };
const byCat = new Map();
for (const i of index) (byCat.get(i.category) || byCat.set(i.category, []).get(i.category)).push(i);

const affiliate = LS_STORE
  ? `<script>window.lemonSqueezyAffiliateConfig = { store: ${JSON.stringify(LS_STORE)} };</script><script src="https://lmsqueezy.com/affiliate.js" defer></script>`
  : '';

function layout({ path, pageTitle, description, body, jsonld = '', mdAlt = '' }) {
  const url = `${SITE}${path}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(pageTitle)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${url}" />${mdAlt ? `\n<link rel="alternate" type="text/markdown" href="${mdAlt}" />` : ''}
<meta property="og:type" content="website" /><meta property="og:title" content="${esc(pageTitle)}" />
<meta property="og:description" content="${esc(description)}" /><meta property="og:url" content="${url}" />
<meta property="og:image" content="${SITE}/assets/og.png" /><meta name="twitter:card" content="summary_large_image" />
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" /><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400..700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/site.css" />
${jsonld}${affiliate}
</head>
<body>
<header class="top"><a class="logo" href="/" aria-label="Nodo Icons — home"><img src="/assets/favicon.svg" width="30" height="30" alt="" /></a><nav>${ICONS ? '<a href="/icons/">Icons</a>' : ''}<a href="/docs/">Docs</a><a href="${PRICING}">Pricing</a></nav><a class="btn dark" href="${PRICING}">Early access</a></header>
<main>${body}</main>
<footer class="foot"><span>Nodo Icons · ${COUNT.toLocaleString('en-US')} icons × ${STYLES.length} styles · <a href="mailto:hello@nodoicons.com">hello@nodoicons.com</a> · <a href="mailto:support@nodoicons.com">Support</a></span><span><a href="/license/free/">Linear: MIT</a> · <a href="/license/pro/">Pro license</a> · <a href="/terms/">Terms</a> · <a href="/refunds/">Refunds</a> · <a href="/privacy/">Privacy</a></span></footer>
<script src="/assets/site.js" defer></script>
</body>
</html>
`;
}

function related(icon) {
  const words = new Set([...icon.name.split('-'), ...icon.tags]);
  return (byCat.get(icon.category) || [])
    .filter((o) => o.name !== icon.name)
    .map((o) => ({ o, s: [...o.name.split('-'), ...o.tags].filter((w) => words.has(w)).length }))
    .sort((a, b) => b.s - a.s || a.o.name.localeCompare(b.o.name))
    .slice(0, 12)
    .map(({ o }) => o);
}

const cell = (i) => `<a class="cell" href="/icons/${i.name}/" title="${esc(title(i.name))}">${svg(i.name)}<span>${esc(i.name)}</span></a>`;

function iconPage(icon) {
  const t = title(icon.name), comp = componentName(icon.name);
  const description = `${t} icon: free SVG in the Linear style, plus ${PRO_STYLES.length} Pro styles. React and Vue components, PNG, PDF and icon font. Tags: ${icon.tags.slice(0, 5).join(', ')}.`.slice(0, 158);
  const raw = svg(icon.name);
  const react = `import { ${comp} } from '@nodo-icons/react';\n\n<${comp} size={24} />`;
  const vue = `<script setup>\nimport { ${comp} } from '@nodo-icons/vue';\n</script>\n\n<template><${comp} :size="24" /></template>`;
  const jsonld = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'ImageObject', name: `${t} icon`, description,
    contentUrl: `${SITE}/svg/${FREE}/${icon.name}.svg`, encodingFormat: 'image/svg+xml',
    license: `${SITE}/license/free/`, acquireLicensePage: `${SITE}/#pricing`, creditText: 'Nodo Icons',
    creator: { '@type': 'Organization', name: 'Nodo Icons' }, keywords: icon.tags.join(', '),
  })}</script>\n`;
  const body = `
<nav class="crumbs"><a href="/icons/">Icons</a> › <a href="/icons/c/${icon.category}/">${esc(title(icon.category))}</a> › <span>${esc(t)}</span></nav>
<section class="hero">
  <div class="canvas">${svg(icon.name, 160)}</div>
  <div class="info">
    <h1>${esc(t)} icon</h1>
    <p class="lede">Free in the Linear style (MIT). Available in ${STYLES.length} styles with Nodo Icons Pro.</p>
    <div class="actions">
      <button class="btn dark" data-copy="svg">Copy SVG</button>
      <a class="btn" href="/svg/${FREE}/${icon.name}.svg" download>Download SVG</a>
      <button class="btn" data-copy="react">Copy React</button>
    </div>
    <p class="tags">${icon.tags.map((g) => `<span>${esc(g)}</span>`).join('')}</p>
  </div>
</section>
<section>
  <h2>All styles</h2>
  <div class="styles">
    <figure class="free">${raw}<figcaption>${STYLE_INFO[FREE].label}<b>Free</b></figcaption></figure>
    ${PRO_STYLES.map((s) => `<a class="pro" href="${PRICING}"><img src="/png/${s}/64/${icon.name}.png" width="32" height="32" alt="${esc(t)} icon, ${STYLE_INFO[s].label} style" loading="lazy" /><figcaption>${STYLE_INFO[s].label}<b>Pro</b></figcaption></a>`).join('')}
  </div>
</section>
<section class="code">
  <h2>Use it</h2>
  <div class="tabs"><button class="on" data-tab="react">React</button><button data-tab="vue">Vue</button><button data-tab="svg">SVG</button></div>
  <pre data-pane="react"><code>${esc(react)}</code></pre>
  <pre data-pane="vue" hidden><code>${esc(vue)}</code></pre>
  <pre data-pane="svg" hidden><code>${esc(raw)}</code></pre>
  <p class="hint"><code>npm install @nodo-icons/react</code> · or ask your AI agent: <code>npx @nodo-icons/mcp</code></p>
</section>
<section>
  <h2>Related icons</h2>
  <div class="grid">${related(icon).map(cell).join('')}</div>
</section>
<section class="cta"><div><h2>Get all ${STYLES.length} styles</h2><p>Every icon in Linear, Light, Bold, Sharp, Twotone, Duotone, Bulk, Solid, Contained and Soft. Pay once, free updates forever.</p></div><a class="btn blue" href="${PRICING}">Get early access — $49</a></section>
<template id="src-svg">${raw}</template><template id="src-react">${esc(react)}</template>`;
  return layout({ path: `/icons/${icon.name}/`, pageTitle: `${t} icon — free SVG, React & Vue | Nodo Icons`, description, body, jsonld, mdAlt: `/icons/${icon.name}/index.md` });
}

// Markdown twin of an icon page: what an agent needs, without the page chrome.
function iconMarkdown(icon) {
  const t = title(icon.name), comp = componentName(icon.name);
  return `# ${t} icon — Nodo Icons

- Name: \`${icon.name}\`
- Category: ${icon.category}
- Tags: ${icon.tags.join(', ')}
- Free style: Linear (MIT). Pro styles: ${PRO_STYLES.map((s) => STYLE_INFO[s].label).join(', ')}.
- Page: ${SITE}/icons/${icon.name}/
- SVG (Linear): ${SITE}/svg/${FREE}/${icon.name}.svg

## React

\`\`\`jsx
import { ${comp} } from '@nodo-icons/react';

<${comp} size={24} />
\`\`\`

## Vue

\`\`\`vue
<script setup>
import { ${comp} } from '@nodo-icons/vue';
</script>

<template><${comp} :size="24" /></template>
\`\`\`

## SVG (Linear)

\`\`\`svg
${svg(icon.name)}
\`\`\`

## Pro styles

With Nodo Icons Pro: \`import { ${comp} } from '@nodo-icons/react-pro/<style>'\`, where \`<style>\` is one of ${PRO_STYLES.join(', ')}. Pricing: ${PRICING}

## Related icons

${related(icon).map((o) => `- [${o.name}](${SITE}/icons/${o.name}/index.md)`).join('\n')}
`;
}

function categoryPage(cat, list) {
  const t = title(cat);
  return layout({
    path: `/icons/c/${cat}/`,
    pageTitle: `${t} icons — ${list.length} free SVG icons | Nodo Icons`,
    description: `${list.length} ${cat} icons in 10 styles. Free Linear SVG, React and Vue components; Pro adds Duotone, Bulk, Solid and more.`,
    body: `<nav class="crumbs"><a href="/icons/">Icons</a> › <span>${esc(t)}</span></nav><h1>${esc(t)} icons</h1><p class="lede">${list.length} icons · free in Linear, ${STYLES.length} styles with Pro.</p><div class="grid">${list.map(cell).join('')}</div>`,
  });
}

function browsePage() {
  const cats = [...byCat].sort((a, b) => b[1].length - a[1].length);
  return layout({
    path: '/icons/',
    pageTitle: `${COUNT.toLocaleString('en-US')} free UI icons — SVG, React & Vue | Nodo Icons`,
    description: `Browse ${COUNT.toLocaleString('en-US')} icons on a 24×24 grid. Free Linear style under MIT; nine more styles with Nodo Icons Pro.`,
    body: `<h1>${COUNT.toLocaleString('en-US')} icons</h1><p class="lede">Free in the Linear style · ${STYLES.length} styles with Pro.</p>
<label class="search"><input id="q" placeholder="Search icons — try “upload”, “card”, “weather”" autocomplete="off" /></label>
<div class="cats">${cats.map(([c, l]) => `<a href="/icons/c/${c}/">${esc(title(c))} <span>${l.length}</span></a>`).join('')}</div>
<div class="grid" id="results"></div>`,
  });
}

// ── build ─────────────────────────────────────────────────────────────────
rmSync(OUT, { recursive: true, force: true });
const t0 = Date.now();
if (ICONS) {
  for (const i of index) {
    write(join(OUT, 'icons', i.name, 'index.html'), iconPage(i));
    write(join(OUT, 'icons', i.name, 'index.md'), iconMarkdown(i));
  }
  for (const [c, l] of byCat) write(join(OUT, 'icons', 'c', c, 'index.html'), categoryPage(c, l));
  write(join(OUT, 'icons', 'index.html'), browsePage());
  write(join(OUT, 'icons', 'index.json'), JSON.stringify(index.map((i) => [i.name, i.category, i.tags])));
  cpSync(join(DIST, 'svg', FREE), join(OUT, 'svg', FREE), { recursive: true });
  for (const s of PRO_STYLES) if (existsSync(join(DIST, 'png', s, '64'))) cpSync(join(DIST, 'png', s, '64'), join(OUT, 'png', s, '64'), { recursive: true });
}
cpSync(join(import.meta.dirname, 'assets'), join(OUT, 'assets'), { recursive: true });
// License pages (linked from the JSON-LD and from checkout) + their Markdown source.
for (const [slug, file, name] of [['free', 'LICENSE-FREE.md', 'Free license (MIT)'], ['pro', 'LICENSE-PRO.md', 'Pro license']]) {
  const text = readFileSync(join(LICENSES, file), 'utf8').split('\n').filter((l) => !l.startsWith('>')).join('\n');
  write(join(OUT, 'license', slug, 'index.html'), layout({ path: `/license/${slug}/`, pageTitle: `Nodo Icons — ${name}`, description: `Nodo Icons ${name}.`, body: `<article class="doc">${markdown(text)}</article>`, mdAlt: `/license/${slug}/index.md` }));
  write(join(OUT, 'license', slug, 'index.md'), text);
}

// Legal pages: terms of sale, refunds, privacy (drafts pending legal review).
const LEGAL = [['terms', 'Terms of sale'], ['refunds', 'Refund policy'], ['privacy', 'Privacy policy']];
for (const [slug, name] of LEGAL) {
  const text = readFileSync(join(import.meta.dirname, 'pages', `${slug}.md`), 'utf8').replaceAll('[date]', TODAY).split('\n').filter((l) => !l.startsWith('>')).join('\n');
  write(join(OUT, slug, 'index.html'), layout({ path: `/${slug}/`, pageTitle: `${name} — Nodo Icons`, description: `Nodo Icons ${name.toLowerCase()}.`, body: `<article class="doc">${markdown(text)}</article>`, mdAlt: `/${slug}/index.md` }));
  write(join(OUT, slug, 'index.md'), text);
}
write(join(OUT, '404.html'), layout({ path: '/404', pageTitle: 'Page not found — Nodo Icons', description: 'Page not found.', body: '<h1>Page not found</h1><p class="lede">This page does not exist. Try the <a href="/docs/">docs</a> or go <a href="/">home</a>.</p>' }));

// ── For AI agents ─────────────────────────────────────────────────────────
let docs = readFileSync(join(import.meta.dirname, 'docs.md'), 'utf8').replaceAll('https://nodoicons.com', SITE);
if (!ICONS) docs = docs.split('\n').filter((l) => !/catalog\.json|\/icons\/<name>/.test(l)).join('\n');
write(join(OUT, 'docs', 'index.md'), docs);
write(join(OUT, 'docs', 'index.html'), layout({
  path: '/docs/', pageTitle: 'Nodo Icons docs — React, Vue, SVG, shadcn/ui and AI agents',
  description: 'Install and use Nodo Icons: React and Vue components, SVG, sprite and font, shadcn/ui migration, MCP server for AI agents, styles and licensing.',
  body: `<article class="doc">${markdown(docs)}</article>`, mdAlt: '/docs/index.md',
  jsonld: `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'SoftwareSourceCode', name: 'Nodo Icons', description: `${COUNT} UI icons in ${STYLES.length} styles for React, Vue and SVG.`, codeRepository: 'https://www.npmjs.com/package/@nodo-icons/react', programmingLanguage: ['JavaScript', 'TypeScript'], license: `${SITE}/license/free/`, url: `${SITE}/docs/` })}</script>\n`,
}));
// Full catalogue: lets an agent pick a name and import without searching page by page.
if (ICONS) write(join(OUT, 'catalog.json'), JSON.stringify({
  name: 'Nodo Icons', version: JSON.parse(readFileSync(join(DIST, 'react/package.json'), 'utf8')).version, count: COUNT,
  styles: STYLES.map((s) => ({ style: s, tier: s === FREE ? 'free' : 'pro' })),
  packages: { react: '@nodo-icons/react', vue: '@nodo-icons/vue', static: '@nodo-icons/static', mcp: '@nodo-icons/mcp' },
  icons: index.map((i) => ({ name: i.name, component: componentName(i.name), category: i.category, tags: i.tags, svg: `${SITE}/svg/${FREE}/${i.name}.svg`, page: `${SITE}/icons/${i.name}/` })),
}));
const llms = `# Nodo Icons

> ${COUNT.toLocaleString('en-US')} UI icons on a 24×24 grid in ${STYLES.length} styles. The Linear style is free (MIT) as React (\`@nodo-icons/react\`), Vue (\`@nodo-icons/vue\`) and SVG (\`@nodo-icons/static\`). Nine more styles are Nodo Icons Pro (one-time purchase, free updates forever). AI agents can use the MCP server \`@nodo-icons/mcp\`.

## Docs

- [Documentation](${SITE}/docs/index.md): install, React and Vue usage, SVG/sprite/font, shadcn/ui migration, MCP setup, styles, licensing
${ICONS ? `- [Icon catalogue](${SITE}/catalog.json): every icon with name, React component, category, tags, SVG URL
- [Browse icons](${SITE}/icons/): each icon page has a Markdown version at \`/icons/<name>/index.md\`
` : ''}
## Licenses and pricing

- [Free license (MIT, Linear style)](${SITE}/license/free/index.md)
- [Pro license](${SITE}/license/pro/index.md)
- [Pricing](${SITE}/#pricing): Pro $49 per 10 people in early access, then $99; Enterprise $499

## Optional

- [Full text for language models](${SITE}/llms-full.txt): the documentation plus the list of all icon names
`;
write(join(OUT, 'llms.txt'), llms);
write(join(OUT, 'llms-full.txt'), `${docs}\n\n## All icons (name · category · tags)\n\n${index.map((i) => `- ${i.name} · ${i.category} · ${i.tags.join(', ')}`).join('\n')}\n`);

const urls = ['/', '/docs/', '/license/free/', '/license/pro/', '/terms/', '/refunds/', '/privacy/', ...(ICONS ? ['/icons/', ...[...byCat.keys()].map((c) => `/icons/c/${c}/`), ...index.map((i) => `/icons/${i.name}/`)] : [])];
write(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${SITE}${u}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}\n</urlset>\n`);
// Every crawler may read the pages (free Linear icons, docs). Bots that collect model-training data
// skip the Pro previews, which the Pro license keeps out of AI training (section 6.5).
const TRAINING_BOTS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'meta-externalagent', 'Bytespider'];
write(join(OUT, 'robots.txt'), `${TRAINING_BOTS.map((b) => `User-agent: ${b}`).join('\n')}\nDisallow: /png/\n\nUser-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`✓ ${ICONS ? `${index.length} icon pages + ${byCat.size} categories + browse page` : 'site without icon pages'} in ${((Date.now() - t0) / 1000).toFixed(1)}s → ${OUT}`);
console.log(LS_STORE ? `✓ Lemon Squeezy affiliate tracking for store "${LS_STORE}"` : '· affiliate tracking off: set LS_STORE=<store slug> once the store exists');
