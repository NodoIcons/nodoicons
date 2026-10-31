// Icon helpers for the landing previews. Data = landing/data/icons.json (see scripts/snapshot.mjs).
// Linear (free) is drawn with the kit's own renderer (src/render.js); the Pro styles are raster
// previews from sprite sheets (/sprites, see scripts/sprites.mjs), used as CSS masks so they still
// take the page colour (--tint) and, for layered styles, a second colour (--tint-2).
import { toSVG, STYLE_INFO, componentName } from '../../../lib/render.js';
import data from '../data/icons.json';

export const KIT = {
  count: data.count,
  categories: data.categories,
  styles: data.styles,
  names: Object.keys(data.icons),
  variants: data.count * data.styles.length,
};
export { STYLE_INFO, toSVG, componentName };
export const fmt = (n) => n.toLocaleString('en-US');

const SP = data.sprites;
const pct = (k, n) => `${n > 1 ? +((k / (n - 1)) * 100).toFixed(4) : 0}%`;
/** One cell of a sprite sheet as a masked <span class="ic">: ::after = main layer, ::before = secondary layer. */
function sprite(file, cols, rows, k, style) {
  const layered = SP.layered.includes(style);
  const R = rows * (layered ? 2 : 1), x = pct(k % cols, cols), y = Math.floor(k / cols);
  const vars = `--m:url(/sprites/${file});--z:${cols * 100}% ${R * 100}%;--p:${x} ${pct(y, R)}${layered ? `;--p2:${x} ${pct(y + rows, R)}` : ''}`;
  return `<span class="ic ic-${style} ic-img${layered ? ' ic-l' : ''}" aria-hidden="true" style="${vars}"></span>`;
}
const isPro = (style) => Boolean(SP.show.files[style]);

/** Markup for one icon in one style: <svg> for Linear, a sprite preview for Pro. Size is driven by CSS (--s, default 24px). */
export function icon(name, style = 'linear', { strokeWidth } = {}) {
  const ic = data.icons[name];
  if (!ic) return `<svg class="ic" viewBox="0 0 24 24"></svg>`;
  if (isPro(style)) return sprite(SP.show.files[style], SP.show.cols, SP.show.rows, ic.i, style);
  return toSVG(ic, 'linear', { size: 24, strokeWidth }).replace('<svg', `<svg class="ic ic-linear" aria-hidden="true" focusable="false"`);
}

/** Pro preview of any icon of the kit, by its position in /data/index.json (the icon browser). */
export function catalogIcon(index, style) {
  const { files, chunk, cols, rows } = SP.all;
  return sprite(files[style][Math.floor(index / chunk)], cols, rows, index % chunk, style);
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
