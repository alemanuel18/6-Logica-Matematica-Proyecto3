import Link from 'next/link';

export function WorkspaceNav({ active }) {
  return (
    <nav className="workspace-nav" aria-label="Áreas de trabajo">
      <Link href="/" aria-current={active === 'semantic' ? 'page' : undefined}>
        Evaluador semántico
      </Link>
      <Link href="/peano" aria-current={active === 'peano' ? 'page' : undefined}>
        Aritmética de Peano y Gödel
      </Link>
    </nav>
  );
}
