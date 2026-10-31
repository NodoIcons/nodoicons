// Builds nodoicons.com into website/dist (Netlify runs this on every push).
import { renameSync, rmSync, writeFileSync } from 'node:fs';
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
  configFile: false, root: join(ROOT, 'website/landing'), base: '/', publicDir: false, logLevel: 'warn',
  build: { outDir: OUT, emptyOutDir: false, assetsDir: 'assets/app', rollupOptions: { input: { home: join(ROOT, 'website/landing/home/index.html') } } },
});
renameSync(join(OUT, 'home/index.html'), join(OUT, 'index.html'));
rmSync(join(OUT, 'home'), { recursive: true, force: true });

writeFileSync(join(OUT, '_headers'), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/*.md
  Content-Type: text/markdown; charset=utf-8
`);
console.log('✓ website/dist ready');
