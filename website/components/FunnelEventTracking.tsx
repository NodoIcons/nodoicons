'use client';

import { useEffect } from 'react';
import { track } from '@vercel/analytics';

export function FunnelEventTracking() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-analytics-event]') : null;
      if (!target?.dataset.analyticsEvent) return;
      const { format, location } = target.dataset;
      track(target.dataset.analyticsEvent, Object.fromEntries(Object.entries({ format, location }).filter(([, value]) => value)));
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
