// Nodo icons inside React: the kit's own markup (Linear SVG or a Pro sprite preview, see shared/icons.ts).
// Used in place of the icon library shadcn/ui ships with. Size: Tailwind size-* on the wrapper (default 16px).
import type { ComponentProps, CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { icon } from '../../shared/icons';

export type NdIconProps = Omit<ComponentProps<'span'>, 'style'> & {
  /** Icon name (with `style`) for the showcase icons. */
  name?: string;
  /** Icon style (linear, duotone, …). Not the CSS style: use `css` for that. */
  style?: string;
  /** Ready markup built elsewhere (the icon browser). */
  html?: string;
  /** Inline CSS for the wrapper (e.g. a colour for the preview). */
  css?: CSSProperties;
};

/** `name` + `style` for the showcase icons; `html` for markup built elsewhere (the icon browser). */
export function NdIcon({ name, style = 'linear', html, className, css, ...props }: NdIconProps) {
  return (
    <span
      data-slot="icon"
      aria-hidden="true"
      className={cn('inline-grid size-4 shrink-0 place-items-center', className)}
      style={{ '--s': '100%', ...css } as CSSProperties}
      dangerouslySetInnerHTML={{ __html: html ?? icon(name, style) }}
      {...props}
    />
  );
}
