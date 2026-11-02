import { DocumentFrame, MarkdownDocument } from './DocumentFrame';
import { readContent } from '../lib/content';
import { markdown } from '../lib/markdown';

export function ContentPage({ file, isLicense = false }: { file: string; isLicense?: boolean }) {
  const source = isLicense ? readContent('licenses', file) : readContent(file);
  const dated = source.replaceAll('[date]', new Date().toISOString().slice(0, 10));
  return <DocumentFrame><MarkdownDocument source={markdown(dated)} /></DocumentFrame>;
}
