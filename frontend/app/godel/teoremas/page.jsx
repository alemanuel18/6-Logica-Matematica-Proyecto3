import { LearningPageShell, godelLinks } from '../../../src/components/LearningPageShell.jsx';
import { FormalIncompletenessSection } from '../../../src/features/peano/components/FormalIncompletenessSection.jsx';

export const metadata = { title: 'Teoremas de incompletitud · Gödel' };

export default function Page() {
  return (
    <LearningPageShell
      active="godel"
      eyebrow="REFERENCIA MATEMÁTICA"
      title="Los teoremas, con más detalle."
      description="Consulta la notación, las hipótesis y los esquemas de Gödel y Rosser."
      links={godelLinks}
      currentPath="/godel/teoremas"
    >
      <FormalIncompletenessSection />
    </LearningPageShell>
  );
}
