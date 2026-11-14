import Link from 'next/link';

export function WorkspaceNav({ active }) {
  return (
    <nav className="workspace-nav" aria-label="Áreas de trabajo">
      <Link href="/" aria-current={active === 'semantic' ? 'page' : undefined}>
        Evaluador semántico
      </Link>
      <Link href="/peano" aria-current={active === 'peano' ? 'page' : undefined}>
        Peano
      </Link>
      <Link href="/godel" aria-current={active === 'godel' ? 'page' : undefined}>
        Números de Gödel
      </Link>
      <Link href="/godel/aprender" aria-current={active === 'learn' ? 'page' : undefined}>
        Aprender paso a paso
      </Link>
    </nav>
  );
}
