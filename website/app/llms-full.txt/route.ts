import { icons } from '../../lib/catalog';
import { readContent } from '../../lib/content';

export function GET() {
  const docs = readContent('docs.md');
  const list = icons.map((icon) => `- ${icon.name} · ${icon.category} · ${icon.tags.join(', ')}`).join('\n');
  return new Response(`${docs}\n\n## All icons (name · category · tags)\n\n${list}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
