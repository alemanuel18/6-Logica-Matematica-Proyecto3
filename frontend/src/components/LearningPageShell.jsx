import Link from 'next/link';
import { WorkspaceNav } from './WorkspaceNav.jsx';

export const peanoLinks = [
  { href: '/peano', label: 'Demostraciones' },
  { href: '/peano/axiomas', label: 'Axiomas e inducción' },
];
export const godelLinks = [
  { href: '/godel', label: 'Numeración' },
  { href: '/godel/teoremas', label: 'Teoremas de incompletitud' },
];

export function LearningPageShell({
  active,
  title,
  description,
  eyebrow,
  links = [],
  currentPath,
  wide = false,
  children,
}) {
  return (
    <main className="shell">
      <header className="hero section-hero">
        <div className="topbar">
          <div className="brand">
            <span className="brand-mark">ℕ</span>
            <span>MM3032 · Lógica Matemática</span>
          </div>
          <Link className="top-link" href="/guia">
            Guía de uso
          </Link>
        </div>
        <WorkspaceNav active={active} />
        <div className="hero-content">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </header>
      <div className={`workspace ${wide ? 'topic-workspace' : 'reading-workspace'}`}>
        {links.length > 0 && (
          <nav className="topic-nav pa-full" aria-label="Páginas de esta sección">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={link.href === currentPath ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
        {children}
      </div>
      <footer>Lógica Matemática · Explorar, demostrar y aprender</footer>
    </main>
  );
}
