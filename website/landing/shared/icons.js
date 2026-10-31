// Icon helpers for the landing previews. Data = landing/data/icons.json (see scripts/snapshot.mjs),
// markup = the kit's own renderer (src/render.js), so the landing shows exactly what ships.
import { toSVG, STYLE_INFO } from '../../../lib/render.js';
import data from '../data/icons.json';

export const KIT = {
  count: data.count,
  categories: data.categories,
  styles: data.styles,
  names: Object.keys(data.icons),
  variants: data.count * data.styles.length,
};
export { STYLE_INFO, toSVG };
export const fmt = (n) => n.toLocaleString('en-US');
/** True when the page bundles this icon in this style (Pro styles: showcase icons only). */
export const previewable = (name, style) => Boolean(data.icons[name]?.styles[style]);

/** <svg class="ic"> markup for one icon in one style. Size is driven by CSS (--s, default 24px). */
export function icon(name, style = 'linear', { strokeWidth } = {}) {
  const ic = data.icons[name];
  if (!ic) return `<svg class="ic" viewBox="0 0 24 24"></svg>`;
  const s = ic.styles[style] ? style : 'linear';
  return toSVG(ic, s, { size: 24, strokeWidth }).replace('<svg', `<svg class="ic ic-${s}" aria-hidden="true" focusable="false"`);
}

const styleOf = (el) => el.dataset.style || el.closest('[data-style]')?.dataset.style || 'linear';

/** Fills every [data-ic="name"] inside root with its icon, in the nearest [data-style]. */
export function hydrate(root = document) {
  for (const el of root.querySelectorAll('[data-ic]')) {
    el.innerHTML = icon(el.dataset.ic, styleOf(el));
    el.dataset.rendered = styleOf(el);
  }
}

/**
 * Re-renders [data-ic] inside root in a new style with a short crossfade + stagger.
 * The container's data-style is updated, so later hydrate() calls agree.
 */
export function swapStyle(root, style, { stagger = 18, max = 400 } = {}) {
  if (root.dataset.style === style) return;
  root.dataset.style = style;
  const els = [...root.querySelectorAll('[data-ic]')].filter((el) => !el.dataset.style);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  els.forEach((el, i) => {
    if (el.dataset.rendered === style) return;
    const apply = () => {
      el.innerHTML = icon(el.dataset.ic, style);
      el.dataset.rendered = style;
    };
    if (reduce) return apply();
    const old = el.firstElementChild;
    setTimeout(() => {
      if (old) old.classList.add('ic-out');
      setTimeout(() => {
        apply();
        const neu = el.firstElementChild;
        neu.classList.add('ic-in');
        requestAnimationFrame(() => requestAnimationFrame(() => neu.classList.remove('ic-in')));
      }, old ? 140 : 0);
    }, Math.min(i * stagger, max));
  });
}

/** English one-liners for each style (the kit's own STYLE_INFO blurbs are in Italian). */
export const BLURB = {
  linear: 'Clean 1.5px outline with round caps. Neutral and light.',
  light: 'A 1px outline. Elegant at large sizes and in airy UIs.',
  bold: 'A 2px outline. More presence at 16–20px and on busy backgrounds.',
  sharp: 'Crisp corners and flat caps. Technical, editorial.',
  twotone: 'Outline with secondary details at 40%.',
  duotone: 'Outline plus a 30% tonal fill. Depth without noise.',
  bulk: 'A 40% silhouette with crisp details on top.',
  solid: 'Filled shapes with negative-space details. Maximum legibility.',
  contained: 'The glyph cut out of a rounded square — app-icon ready.',
  soft: 'The glyph on a 12% tinted tile. For chips, lists and empty states.',
};

/**
 * Splits an icon into its two layers, for exploded views: `secondary` = nodes drawn with opacity
 * (Duotone fill, Bulk silhouette, Twotone details, Soft tile), `primary` = everything else.
 */
export function iconParts(name, style) {
  const nodes = data.icons[name]?.styles[style]?.nodes || [];
  const mk = (ns) => toSVG({ styles: { [style]: { nodes: ns } } }, style, { size: 24 }).replace('<svg', `<svg class="ic ic-${style}" aria-hidden="true" focusable="false"`);
  return { secondary: mk(nodes.filter(([, a]) => a.opacity)), primary: mk(nodes.filter(([, a]) => !a.opacity)) };
}
