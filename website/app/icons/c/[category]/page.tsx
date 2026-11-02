import { notFound } from 'next/navigation';
import { DocumentFrame } from '../../../../components/DocumentFrame';
import { categories, iconSvg, icons, titleCase } from '../../../../lib/catalog';

export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((category) => ({ category }));
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  return { title: `${titleCase(category)} icons`, description: `Free ${titleCase(category).toLowerCase()} icons in Linear, with nine more styles in Pro.` };
}

export default async function CategoryPage({ params }) {
  const { category } = await params;
  if (!categories.includes(category)) notFound();
  const list = icons.filter((icon) => icon.category === category);
  return (
    <DocumentFrame>
      <nav className="crumbs"><a href="/icons/">Icons</a> › <span>{titleCase(category)}</span></nav>
      <h1>{titleCase(category)} icons</h1>
      <p className="catalog-lede">{list.length} icons · free in Linear, ten styles with Pro.</p>
      <div className="catalog-grid">
        {list.map((icon) => <a className="catalog-cell" href={`/icons/${icon.name}/`} key={icon.name}><span dangerouslySetInnerHTML={{ __html: iconSvg(icon.name) }} /><span>{icon.name}</span></a>)}
      </div>
    </DocumentFrame>
  );
}
