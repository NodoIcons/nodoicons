# Nodo Icons

5,000 UI icons drawn on a 24×24 grid, in 10 styles. The **Linear** style is free under the MIT license — it lives in this repository. The other nine styles (Light, Bold, Sharp, Twotone, Duotone, Bulk, Solid, Contained, Soft) are [Nodo Icons Pro](https://nodoicons.com/#pricing).

**Website:** [nodoicons.com](https://nodoicons.com) · **Docs:** [nodoicons.com/docs](https://nodoicons.com/docs/) · **Contact:** hello@nodoicons.com

## What's here

| Path | What |
|---|---|
| `icons/linear/` | 5,000 SVG icons, Linear style, `currentColor` (MIT) |
| `data/index.json` | Names, categories and search tags of every icon |
| `data/linear.json` | Linear geometry used to render the icons |
| `lib/render.js` | Dependency-free renderer: icon data → SVG markup |
| `website/` | Source of nodoicons.com (landing, docs, license and legal pages) |
| `licenses/` | Free license (MIT) and the Nodo Icons Pro license |

## Use the icons

```html
<img src="https://raw.githubusercontent.com/NodoIcons/nodoicons/main/icons/linear/home.svg" width="24" height="24" alt="" />
```

Copy any SVG from `icons/linear/`; it inherits the text color (`currentColor`). React, Vue and static packages (`@nodo-icons/react`, `@nodo-icons/vue`, `@nodo-icons/static`) and the MCP server for AI agents (`@nodo-icons/mcp`) are published to npm at launch — see the [docs](https://nodoicons.com/docs/).

## Website

```bash
npm install
npm run build      # → website/dist
npm run dev        # landing only, with hot reload
```

Netlify builds and deploys `website/dist` on every push to `main` (`netlify.toml`).

## License

Code and Linear icons: [MIT](LICENSE). Pro styles are not in this repository and are licensed under the [Nodo Icons Pro license](https://nodoicons.com/license/pro/). Previews of Pro styles used by the website (`website/landing/data/icons.json`) are not MIT.
