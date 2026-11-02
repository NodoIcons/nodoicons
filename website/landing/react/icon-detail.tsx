// Icon detail dialog (icon browser): big preview, the icon in all ten styles, size / colour / stroke,
// copy and download for the free Linear style, usage snippets (React, Vue, SVG, sprite, font, AI agents)
// and more icons from the same category. Pro styles are image previews only, with an unlock link.
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { track } from '@vercel/analytics';
import { KIT, STYLE_INFO, componentName, previewVersion } from '../shared/icons';
import { linearSVG, glyphHTML } from './glyph';
import type { CatalogItem, Nodes } from '../../lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { NdIcon } from '@/components/nd-icon';
import { TierBadge } from '@/components/tier-badge';

const FREE = 'linear';
const SIZES = [16, 20, 24, 32, 40, 48, 64, 96, 128, 256, 512];
const TABS = [['react', 'React'], ['vue', 'Vue'], ['svg', 'SVG'], ['sprite', 'Sprite'], ['font', 'Icon font'], ['ai', 'AI agents']];
const title = (s: string) => s[0].toUpperCase() + s.slice(1);

// Pro packages come from the Nodo Icons registry with the license key (docs: "Nodo Icons Pro in React and Vue")
const PRO_SETUP = (fw) => `# .npmrc — license key from your receipt, in the NODO_LICENSE_KEY env variable\n@nodo-icons:registry=https://nodoicons.com/npm/\n//nodoicons.com/npm/:_authToken=\${NODO_LICENSE_KEY}\n\nnpm install @nodo-icons/${fw}-pro\n\n`;

function snippets(item: CatalogItem, style: string, { size, color, stroke, svg }: { size: number; color: string; stroke: number; svg: string }) {
  const pro = style !== FREE;
  const c = componentName(item.name), n = item.name;
  const sw = !pro && stroke !== 1.5;
  const pkg = (fw) => (pro ? `@nodo-icons/${fw}-pro/${style}` : `@nodo-icons/${fw}`);
  const reactProps = [`size={${size}}`, color && `color="${color}"`, sw && `strokeWidth={${stroke}}`].filter(Boolean).join(' ');
  const vueProps = [`:size="${size}"`, color && `color="${color}"`, sw && `:stroke-width="${stroke}"`].filter(Boolean).join(' ');
  const from = (what) => (pro ? `${what} from your Pro download` : `${what} from @nodo-icons/static`);
  return {
    react: `${pro ? PRO_SETUP('react') : 'npm install @nodo-icons/react\n\n'}import { ${c} } from '${pkg('react')}';\n\n<${c} ${reactProps} />`,
    vue: `${pro ? PRO_SETUP('vue') : 'npm install @nodo-icons/vue\n\n'}<script setup>\nimport { ${c} } from '${pkg('vue')}';\n</script>\n\n<template>\n  <${c} ${vueProps} />\n</template>`,
    svg: pro ? `<!-- svg/${style}/${n}.svg from your Pro download -->\n<img src="svg/${style}/${n}.svg" width="${size}" height="${size}" alt="" />` : svg,
    sprite: `<!-- ${from(`sprite/${style}.svg`)} -->\n<svg width="${size}" height="${size}"${color ? ` color="${color}"` : ''}>\n  <use href="sprite/${style}.svg#nd-${n}" />\n</svg>`,
    font: `<!-- ${from(`font/${style}/`)} -->\n<link rel="stylesheet" href="font/${style}/nodo-icons-${style}.css" />\n\n<i class="nd-${style} nd-${n}" style="font-size: ${size}px${color ? `; color: ${color}` : ''}"></i>`,
    ai: `# Claude Code (other MCP clients: see the docs)\nclaude mcp add nodo-icons -- npx -y @nodo-icons/mcp${pro ? '\n# Pro styles: set NODO_PRO_DIR to your unzipped Pro download' : ''}\n\n# or from the terminal\nnpx @nodo-icons/mcp get ${n}${pro ? ` --style ${style}` : ''} --format ${pro ? 'svg' : 'react'}`,
  };
}

function useCopied() {
  const [done, setDone] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const copy = async (key: string, text: string) => {
    try { await navigator.clipboard.writeText(text); } catch { return; }
    setDone(key); clearTimeout(timer.current); timer.current = setTimeout(() => setDone(''), 1100);
  };
  return [done, copy] as const;
}
const save = (blob: Blob, file: string) => {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: file });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

