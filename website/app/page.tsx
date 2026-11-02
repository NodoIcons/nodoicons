import { homeMarkup } from './home-markup';
import LandingRuntime from './LandingRuntime';

const product = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Nodo Icons',
  url: 'https://nodoicons.com',
  email: 'hello@nodoicons.com',
  description: '5,000 UI icons on a 24×24 grid in 10 styles for React, Vue, SVG, Figma and AI agents. Linear style free (MIT); Pro adds nine styles, one-time purchase with free updates forever.',
  brand: { '@type': 'Brand', name: 'Nodo Icons' },
  category: 'Icon set',
  offers: [
    { '@type': 'Offer', name: 'Pro — per 10 people (early access)', price: '49', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Enterprise — unlimited people', price: '499', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Free — Linear style (MIT)', price: '0', priceCurrency: 'USD' },
  ],
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }} />
      <div dangerouslySetInnerHTML={{ __html: homeMarkup }} />
      <LandingRuntime />
    </>
  );
}
