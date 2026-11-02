// React islands on the static landing: each mount* renders one shadcn/ui control group into the page.
// The page itself (hero, rings, showcase stage, bento) stays plain HTML + JS.
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Browse } from './browse';
import { ShowcaseControls, type ShowcaseControlsProps } from './showcase-controls';
import { Plans, Notify } from './pricing';
import { CodeDemo } from './code-demo';

const mount = (el: Element, node: ReactNode) => { const root = createRoot(el); flushSync(() => root.render(<TooltipProvider delayDuration={300}>{node}</TooltipProvider>)); return root; };

export const mountBrowse = (el: Element, opts?: { full?: boolean }) => mount(el, <Browse {...opts} />);
export const mountPlans = (el: Element, opts: { count: number }) => mount(el, <Plans {...opts} />);
export const mountNotify = (el: Element) => mount(el, <Notify />);

/** Bento code tile; returns update(style) to follow the showcase's style switch. */
export function mountCode(el: Element, style: string) {
  const root = mount(el, <CodeDemo style={style} />);
  return (s: string) => root.render(<TooltipProvider><CodeDemo style={s} /></TooltipProvider>);
}

/** Returns update(patch) so the page can push the current tab / style (auto-advance). */
export function mountShowcase(el: Element, props: ShowcaseControlsProps) {
  let p = props;
  const root = mount(el, <ShowcaseControls {...p} />);
  return (patch: Partial<ShowcaseControlsProps>) => { p = { ...p, ...patch }; root.render(<TooltipProvider><ShowcaseControls {...p} /></TooltipProvider>); };
}

/**
 * Turns <a data-button="variant[:size]"> links in static HTML into shadcn Buttons (same href and text).
 * Rendered synchronously, so layout code that measures the page right after sees the final buttons.
 */
export function mountButtons(root: ParentNode = document) {
  for (const a of root.querySelectorAll<HTMLAnchorElement>('a[data-button]')) {
    const [variant = 'default', size = 'pill'] = a.dataset.button.split(':') as [ButtonProps['variant']?, ButtonProps['size']?];
    const host = document.createElement('span');
    host.className = 'contents';
    a.replaceWith(host);
    const attrs = Object.fromEntries([...a.attributes].filter((x) => !['class', 'data-button'].includes(x.name)).map((x) => [x.name === 'class' ? 'className' : x.name, x.value]));
    flushSync(() => createRoot(host).render(
      <Button asChild variant={variant} size={size} className={a.className}><a {...attrs} dangerouslySetInnerHTML={{ __html: a.innerHTML }} /></Button>,
    ));
  }
}
