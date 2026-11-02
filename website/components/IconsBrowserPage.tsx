'use client';

import dynamic from 'next/dynamic';

const Browse = dynamic(() => import('../landing/react/browse').then((module) => module.Browse), { ssr: false });

export default function IconsBrowserPage() {
  return (
    <div className="catalog-page">
      <header className="document-top">
        <a href="/" aria-label="Nodo Icons home"><b>Nodo Icons</b></a>
        <nav><a href="/icons/">Icons</a><a href="/docs/">Docs</a><a href="/#pricing">Pricing</a></nav>
        <a className="document-button" href="/#pricing">Get Pro</a>
      </header>
      <main>
        <h1>5,000 icons</h1>
        <p className="catalog-lede">Browse the Linear style for free, or preview all ten styles.</p>
        <Browse full />
      </main>
    </div>
  );
}
