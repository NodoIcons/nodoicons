import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function readContent(...parts) {
  return readFileSync(join(process.cwd(), 'content', ...parts), 'utf8');
}
