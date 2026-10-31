// Turns compiled icon data (src/generated/icons.json) into SVG markup.
// Shared by the build scripts and the preview site, so it stays dependency-free.

// The one style table. Everything (SVG, sprite, React, Vue, fonts, site, verify) reads from here.
//   paint   'stroke' → root draws strokes; 'fill' → root draws fills
//   layers  true when the icon font needs a second (secondary) glyph layer, drawn at layerOpacity
export const STYLE_INFO = {
  linear: { label: 'Linear', paint: 'stroke', strokeWidth: 1.5, blurb: 'Contorno 1.5px, terminali arrotondati. Neutro e leggero.' },
  light: { label: 'Light', paint: 'stroke', strokeWidth: 1, blurb: 'Contorno 1px: elegante, per dimensioni grandi e UI ariose.' },
  bold: { label: 'Bold', paint: 'stroke', strokeWidth: 2, blurb: 'Contorno 2px: più presenza a 16–20px e su sfondi rumorosi.' },
  sharp: { label: 'Sharp', paint: 'stroke', strokeWidth: 1.5, cap: 'butt', join: 'miter', blurb: 'Angoli vivi e terminali netti. Tecnico, editoriale.' },
  twotone: { label: 'Twotone', paint: 'stroke', strokeWidth: 1.5, layers: true, layerOpacity: 0.4, blurb: 'Contorno con i dettagli secondari al 40%.' },
  duotone: { label: 'Duotone', paint: 'stroke', strokeWidth: 1.5, layers: true, layerOpacity: 0.3, blurb: 'Contorno + riempimento tonale al 30%. Più profondità.' },
  bulk: { label: 'Bulk', paint: 'stroke', strokeWidth: 1.5, layers: true, layerOpacity: 0.4, blurb: 'Sagoma piena al 40% con i dettagli in primo piano.' },
  solid: { label: 'Solid', paint: 'fill', blurb: 'Forme piene con dettagli in negativo. Massima leggibilità.' },
  contained: { label: 'Contained', paint: 'fill', blurb: 'Glifo scavato in un quadrato arrotondato, stile app-icon.' },
  soft: { label: 'Soft', paint: 'stroke', strokeWidth: 1.5, layers: true, layerOpacity: 0.12, blurb: 'Glifo su tessera tinta al 12%: per chip, liste, empty state.' },
};
export const STYLES = Object.keys(STYLE_INFO);

export function rootAttrs(style, { strokeWidth, outlined = false } = {}) {
  const s = STYLE_INFO[style];
  if (s.paint === 'fill' || outlined) return { fill: 'currentColor' };
  return {
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': strokeWidth ?? s.strokeWidth,
    'stroke-linecap': s.cap || 'round',
    'stroke-linejoin': s.join || 'round',
  };
}

export function iconNodes(icon, style, { outlined = false } = {}) {
  if (!outlined) return icon.styles[style].nodes;
  const { primary, secondary } = icon.styles[style].outline;
  return [...(secondary ? [['path', { d: secondary, opacity: String(STYLE_INFO[style].layerOpacity) }]] : []), ['path', { d: primary }]];
}

const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const attrs = (o) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => ` ${k}="${esc(v)}"`)
    .join('');

export function nodesToMarkup(nodes) {
  return nodes.map(([tag, a]) => `<${tag}${attrs(a)}/>`).join('');
}

export function toSVG(icon, style, { size = 24, color = 'currentColor', strokeWidth, outlined = false, title } = {}) {
  const root = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    ...rootAttrs(style, { strokeWidth, outlined }),
  };
  let body = nodesToMarkup(iconNodes(icon, style, { outlined }));
  if (title) body = `<title>${esc(title)}</title>${body}`;
  const svg = `<svg${attrs(root)}>${body}</svg>`;
  return color === 'currentColor' ? svg : svg.replaceAll('currentColor', color);
}

export const pascal = (name) => name.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());
// JS identifiers can't start with a digit: `5g` → Icon5g, `3d-printer` → Icon3dPrinter; the rest → HomeIcon.
export const componentName = (name) => (/^\d/.test(name) ? `Icon${pascal(name)}` : `${pascal(name)}Icon`);
