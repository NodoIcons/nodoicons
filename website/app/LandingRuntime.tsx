'use client';

import { useEffect } from 'react';

export default function LandingRuntime() {
  useEffect(() => {
    import('../landing/home/main');
  }, []);

  return null;
}
