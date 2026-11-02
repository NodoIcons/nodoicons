# Nodo Icons website

nodoicons.com as a single Next.js App Router project (TypeScript). It is self-contained at build and run
time: everything it needs from the icon kit is copied into this folder by `npm run sync`.

```sh
npm install
npm run dev          # http://localhost:3000
npm run typecheck    # tsc --noEmit
npm run build        # production build (type check + ~5,050 static pages)
npm run start
```

## Folders

| Path | What |
|---|---|
| `app/` | Routes: landing (`/`), icon browser (`/icons/`), one page per icon (`/icons/<name>/`) and category, docs, licenses, legal pages, `llms.txt`, `catalog.json`, sitemap, robots, and the API routes under `app/api/` |
| `lib/` | Server code: catalog loading (`catalog.ts`), the kit renderer (`render.ts`), API handlers (npm registry, Lemon Squeezy webhook, waitlist, Pro previews), shared types (`types.ts`) |
| `components/` | Server/client components used by the routes (document frame, legal pages, analytics tracking) |
| `landing/` | The landing page runtime: `home/` (page script + CSS), `react/` (shadcn/ui islands: icon browser, detail dialog, pricing, showcase controls), `shared/` (icon helpers, mockups), `data/icons.json` (showcase subset + sprite manifest) |
| `content/` | Markdown sources: docs, licenses, privacy / terms / refunds |
| `public/` | Static assets. `data/`, `svg/linear/` and `sprites/` are **generated** by `npm run sync`; `assets/` by `npm run assets` |
| `scripts/` | `sync-from-kit.mjs` (data, free SVGs and Pro sprite sheets from `../dist`), `sprites.mjs`, `make-assets.mjs` (favicon, touch icon, OG image) |

## Refreshing data from the kit

After `npm run build` at the repository root (the kit → `../dist`):

```sh
npm run sync     # public/data, public/svg/linear, public/sprites, landing/data/icons.json
npm run assets   # public/assets (needs Playwright, see scripts/make-assets.mjs)
```

## Deploy

Vercel project `nodoicons` (team `team_rkxhqPf4OytpuIRzgCanfHYl`), Root Directory `website`, Next.js preset.
The source of truth for this folder is the Nodo Icons workspace (`website/` next to the icon kit); it is
copied into the public Git repository `NodoIcons/nodoicons` (locally `release/public/website`), and every
push to `main` there deploys. `.vercel/` links the workspace copy to the same project for `vercel` CLI use.

Environment variables used by the API routes: `LEMON_SQUEEZY_WEBHOOK_SECRET`, `LEMON_SQUEEZY_PRO_PRODUCT_ID`,
`LEMON_SQUEEZY_ENTERPRISE_PRODUCT_ID` (see `.env.example`) and the Vercel Blob credentials supplied by the
Vercel integration. Vercel Web Analytics is mounted in the root layout.
