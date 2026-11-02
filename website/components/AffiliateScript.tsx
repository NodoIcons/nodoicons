'use client';

import { useEffect } from 'react';

export function AffiliateScript() {
  useEffect(() => {
    window.lemonSqueezyAffiliateConfig = { store: 'nodoicons' };
    const script = document.createElement('script');
    script.src = 'https://lmsqueezy.com/affiliate.js';
    script.defer = true;
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  return null;
}
