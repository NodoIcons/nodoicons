// Markup for catalog icons: Linear from /data/linear.json, Pro styles from the sprite sheets.
import { toSVG, catalogIcon } from '../shared/icons.js';

const FREE = 'linear';
export const linearSVG = (nodes, name, { size = 24, color = 'currentColor', stroke } = {}) =>
  toSVG({ styles: { linear: { nodes: nodes[name] } } }, FREE, { size, color, strokeWidth: stroke });
/** Markup for a catalog icon: Linear vector, or the Pro sprite preview. */
export const glyphHTML = (item, style, nodes, opts) =>
  (style === FREE ? linearSVG(nodes, item.name, opts).replace('<svg', '<svg class="ic" aria-hidden="true"') : catalogIcon(item.idx, style));