function IconButton({ label, onClick, children, done }: { label: string; onClick?: () => void; children: ReactNode; done?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary" size="icon" aria-label={label} onClick={onClick} className={`rounded-xl ${done ? 'bg-brand text-white hover:bg-brand' : ''}`}>{children}</Button>
      </TooltipTrigger>
      <TooltipContent>{done ? 'Copied' : label}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Big preview. Pro styles start from the 64px sprite cell and switch to a sharp 192px render from
 * /api/pro-preview once it has loaded (on the dev server, without the API, the sprite cell stays).
 */
function Preview({ item, style, nodes, stroke, color }: { item: CatalogItem; style: string; nodes: Nodes; stroke: number; color: string }) {
  const src = style === FREE ? '' : `/api/pro-preview?style=${style}&icon=${item.name}&v=${previewVersion(style)}`;
  const [sharp, setSharp] = useState('');
  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.onload = () => setSharp(src);
    img.src = src;
    return () => { img.onload = null; };
  }, [src]);
  const css = { '--s': '100%', color: color || undefined } as CSSProperties;
  if (src && sharp === src) {
    const mask = `url("${src}") center / contain no-repeat`;
    return <span aria-hidden="true" className="block size-24 bg-current text-foreground" style={{ ...css, mask, WebkitMask: mask }} />;
  }
  return <NdIcon html={glyphHTML(item, style, nodes, { stroke })} className="size-24 text-foreground" css={css} />;
}

/** Controlled by the browser: `item` is the open icon; navigation and close go back through callbacks. */
export type IconDetailProps = {
  item: CatalogItem;
  style: string;
  list: CatalogItem[];
  all: CatalogItem[];
  nodes: Nodes;
  onNavigate: (icon: CatalogItem) => void;
  onClose: () => void;
};

