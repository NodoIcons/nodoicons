// Markup for catalog icons: Linear from /data/linear.json, Pro styles from the sprite sheets.
import { toSVG, catalogIcon } from '../shared/icons';
import type { CatalogItem, Nodes } from '../../lib/types';

const FREE = 'linear';
export type GlyphOptions = { size?: number; color?: string; stroke?: number };

export const linearSVG = (nodes: Nodes, name: string, { size = 24, color = 'currentColor', stroke }: GlyphOptions = {}) =>
  toSVG({ styles: { linear: { nodes: nodes[name] } } }, FREE, { size, color, strokeWidth: stroke });
/** Markup for a catalog icon: Linear vector, or the Pro sprite preview. */
export const glyphHTML = (item: CatalogItem, style: string, nodes: Nodes, opts?: GlyphOptions) =>
  (style === FREE ? linearSVG(nodes, item.name, opts).replace('<svg', '<svg class="ic" aria-hidden="true"') : catalogIcon(item.idx, style));
