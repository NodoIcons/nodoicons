import { icons } from '../../../lib/catalog';

export function GET() {
  return Response.json(icons.map(({ name, category, tags }) => [name, category, tags]), {
    headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
  });
}
