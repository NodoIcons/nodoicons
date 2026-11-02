import { ContentPage } from './ContentPage';

export function LegalPage({ slug }: { slug: 'privacy' | 'terms' | 'refunds' }) {
  return <ContentPage file={`pages/${slug}.md`} />;
}
