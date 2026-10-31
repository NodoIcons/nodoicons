// React islands on the static landing: each mount* renders one shadcn/ui control group into the page.
// The page itself (hero, rings, showcase stage, bento) stays plain HTML + JS.
import './styles.css';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Browse } from './browse.jsx';
import { ShowcaseControls } from './showcase-controls.jsx';
import { Plans, Notify } from './pricing.jsx';

const mount = (el, node) => { const root = createRoot(el); flushSync(() => root.render(<TooltipProvider delayDuration={300}>{node}</TooltipProvider>)); return root; };

export const mountBrowse = (el, opts) => mount(el, <Browse {...opts} />);
export const mountPlans = (el, opts) => mount(el, <Plans {...opts} />);
export const mountNotify = (el) => mount(el, <Notify />);

/** Returns update(patch) so the page can push the current tab / style (auto-advance). */
export function mountShowcase(el, props) {
  let p = props;
  const root = mount(el, <ShowcaseControls {...p} />);
  return (patch) => { p = { ...p, ...patch }; root.render(<TooltipProvider><ShowcaseControls {...p} /></TooltipProvider>); };
}

/**
 * Turns <a data-button="variant[:size]"> links in static HTML into shadcn Buttons (same href and text).
 * Rendered synchronously, so layout code that measures the page right after sees the final buttons.
 */
export function mountButtons(root = document) {
  for (const a of root.querySelectorAll('a[data-button]')) {
    const [variant = 'default', size = 'pill'] = a.dataset.button.split(':');
    const host = document.createElement('span');
    host.className = 'contents';
    a.replaceWith(host);
    const attrs = Object.fromEntries([...a.attributes].filter((x) => !['class', 'data-button'].includes(x.name)).map((x) => [x.name === 'class' ? 'className' : x.name, x.value]));
    flushSync(() => createRoot(host).render(
      <Button asChild variant={variant} size={size} className={a.className}><a {...attrs} dangerouslySetInnerHTML={{ __html: a.innerHTML }} /></Button>,
    ));
  }
}
