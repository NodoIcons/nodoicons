'use client';

import { track } from '@vercel/analytics';

export function TrackedDownload({ href, name }: { href: string; name: string }) {
  return (
    <a className="document-button" href={href} download onClick={() => track('free_download', { format: 'svg', location: 'icon_page' })}>
      Download {name} SVG
    </a>
  );
}

export function CopyCodeButton({ text }: { text: string }) {
  return <button className="document-button" onClick={() => navigator.clipboard.writeText(text)}>Copy React</button>;
}
