import { iconMap, componentFor } from '../../../../lib/catalog';

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const icon = iconMap.get(name);
  if (!icon) return new Response('Not found', { status: 404 });
  const component = componentFor(name);
  const tags = icon.tags.join(', ');
  const body = `# ${name.replaceAll('-', ' ')} icon\n\nFree in the Linear style under MIT. Available in ten styles with Nodo Icons Pro.\n\n- Category: ${icon.category}\n- Tags: ${tags}\n- SVG: https://nodoicons.com/svg/linear/${name}.svg\n- React: \`import { ${component} } from '@nodo-icons/react'\`\n- Page: https://nodoicons.com/icons/${name}/\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
