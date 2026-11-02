import { readContent } from '../../../../lib/content';

const files = { free: 'LICENSE-FREE.md', pro: 'LICENSE-PRO.md' };

export async function GET(_request, { params }) {
  const { type } = await params;
  if (!files[type]) return new Response('Not found', { status: 404 });
  return new Response(readContent('licenses', files[type]), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
