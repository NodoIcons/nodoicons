// "Browse every icon" (landing section, compact) and /icons/ (full page), built with shadcn/ui.
// Linear is free (MIT) and drawn as SVG from /data/linear.json; the nine other styles are Pro and are
// shown as image previews (sprite sheets, shared/icons.js). A click opens the detail dialog (icon-detail.jsx).
//   compact: one screen tall, only the rows that fit; "See all" links to /icons/ with the same filters
//   full:    filters (and the open icon) live in the URL; "Show more" appends pages
import { Suspense, lazy, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { KIT, STYLE_INFO, fmt } from '../shared/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { NdIcon } from '@/components/nd-icon';
import { TierBadge } from '@/components/tier-badge';
import { glyphHTML } from './glyph';
import type { CatalogItem, Nodes } from '../../lib/types';

// The detail dialog (and its Radix parts) loads on the first click.
const IconDetail = lazy(() => import('./icon-detail'));

const PAGE = 240;
const FREE = 'linear';
const ALL = 'all'; // Select items can't use an empty value

type Catalog = { status: 'idle' | 'loading' | 'ready' | 'error'; icons?: CatalogItem[]; nodes?: Nodes; cats?: string[] };

function useCatalog(start: boolean): Catalog {
  const [state, setState] = useState<Catalog>({ status: 'idle' });
  useEffect(() => {
    if (!start || state.status !== 'idle') return;
    setState({ status: 'loading' });
    Promise.all([fetch('/data/index.json').then((r) => r.json()), fetch('/data/linear.json').then((r) => r.json())])
      .then(([index, nodes]) => {
        const icons: CatalogItem[] = index.icons.map(([name, category, tags]: [string, string, string[]], idx: number) => ({ name, category, tags, idx, hay: `${name.replace(/-/g, ' ')} ${tags.join(' ')} ${category}` }));
        setState({ status: 'ready', icons, nodes, cats: [...new Set(icons.map((i) => i.category))].sort() });
      })
      .catch(() => setState({ status: 'error' }));
  }, [start, state.status]);
  return state;
}

export function Browse({ full = false }: { full?: boolean }) {
  const root = useRef<HTMLDivElement>(null), grid = useRef<HTMLDivElement>(null);
  const url = full ? new URLSearchParams(location.search) : new URLSearchParams();
  const [q, setQ] = useState(url.get('q') || '');
  const [cat, setCat] = useState(url.get('cat') || '');
  const [style, setStyle] = useState(KIT.styles.includes(url.get('style')) ? url.get('style') : FREE);
  const [open, setOpen] = useState(url.get('icon') || '');
  const [limit, setLimit] = useState(PAGE);
  const [fit, setFit] = useState(PAGE);
  const [visible, setVisible] = useState(full);
  const data = useCatalog(visible);

  // compact: load when the section gets close to the viewport
  useEffect(() => {
    if (full) return;
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); setVisible(true); } }, { rootMargin: '600px 0px' });
    io.observe(root.current);
    return () => io.disconnect();
  }, [full]);

  const list = useMemo(() => {
    if (data.status !== 'ready') return [];
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return data.icons.filter((i) => (!cat || i.category === cat) && words.every((w) => i.hay.includes(w)));
  }, [data, q, cat]);
  const shown = list.slice(0, full ? limit : fit);

  // compact: show only the rows that fit in the grid's box (one screen minus the section's chrome)
  useLayoutEffect(() => {
    if (full) return;
    const measure = () => {
      const g = grid.current, probe = g?.firstElementChild as HTMLElement | null;
      if (!probe) return;
      const cols = getComputedStyle(g).gridTemplateColumns.split(' ').length;
      const gap = parseFloat(getComputedStyle(g).rowGap) || 0;
      const rows = Math.max(1, Math.floor((g.clientHeight + gap) / (probe.offsetHeight + gap)));
      setFit(cols * rows);
    };
    measure();
    let w = innerWidth, h = innerHeight;
    const onResize = () => { if (innerWidth !== w || innerHeight !== h) { w = innerWidth; h = innerHeight; setFit(PAGE); requestAnimationFrame(measure); } };
    addEventListener('resize', onResize);
    return () => removeEventListener('resize', onResize);
  }, [full, data.status, list.length > 0]);

  const query = (withIcon) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (cat) p.set('cat', cat);
    if (style !== FREE) p.set('style', style);
    if (withIcon && open) p.set('icon', open);
    return p.toString() ? `?${p}` : '';
  };
  useEffect(() => { if (full) history.replaceState(null, '', `${location.pathname}${query(true)}`); }, [full, q, cat, style, open]);

  const openItem = data.status === 'ready' && open ? data.icons.find((i) => i.name === open) : null;
  const pro = style !== FREE;
  const count = data.status === 'loading' || data.status === 'idle' ? 'Loading icons…'
    : data.status === 'error' ? 'Could not load the icons. Reload the page to try again.'
    : pro ? `${fmt(list.length)} of ${fmt(data.icons.length)} icons · ${STYLE_INFO[style].label} is a Pro style · previews shown as images`
    : `${fmt(list.length)} of ${fmt(data.icons.length)} icons · Linear is free (MIT) · click an icon for code and downloads`;
  const more = list.length > shown.length;

  return (
    <div ref={root} className="br-root">
      <div className="flex flex-wrap gap-2.5">
        <label className="relative flex-[1_1_320px]">
          <NdIcon name="search" className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted-foreground" />
          <Input type="search" value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} autoFocus={full} autoComplete="off"
            placeholder="Search icons — e.g. trash, credit card, cloud rain" aria-label="Search icons"
            className="h-12 rounded-[14px] border-transparent bg-secondary pl-11 text-base shadow-none md:text-base" />
        </label>
        <Select value={cat || ALL} onValueChange={(v) => { setCat(v === ALL ? '' : v); setLimit(PAGE); }}>
          <SelectTrigger aria-label="Category" className="h-12! min-w-[190px] rounded-[14px] border-transparent bg-secondary px-4 text-base shadow-none max-sm:flex-1">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent position="popper" className="max-h-80">
            <SelectItem value={ALL}>All categories</SelectItem>
            {(data.cats || (cat ? [cat] : [])).map((c) => <SelectItem key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <ToggleGroup type="single" value={style} onValueChange={(v) => { if (v) { setStyle(v); setLimit(PAGE); } }} aria-label="Icon style" className="mt-4 mb-3 flex w-full flex-wrap gap-2">
        {KIT.styles.map((s) => (
          <ToggleGroupItem key={s} value={s} variant="outline"
            className="h-[34px] rounded-full bg-background px-3 text-sm data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            {STYLE_INFO[s].label}
            <TierBadge pro={s !== FREE} className="group-data-[state=on]/toggle:bg-white/15 group-data-[state=on]/toggle:text-white" />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <p className="br-count mono">{count}</p>
      <div ref={grid} className="br-grid">
        {shown.map((i) => (
          <Button key={i.name} variant="secondary" onClick={() => setOpen(i.name)} title={`${i.name}${pro ? ` · ${STYLE_INFO[style].label} (Pro)` : ''}`}
            className="h-auto min-w-0 flex-col gap-2 rounded-[14px] px-1.5 pt-[18px] pb-2.5 font-normal hover:-translate-y-px hover:bg-accent">
            <NdIcon html={glyphHTML(i, style, data.nodes)} className="size-[26px]" />
            <span className="max-w-full truncate text-[11px] text-muted-foreground">{i.name}</span>
          </Button>
        ))}
      </div>
      {data.status === 'ready' && !list.length && <p className="py-10 text-center text-muted-foreground">No icons match. Try another word.</p>}
      <div className={`flex justify-center ${full ? 'mt-[18px]' : 'mt-3.5'}`}>
        {full
          ? more && <Button variant="secondary" size="pill" onClick={() => setLimit((l) => l + PAGE)}>Show more</Button>
          : <Button asChild variant="secondary" size="pill" className={data.status === 'ready' && more ? '' : 'invisible'}><a href={`/icons/${query(false)}`}>See all {fmt(list.length)} icons</a></Button>}
      </div>

      {full && data.status === 'ready' && (
        <nav aria-label="Icon categories" className="mt-14 border-t border-border pt-8">
          <h3 className="mb-3 text-[13px] font-semibold text-muted-foreground">Browse by category</h3>
          <div className="flex flex-wrap gap-1.5">
            {data.cats.map((c) => (
              <Button key={c} asChild variant="secondary" size="sm" className="rounded-full font-normal">
                <a href={`/icons/c/${c}/`}>{c[0].toUpperCase() + c.slice(1)} <span className="text-muted-foreground">{data.icons.filter((i) => i.category === c).length}</span></a>
              </Button>
            ))}
          </div>
        </nav>
      )}
      {openItem && (
        <Suspense fallback={null}>
          <IconDetail item={openItem} style={style} list={list} all={data.icons} nodes={data.nodes}
            onNavigate={(it) => setOpen(it.name)} onClose={() => setOpen('')} />
        </Suspense>
      )}
    </div>
  );
}
