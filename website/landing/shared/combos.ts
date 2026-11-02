// "Combo sequencer": a pinned section steps through {style, background, tint} combinations
// as the user scrolls. Each step's colours are applied as CSS variables on the section,
// icons inside re-render in the step's style. Skins decide the steps and the look.
import { swapStyle } from './icons';
import { progress } from './scroll';

/**
 * @param {HTMLElement} section   tall wrapper (height ≈ steps × 100vh) containing a sticky stage
 * @param {Array<{style:string, label?:string, vars?:Record<string,string>, cls?:string}>} steps
 * @param {{ target?: HTMLElement|HTMLElement[], onStep?: (step, i) => void }} opts
 */
export type ComboStep = { style: string; label?: string; vars?: Record<string, string>; cls?: string };

export function sequence(
  section: HTMLElement,
  steps: ComboStep[],
  { target, onStep }: { target?: HTMLElement | HTMLElement[]; onStep?: (step: ComboStep, i: number) => void } = {},
) {
  if (!section) return;
  const targets: HTMLElement[] = [].concat(target || section);
  let current = -1;
  const go = (i) => {
    if (i === current) return;
    const prev = steps[current];
    current = i;
    const step = steps[i];
    if (prev?.cls) section.classList.remove(prev.cls);
    if (step.cls) section.classList.add(step.cls);
    for (const [k, v] of Object.entries(step.vars || {})) section.style.setProperty(k, v);
    section.dataset.step = String(i);
    targets.forEach((t) => swapStyle(t, step.style));
    onStep?.(step, i);
  };
  go(0);
  progress(section, (p) => go(Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999))));
  return { go };
}

/** Cycles a container through styles on a timer while it is on screen. */
export function autoCycle(el, styles, ms = 2200) {
  let i = 0, timer = null;
  const io = new IntersectionObserver(([e]) => {
    clearInterval(timer);
    if (e.isIntersecting && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timer = setInterval(() => swapStyle(el, styles[(i = (i + 1) % styles.length)], { stagger: 40 }), ms);
    }
  });
  io.observe(el);
}
