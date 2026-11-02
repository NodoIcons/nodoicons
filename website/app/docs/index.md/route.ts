import { readContent } from '../../../lib/content';

export function GET() {
  return new Response(readContent('docs.md'), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
