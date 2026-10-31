// Builds nodoicons.com into website/dist (Vercel runs this on every push; headers and redirects live in vercel.json).
import { copyFileSync, cpSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { build } from 'vite';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = join(ROOT, 'website/dist');
rmSync(OUT, { recursive: true, force: true });

// docs, licenses, legal pages, robots, sitemap, llms.txt
execFileSync(process.execPath, [join(ROOT, 'website/site/build.mjs')], {
  stdio: 'inherit',
  env: { ...process.env, OUT_DIR: OUT, ICONS: '0', DATA_DIR: join(ROOT, 'data'), LICENSES_DIR: join(ROOT, 'licenses') },
});

// the landing becomes the home page
await build({
  configFile: join(ROOT, 'website/landing/vite.config.js'), root: join(ROOT, 'website/landing'), base: '/', logLevel: 'warn',
  build: {
    outDir: OUT,
    emptyOutDir: false,
    assetsDir: 'assets/app',
    manifest: true,
    rollupOptions: {
      input: {
        home: join(ROOT, 'website/landing/home/index.html'),
        icons: join(ROOT, 'website/landing/home/icons.html'),
        analytics: join(ROOT, 'website/landing/analytics.js'),
      },
    },
  },
});
renameSync(join(OUT, 'home/index.html'), join(OUT, 'index.html'));
mkdirSync(join(OUT, 'icons'), { recursive: true });
renameSync(join(OUT, 'home/icons.html'), join(OUT, 'icons/index.html')); // search page: /icons/

// The landing's "browse every icon" section fetches the free Linear data (MIT) at /data/.
mkdirSync(join(OUT, 'data'), { recursive: true });
for (const f of ['index.json', 'linear.json']) copyFileSync(join(ROOT, 'data', f), join(OUT, 'data', f));
// Pro styles are previewed as images: WebP sprite sheets with hashed names (cached as immutable).
cpSync(join(ROOT, 'website/landing/sprites'), join(OUT, 'sprites'), { recursive: true });
rmSync(join(OUT, 'home'), { recursive: true, force: true });

// The landing is bundled by Vite; the docs and legal pages are generated as plain HTML.
// Add the same Vercel Analytics entry to every page in the static output.
const manifestPath = join(OUT, '.vite/manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const analyticsEntry = Object.values(manifest).find((entry) => entry.isEntry && entry.src?.endsWith('analytics.js'));
if (!analyticsEntry) throw new Error('Vercel Analytics entry is missing from the Vite build');
const analyticsTag = `<script type="module" crossorigin src="/${analyticsEntry.file}"></script>`;
function addAnalytics(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) addAnalytics(path);
    else if (entry.isFile() && entry.name.endsWith('.html')) {
      const html = readFileSync(path, 'utf8');
      writeFileSync(path, html.replace('</head>', `  ${analyticsTag}\n</head>`));
    }
  }
}
addAnalytics(OUT);
rmSync(join(OUT, '.vite'), { recursive: true, force: true });
console.log('✓ website/dist ready');
