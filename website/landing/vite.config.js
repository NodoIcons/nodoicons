// Vite config of the website's landing: React islands with shadcn/ui + Tailwind (react/), "@" → react/.
// Used by `npm run dev` (vite website/landing) and by website/build.mjs.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const here = import.meta.dirname;
// dev only: the icon browser fetches /data/index.json and /data/linear.json (copied to dist/data by build.mjs)
const data = { name: 'data', configureServer(server) { server.middlewares.use('/data', (req, res, next) => {
  const f = req.url.slice(1).split('?')[0];
  if (!/^(index|linear)\.json$/.test(f)) return next();
  res.setHeader('Content-Type', 'application/json');
  res.end(readFileSync(resolve(here, '../../data', f)));
}); } };

export default defineConfig({
  root: here,
  publicDir: false,
  plugins: [data, react(), tailwindcss()],
  resolve: { alias: { '@': resolve(here, 'react') } },
});
