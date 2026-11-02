import { ContentPage } from '../../components/ContentPage';

export const metadata = {
  title: 'Documentation — React, Vue, SVG and MCP',
  description: 'Install and use Nodo Icons with React, Vue, SVG, Figma, shadcn/ui and AI agents.',
  alternates: { canonical: '/docs/' },
};

export default function DocsPage() {
  return <ContentPage file="docs.md" />;
}
