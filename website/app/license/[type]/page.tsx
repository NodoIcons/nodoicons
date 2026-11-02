import { notFound } from 'next/navigation';
import { ContentPage } from '../../../components/ContentPage';

const licenses = {
  free: { file: 'LICENSE-FREE.md', title: 'Free license (MIT)' },
  pro: { file: 'LICENSE-PRO.md', title: 'Pro license' },
};

export function generateStaticParams() {
  return Object.keys(licenses).map((type) => ({ type }));
}

export async function generateMetadata({ params }) {
  const { type } = await params;
  return licenses[type] ? { title: licenses[type].title } : {};
}

export default async function LicensePage({ params }) {
  const { type } = await params;
  const license = licenses[type];
  if (!license) notFound();
  return <ContentPage file={license.file} isLicense />;
}
