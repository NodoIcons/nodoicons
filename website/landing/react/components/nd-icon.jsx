// Nodo icons inside React: the kit's own markup (Linear SVG or a Pro sprite preview, see shared/icons.js).
// Used in place of the icon library shadcn/ui ships with. Size: Tailwind size-* on the wrapper (default 16px).
import { cn } from '@/lib/utils';
import { icon } from '../../shared/icons.js';

/** `name` + `style` for the showcase icons; `html` for markup built elsewhere (the icon browser). */
export function NdIcon({ name, style = 'linear', html, className, ...props }) {
  return (
    <span
      data-slot="icon"
      aria-hidden="true"
      className={cn('inline-grid size-4 shrink-0 place-items-center', className)}
      style={{ '--s': '100%' }}
      dangerouslySetInnerHTML={{ __html: html ?? icon(name, style) }}
      {...props}
    />
  );
}
