import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { CSSProperties } from 'react';
import { componentName, toSVG } from './render';
import type { CatalogItem, Nodes } from './types';

const root = process.cwd();
export const icons: CatalogItem[] = JSON.parse(readFileSync(join(root, 'public/data/index.json'), 'utf8')).icons.map(
  ([name, category, tags]: [string, string, string[]], idx: number) => ({ name, category, tags, idx }),
);
export const linear: Nodes = JSON.parse(readFileSync(join(root, 'public/data/linear.json'), 'utf8'));
export const iconMap = new Map<string, CatalogItem>(icons.map((icon) => [icon.name, icon]));
const sprites = JSON.parse(readFileSync(join(root, 'landing/data/icons.json'), 'utf8')).sprites;
export const categories: string[] = [...new Set(icons.map((icon) => icon.category))].sort();
export const componentFor = componentName;

export function iconSvg(name: string, size = 24) {
  const nodes = linear[name];
  if (!nodes) return '';
  return toSVG({ styles: { linear: { nodes } } }, 'linear', { size });
}

export function titleCase(value: string) {
  return value.replaceAll('-', ' ').replace(/^\w/, (letter) => letter.toUpperCase());
}

/** CSS mask of a Pro style preview from the sprite sheets (the site never ships Pro vectors). */
export function proSprite(icon: CatalogItem, style: string): { className: string; style: CSSProperties } {
  const { files, chunk, cols, rows } = sprites.all;
  const layered = sprites.layered.includes(style);
  const index = icon.idx % chunk;
  const countRows = rows * (layered ? 2 : 1);
  const x = cols > 1 ? `${+((index % cols) / (cols - 1) * 100).toFixed(4)}%` : '0%';
  const y = Math.floor(index / cols);
  const pos = (row: number) => `${x} ${countRows > 1 ? +((row / (countRows - 1)) * 100).toFixed(4) : 0}%`;
  return {
    className: `pro-icon${layered ? ' layered' : ''}`,
    style: {
      '--icon-sheet': `url(/sprites/${files[style][Math.floor(icon.idx / chunk)]})`,
      '--icon-sheet-size': `${cols * 100}% ${countRows * 100}%`,
      '--icon-position': pos(y),
      ...(layered ? { '--icon-position-secondary': pos(y + rows) } : {}),
    } as CSSProperties,
  };
}
