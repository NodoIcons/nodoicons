// Shared data shapes for the website: the icon catalog (public/data/index.json) and the compiled
// Linear geometry (public/data/linear.json), as consumed by both the server (lib/catalog.ts) and
// the landing's client code (landing/).

/** One compiled SVG node: [tag, attributes]. */
export type IconNode = [string, Record<string, string | number>];

/** Geometry of every icon in one style: icon name → nodes. */
export type Nodes = Record<string, IconNode[]>;

/** One row of the catalog index. `idx` is the position in index.json (also the sprite cell). */
export type CatalogItem = {
  name: string;
  category: string;
  tags: string[];
  idx: number;
  /** Search haystack, built client-side by the icon browser. */
  hay?: string;
};
