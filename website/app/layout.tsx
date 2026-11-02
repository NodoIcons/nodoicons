import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { AffiliateScript } from '../components/AffiliateScript';
import { FunnelEventTracking } from '../components/FunnelEventTracking';
import './globals.css';
import './documents.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://nodoicons.com'),
  title: { default: 'Nodo Icons — 5,000 UI icons in 10 styles', template: '%s — Nodo Icons' },
  description: '5,000 UI icons in 10 styles for React, Vue, SVG, Figma and AI agents. Linear style free (MIT). Pro: pay once, free updates forever.',
  openGraph: {
    type: 'website', siteName: 'Nodo Icons',
    title: 'Nodo Icons — 5,000 UI icons in 10 styles',
    description: 'React, Vue, SVG, Figma and AI agents. Linear style free (MIT). Pro: pay once, free updates forever.',
    url: 'https://nodoicons.com/', images: ['/assets/og.png'],
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/assets/favicon.svg', apple: '/assets/apple-touch-icon.png' },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/assets/landing-islands.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400..800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link href="https://api.fontshare.com/v2/css?f[]=general-sans@600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AffiliateScript />
        <FunnelEventTracking />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
