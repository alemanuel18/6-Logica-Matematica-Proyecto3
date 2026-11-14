import { LearningPageShell } from '../../../src/components/LearningPageShell.jsx';
import { IncompletenessSection } from '../../../src/features/peano/components/IncompletenessSection.jsx';

export const metadata = { title: 'Aprender Gödel paso a paso · MM3032' };

export default function Page() {
  return (
    <LearningPageShell
      active="learn"
      eyebrow="LECCIÓN INTERACTIVA"
      title="Descubre la incompletitud, paso a paso."
      description="Nueve retos cortos, pistas y explicaciones a tu ritmo."
      wide
    >
      <IncompletenessSection />
    </LearningPageShell>
  );
}
