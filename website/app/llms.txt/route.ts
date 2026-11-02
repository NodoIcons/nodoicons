import { readContent } from '../../lib/content';

export function GET() {
  const text = `# Nodo Icons\n\n5,000 UI icons in 10 styles. Linear is free under MIT; nine additional styles are Nodo Icons Pro.\n\n## Docs\n\n- [Documentation](https://nodoicons.com/docs/index.md)\n- [Icon catalogue](https://nodoicons.com/catalog.json)\n- [Browse icons](https://nodoicons.com/icons/)\n\n## Licenses and pricing\n\n- [Free license](https://nodoicons.com/license/free/index.md)\n- [Pro license](https://nodoicons.com/license/pro/index.md)\n- [Pricing](https://nodoicons.com/#pricing)\n\n## Full text\n\n- [All icon names and docs](https://nodoicons.com/llms-full.txt)\n`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
