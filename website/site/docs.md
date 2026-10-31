# Nodo Icons documentation

Nodo Icons is an icon set of 5,000 UI icons drawn on a 24×24 grid, in 10 styles. The **Linear** style is free under the MIT license; the other nine styles are **Nodo Icons Pro**, sold once with free updates forever.

## Install

| Package | What | License |
|---|---|---|
| `@nodo-icons/react` | 5,000 Linear icons as React components | MIT |
| `@nodo-icons/vue` | 5,000 Linear icons as Vue 3 components | MIT |
| `@nodo-icons/static` | Linear SVG, outlined SVG, SVG sprite, icon font, `icons.json` | MIT |
| `@nodo-icons/mcp` | MCP server and CLI for AI agents | MIT |
| `@nodo-icons/react-pro`, `@nodo-icons/vue-pro` | All 10 styles, from the Nodo Icons registry with your license key ([setup](#nodo-icons-pro-in-react-and-vue)) | Pro |

```bash
npm install @nodo-icons/react
```

## React

```jsx
import { HomeIcon, CreditCardIcon } from '@nodo-icons/react';

<HomeIcon size={24} />
<CreditCardIcon size={20} color="#0a84ff" strokeWidth={1.5} title="Card" />
```

Component names are the icon name in PascalCase plus `Icon` (`credit-card` → `CreditCardIcon`); names starting with a digit get an `Icon` prefix (`3d-glasses` → `Icon3dGlasses`). Props: `size` (default 24), `color` (default `currentColor`), `strokeWidth` (default 1.5), `title` (adds `role="img"`; without it the icon is `aria-hidden`). Other props go to the `<svg>`, so `className="size-4"` works.

## Vue

```vue
<script setup>
import { HomeIcon } from '@nodo-icons/vue';
</script>

<template><HomeIcon :size="20" color="#0a84ff" /></template>
```

## Nodo Icons Pro in React and Vue

`@nodo-icons/react-pro` and `@nodo-icons/vue-pro` (all 10 styles) install from the Nodo Icons registry with your license key, which is in your purchase receipt. Add an `.npmrc` next to your `package.json`:

```ini
@nodo-icons:registry=https://nodoicons.com/npm/
//nodoicons.com/npm/:_authToken=${NODO_LICENSE_KEY}
```

```bash
export NODO_LICENSE_KEY=your-license-key   # in CI, store it as a secret
npm install @nodo-icons/react-pro          # or @nodo-icons/vue-pro
```

```jsx
import { HomeIcon } from '@nodo-icons/react-pro/duotone';
```

Each style is its own entry point (`/linear`, `/light`, `/bold`, `/sharp`, `/twotone`, `/duotone`, `/bulk`, `/solid`, `/contained`, `/soft`); props are the same as the free packages. Installing doesn't use any of your license's activations, and the free `@nodo-icons/*` packages keep installing from npm through the same registry. Keep the key out of git: `${NODO_LICENSE_KEY}` reads it from the environment.

## SVG, sprite and font

```html
<img src="https://nodoicons.com/svg/linear/home.svg" width="24" height="24" alt="" />
<svg width="24" height="24"><use href="sprite/linear.svg#nd-home"/></svg>
```

## Use with shadcn/ui

shadcn/ui projects use `lucide-react`. Switch the imports to Nodo; JSX stays the same:

```bash
npx @nodo-icons/mcp migrate-lucide ./src --dry
npx @nodo-icons/mcp migrate-lucide ./src
npm install @nodo-icons/react
```

All 166 icons used by shadcn/ui components have a Nodo equivalent.

## Use with AI agents (MCP)

```bash
claude mcp add nodo-icons -- npx -y @nodo-icons/mcp
```

Other MCP clients: `{ "mcpServers": { "nodo-icons": { "command": "npx", "args": ["-y", "@nodo-icons/mcp"] } } }`. Tools: `search_icons`, `get_icon` (SVG, React, Vue, sprite), `list_styles`, `list_categories`. With Pro, set `NODO_PRO_DIR` to the unzipped Pro download to get every style.

## Styles

| Style | Look | Tier |
|---|---|---|
| Linear | 1.5px outline, round caps | Free |
| Light | 1px outline | Pro |
| Bold | 2px outline | Pro |
| Sharp | Square corners, flat caps | Pro |
| Twotone | Outline, secondary details at 40% | Pro |
| Duotone | Outline plus 30% tonal fill | Pro |
| Bulk | 40% silhouette, crisp details | Pro |
| Solid | Filled, negative-space details | Pro |
| Contained | Glyph cut out of a rounded square | Pro |
| Soft | Glyph on a 12% tinted tile | Pro |

## Pricing and license

- Free: Linear style, MIT, no attribution required. [Free license](/license/free/)
- Pro: all 10 styles, every format, commercial and client work, free updates forever. $49 per 10 people during early access, then $99. [Pro license](/license/pro/)
- Enterprise: unlimited people, extended license for templates and UI kits, invoicing. $499.

## Machine-readable resources

- [/catalog.json](/catalog.json): every icon with name, React component, category, tags and SVG URL
- [/llms.txt](/llms.txt) and [/llms-full.txt](/llms-full.txt): summaries for language models
- `/icons/<name>/index.md`: a Markdown version of every icon page

## Contact

- General: hello@nodoicons.com
- Support, refunds, license transfers: support@nodoicons.com
- Enterprise and invoicing: enterprise@nodoicons.com
- Legal notices: legal@nodoicons.com
