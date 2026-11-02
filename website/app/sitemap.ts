import { icons, categories } from '../lib/catalog';

const root = 'https://nodoicons.com';

export default function sitemap() {
  const paths = [
    '/', '/icons/', '/docs/', '/license/free/', '/license/pro/', '/terms/', '/refunds/', '/privacy/',
    ...categories.map((category) => `/icons/c/${category}/`),
    ...icons.map((icon) => `/icons/${icon.name}/`),
  ];
  return paths.map((path) => ({ url: `${root}${path}` }));
}
