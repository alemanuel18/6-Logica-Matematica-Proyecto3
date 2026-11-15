import { notFound } from 'next/navigation';
import { activities } from '../../../src/features/activities/activities.js';
import { ActivityShell } from '../../../src/features/activities/ActivityShell.jsx';
import { ActivityPlayer } from '../../../src/features/activities/ActivityPlayer.jsx';
export function generateStaticParams() {
  return activities.map((a) => ({ activity: a.slug }));
}
export async function generateMetadata({ params }) {
  const { activity } = await params;
  return { title: `${activities.find((a) => a.slug === activity)?.title || 'Actividad'} · MM3032` };
}
export default async function Page({ params }) {
  const { activity } = await params;
  const selected = activities.find((a) => a.slug === activity);
  if (!selected) notFound();
  return (
    <ActivityShell activity={selected}>
      <ActivityPlayer key={activity} slug={activity} />
    </ActivityShell>
  );
}
