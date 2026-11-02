import { notFound } from 'next/navigation';
import { DocumentFrame } from '../../../components/DocumentFrame';
import { CopyCodeButton, TrackedDownload } from '../../../components/TrackedDownload';
import { componentFor, iconMap, iconSvg, icons, proSprite, titleCase } from '../../../lib/catalog';

export const dynamicParams = false;

export function generateStaticParams() {
  return icons.map(({ name }) => ({ name }));
}

type Params = { params: Promise<{ name: string }> };

export async function generateMetadata({ params }: Params) {
  const { name } = await params;
  const icon = iconMap.get(name);
  if (!icon) return {};
  const title = titleCase(name);
  return {
    title: `${title} icon — free SVG, React & Vue`,
    description: `${title} icon in the free Linear style, plus nine Pro styles. SVG, React and Vue. Tags: ${icon.tags.slice(0, 5).join(', ')}.`,
    alternates: { canonical: `/icons/${name}/` },
    openGraph: { images: ['/assets/og.png'] },
  };
}

export default async function IconPage({ params }: Params) {
  const { name } = await params;
  const icon = iconMap.get(name);
  if (!icon) notFound();
  const label = titleCase(name);
  const svg = iconSvg(name, 160);
  const component = componentFor(name);
  const usage = `import { ${component} } from '@nodo-icons/react';\n\n<${component} size={24} />`;
  const styles = ['linear', 'light', 'bold', 'sharp', 'twotone', 'duotone', 'bulk', 'solid', 'contained', 'soft'];

  return (
    <DocumentFrame>
      <nav className="crumbs"><a href="/icons/">Icons</a> › <a href={`/icons/c/${icon.category}/`}>{titleCase(icon.category)}</a> › <span>{label}</span></nav>
      <section className="catalog-detail-hero">
        <div className="catalog-detail-canvas" dangerouslySetInnerHTML={{ __html: svg }} />
        <div>
          <h1>{label} icon</h1>
          <p className="catalog-lede">Free in the Linear style (MIT). Available in 10 styles with Nodo Icons Pro.</p>
          <div className="catalog-actions">
            <TrackedDownload href={`/svg/linear/${name}.svg`} name={label} />
            <CopyCodeButton text={usage} />
          </div>
          <p className="tags">{icon.tags.map((tag) => <span key={tag}>{tag}</span>)}</p>
        </div>
      </section>
      <section>
        <h2>All styles</h2>
        <div className="catalog-styles">
          {styles.map((style) => (
            <a className={style === 'linear' ? 'free' : 'pro'} href={`/icons/?icon=${name}&style=${style}`} key={style}>
              {style === 'linear'
                ? <span dangerouslySetInnerHTML={{ __html: iconSvg(name) }} />
                : <span aria-label={`${label} icon, ${style} style`} {...proSprite(icon, style)} />}
              <span>{titleCase(style)}<b>{style === 'linear' ? 'Free' : 'Pro'}</b></span>
            </a>
          ))}
        </div>
        <p className="hint">Pro styles are shown as image previews. <a href={`/icons/?icon=${name}`}>Open in the icon browser →</a></p>
      </section>
      <section className="catalog-code">
        <h2>Use it</h2>
        <p><code>npm install @nodo-icons/react</code></p>
        <pre><code>{usage}</code></pre>
        <p className="hint">Pro styles: <a href="/docs/#nodo-icons-pro-in-react-and-vue">install with a license key</a> · AI agents: <code>npx @nodo-icons/mcp</code></p>
      </section>
      <section className="catalog-cta">
        <div><h2>Get all 10 styles</h2><p>Every icon in ten styles, all formats and future updates.</p></div>
        <a className="document-button" href="/#pricing" data-analytics-event="pricing_cta_click" data-analytics-location="icon_page">Get early access — $49</a>
      </section>
    </DocumentFrame>
  );
}
