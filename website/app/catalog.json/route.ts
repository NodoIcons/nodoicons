import { icons } from '../../lib/catalog';
import { componentFor } from '../../lib/catalog';

const styles = ['linear', 'light', 'bold', 'sharp', 'twotone', 'duotone', 'bulk', 'solid', 'contained', 'soft'];

export function GET() {
  return Response.json({
    name: 'Nodo Icons',
    version: '0.1.1',
    count: icons.length,
    styles: styles.map((style) => ({ style, tier: style === 'linear' ? 'free' : 'pro' })),
    packages: { react: '@nodo-icons/react', vue: '@nodo-icons/vue', static: '@nodo-icons/static', mcp: '@nodo-icons/mcp' },
    icons: icons.map((icon) => ({
      name: icon.name,
      component: componentFor(icon.name),
      category: icon.category,
      tags: icon.tags,
      svg: `https://nodoicons.com/svg/linear/${icon.name}.svg`,
      page: `https://nodoicons.com/icons/${icon.name}/`,
    })),
  }, { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } });
}
