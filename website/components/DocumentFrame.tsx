import type { ReactNode } from 'react';

export function DocumentFrame({ children }: { children: ReactNode }) {
  return (
    <div className="document-page">
      <header className="document-top">
        <a href="/" aria-label="Nodo Icons home"><b>Nodo Icons</b></a>
        <nav><a href="/icons/">Icons</a><a href="/docs/">Docs</a><a href="/#pricing">Pricing</a></nav>
        <a className="document-button" href="/#pricing">Get Pro</a>
      </header>
      <main className="document-main">{children}</main>
      <footer className="document-foot">
        <span>Nodo Icons · <a href="mailto:hello@nodoicons.com">hello@nodoicons.com</a></span>
        <span><a href="/license/free/">MIT</a> · <a href="/license/pro/">Pro license</a> · <a href="/terms/">Terms</a> · <a href="/refunds/">Refunds</a> · <a href="/privacy/">Privacy</a></span>
      </footer>
    </div>
  );
}

export function MarkdownDocument({ source }: { source: string }) {
  return <article className="doc" dangerouslySetInnerHTML={{ __html: source }} />;
}