export default function IconDetail({ item, style: startStyle, list, all, nodes, onNavigate, onClose }: IconDetailProps) {
  const [style, setStyle] = useState(startStyle);
  const [size, setSize] = useState(24);
  const [color, setColor] = useState('');
  const [stroke, setStroke] = useState(1.5);
  const [tab, setTab] = useState('react');
  const [done, copy] = useCopied();
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => { top.current?.scrollIntoView({ block: 'nearest' }); }, [item.name]);

  const pro = style !== FREE;
  const comp = componentName(item.name);
  const svg = linearSVG(nodes, item.name, { size, color: color || 'currentColor', stroke });
  const code = snippets(item, style, { size, color, stroke, svg });
  const related = all.filter((i) => i.category === item.category && i.name !== item.name).slice(0, 14);
  const step = (d: number) => {
    const i = list.findIndex((x) => x.name === item.name);
    if (i >= 0 && list.length) onNavigate(list[(i + d + list.length) % list.length]);
  };
  const png = () => {
    const img = new Image();
    img.onload = () => {
      const c = Object.assign(document.createElement('canvas'), { width: size, height: size });
      c.getContext('2d').drawImage(img, 0, 0, size, size);
      c.toBlob((b) => save(b, `${item.name}-${size}.png`), 'image/png');
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(linearSVG(nodes, item.name, { size, color: color || '#000000', stroke }))}`;
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('input, [role=tablist], [role=group], [role=slider], [role=combobox], [role=listbox]')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent showCloseButton={false} onKeyDown={onKeyDown} onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-h-[calc(100dvh-48px)] grid-cols-1 gap-0 overflow-y-auto overscroll-contain rounded-3xl p-0 text-base ring-0 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.45)] sm:max-w-[880px] max-sm:top-auto max-sm:bottom-0 max-sm:max-h-[92dvh] max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none">
        <div ref={top} className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-background/90 py-4 pr-5 pl-7 backdrop-blur-md max-sm:px-4">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{title(item.category)}</span><span className="opacity-50">›</span><span>{STYLE_INFO[style].label}</span><span className="opacity-50">›</span><b className="font-semibold text-foreground">{item.name}</b>
          </nav>
          <div className="flex gap-1.5">
            <IconButton label="Copy link to this icon" done={done === 'link'} onClick={() => copy('link', `${location.origin}/icons/${item.name}/`)}><NdIcon name="link" className="size-[18px]" /></IconButton>
            <IconButton label="Close (Esc)" onClick={onClose}><NdIcon name="close" className="size-[18px]" /></IconButton>
          </div>
        </div>

        <div className="grid grid-cols-[260px_1fr] gap-7 px-7 pt-2 max-sm:grid-cols-1 max-sm:gap-4 max-sm:px-4">
          <div className="group/stage relative grid aspect-square place-items-center rounded-[20px] bg-secondary bg-[radial-gradient(circle,rgba(0,0,0,0.07)_1px,transparent_1.2px)] bg-size-[14px_14px] max-sm:aspect-auto max-sm:h-[190px]">
            <Preview item={item} style={style} nodes={nodes} stroke={stroke} color={color} />
            {['prev', 'next'].map((d) => (
              <Button key={d} variant="secondary" size="icon-sm" aria-label={d === 'prev' ? 'Previous icon' : 'Next icon'} onClick={() => step(d === 'prev' ? -1 : 1)}
                className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white/85 opacity-0 transition-opacity group-hover/stage:opacity-100 focus-visible:opacity-100 max-sm:opacity-100 ${d === 'prev' ? 'left-2' : 'right-2'}`}>
                <NdIcon name={d === 'prev' ? 'chevron-left' : 'chevron-right'} />
              </Button>
            ))}
          </div>

          <div className="flex min-w-0 flex-col gap-3.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <DialogTitle className="text-[clamp(22px,3vw,30px)] font-bold tracking-[-0.03em] [overflow-wrap:anywhere]">{comp}</DialogTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="icon-sm" aria-label="Copy component name" onClick={() => copy('name', comp)} className={done === 'name' ? 'bg-brand text-white hover:bg-brand' : ''}><NdIcon name="copy" /></Button>
                </TooltipTrigger>
                <TooltipContent>{done === 'name' ? 'Copied' : 'Copy component name'}</TooltipContent>
              </Tooltip>
              <TierBadge pro={pro} />
            </div>
            <DialogDescription className="sr-only">{`${item.name} icon in the ${STYLE_INFO[style].label} style: preview, styles and code.`}</DialogDescription>
            <div className="flex flex-wrap gap-1.5">{item.tags.slice(0, 10).map((t) => <Badge key={t} variant="secondary" className="h-6 px-2.5 text-[12.5px] font-normal text-muted-foreground">{t}</Badge>)}</div>

            <div className="flex flex-wrap gap-2">
              <div className="inline-flex h-10 items-center gap-2 rounded-xl bg-secondary pl-3 text-[13px]">
                <span className="text-muted-foreground">Size</span>
                <Select value={String(size)} onValueChange={(v) => setSize(+v)}>
                  <SelectTrigger size="sm" aria-label="Size" className="h-8 border-0 bg-transparent px-2 font-semibold shadow-none"><SelectValue /></SelectTrigger>
                  <SelectContent position="popper">{SIZES.map((s) => <SelectItem key={s} value={String(s)}>{s}px</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <label className="inline-flex h-10 items-center gap-2 rounded-xl bg-secondary px-3 text-[13px]">
                <span className="text-muted-foreground">Color</span>
                <input type="color" value={color || '#1d1d1f'} onChange={(e) => setColor(e.target.value)} aria-label="Color"
                  className="size-[22px] cursor-pointer rounded-md border-0 bg-transparent p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border [&::-webkit-color-swatch]:border-black/10 [&::-webkit-color-swatch-wrapper]:p-0" />
                <span className="font-mono text-xs">{color || 'currentColor'}</span>
                {color && <Button variant="ghost" size="icon-xs" aria-label="Back to currentColor" onClick={(e) => { e.preventDefault(); setColor(''); }}><NdIcon name="undo" className="size-3.5" /></Button>}
              </label>
              {!pro && (
                <div className="inline-flex h-10 items-center gap-3 rounded-xl bg-secondary px-3 text-[13px]">
                  <span className="text-muted-foreground">Stroke</span>
                  <Slider min={0.5} max={3} step={0.25} value={[stroke]} onValueChange={([v]) => setStroke(v)} aria-label="Stroke width" className="w-24" />
                  <span className="w-11 font-mono text-xs">{stroke}px</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {pro ? (
                <>
                  <Button asChild size="pill-sm"><a href="/#pricing">Unlock {STYLE_INFO[style].label} with Pro</a></Button>
                  <p className="basis-full text-[13.5px] text-muted-foreground">Every style as SVG, PNG, PDF, icon font, sprite and in Figma. Previews here are images.</p>
                </>
              ) : (
                <>
                  <Button size="pill-sm" onClick={() => copy('svg', svg)} className={done === 'svg' ? 'bg-brand hover:bg-brand' : ''}><NdIcon name="copy" />{done === 'svg' ? 'Copied' : 'Copy SVG'}</Button>
                  <Button variant="secondary" size="pill-sm" onClick={() => { track('free_download', { format: 'svg', location: 'icon_browser' }); save(new Blob([svg], { type: 'image/svg+xml' }), `${item.name}.svg`); }}><NdIcon name="download" />SVG</Button>
                  <Button variant="secondary" size="pill-sm" onClick={() => { track('free_download', { format: 'png', location: 'icon_browser' }); png(); }}><NdIcon name="download" />PNG {size}px</Button>
                </>
              )}
            </div>
          </div>
        </div>

        <section className="px-7 pt-5 max-sm:px-4">
          <p className="mb-2.5 text-[13px] font-semibold text-muted-foreground">Styles</p>
          <ToggleGroup type="single" value={style} onValueChange={(v) => {
              if (!v) return;
              setStyle(v);
              if (v !== FREE) track('pro_style_preview', { style: v, location: 'icon_browser' });
            }} aria-label="Style" className="grid w-full grid-cols-10 gap-1.5 max-sm:grid-cols-5">
            {KIT.styles.map((s) => (
              <ToggleGroupItem key={s} value={s} title={`${STYLE_INFO[s].label} · ${s === FREE ? 'free' : 'Pro'}`}
                className="h-auto flex-col gap-1.5 rounded-xl border border-transparent bg-secondary px-0.5 pt-3 pb-2 text-[11px] font-normal text-muted-foreground hover:bg-accent data-[state=on]:border-primary data-[state=on]:bg-background data-[state=on]:font-semibold data-[state=on]:text-foreground">
                <NdIcon html={glyphHTML(item, s, nodes)} className="size-6 text-foreground" />
                {STYLE_INFO[s].label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </section>

        <section className="px-7 pt-5 max-sm:px-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList variant="line" className="h-auto flex-wrap justify-start gap-1 p-0">
              {TABS.map(([k, l]) => (
                <TabsTrigger key={k} value={k} className="h-8 flex-none rounded-lg px-3 text-sm after:hidden data-active:bg-primary! data-active:text-primary-foreground!">{l}</TabsTrigger>
              ))}
            </TabsList>
            {TABS.map(([k]) => (
              <TabsContent key={k} value={k} className="relative mt-1">
                <pre className="max-h-[260px] overflow-auto rounded-[14px] bg-[#0c0c0e] py-[18px] pr-24 pl-5 font-mono text-[12.5px] leading-[1.7] whitespace-pre text-zinc-200">{code[k]}</pre>
                <Button size="xs" onClick={() => copy(`code-${k}`, code[k])} className={`absolute top-2.5 right-2.5 bg-zinc-800 text-zinc-50 hover:bg-zinc-700 ${done === `code-${k}` ? 'bg-brand hover:bg-brand' : ''}`}>
                  {done === `code-${k}` ? 'Copied' : 'Copy'}
                </Button>
              </TabsContent>
            ))}
          </Tabs>
          <p className="mt-2.5 text-[13px] text-muted-foreground [&_a]:text-brand">
            {pro ? <>{STYLE_INFO[style].label} is part of <a href="/#pricing">Nodo Icons Pro</a>. </> : <>Linear is free under the <a href="/license/free/">MIT license</a>. </>}
            <a href={`/icons/${item.name}/`}>Icon page</a> · <a href="/docs/">Docs</a>
          </p>
        </section>

        <section className="px-7 pt-5 pb-7 max-sm:px-4 max-sm:pb-5">
          <p className="mb-2.5 text-[13px] font-semibold text-muted-foreground">More in {title(item.category)}</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(52px,1fr))] gap-1.5">
            {related.map((i) => (
              <Button key={i.name} variant="secondary" title={i.name} aria-label={i.name} onClick={() => onNavigate(i)} className="aspect-square h-auto rounded-xl p-0 hover:bg-accent">
                <NdIcon html={glyphHTML(i, style, nodes)} className="size-[22px]" />
              </Button>
            ))}
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
