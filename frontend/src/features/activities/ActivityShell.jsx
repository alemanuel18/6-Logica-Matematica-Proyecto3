import Link from 'next/link';
import { WorkspaceNav } from '../../components/WorkspaceNav.jsx';
import { activities } from './activities.js';
import './activities.css';

export function ActivityShell({ activity, children }) {
  return (
    <main className="shell activity-shell">
      <header className="activity-hero">
        <div className="topbar">
          <Link className="brand" href="/actividades">
            <span className="brand-mark">✳</span>
            <span>MM3032 · Lógica Matemática</span>
          </Link>
          <Link className="top-link" href="/guia">
            Guía de uso
          </Link>
        </div>
        <WorkspaceNav active="activities" />
        <div className="activity-heading">
          <div>
            <span className="activity-kicker">
              ACTIVIDADES / {activity ? `EXPEDICIÓN ${activity.number}` : 'APRENDER HACIENDO'}
            </span>
            <h1>{activity ? activity.title : 'La lógica se pone en juego.'}</h1>
            <p>
              {activity
                ? activity.description
                : 'Cinco formas de experimentar con las ideas. Prueba, equivócate y descubre por qué.'}
            </p>
          </div>
          <span className="activity-hero-symbol" aria-hidden="true">
            {activity?.symbol || '∀ ∴'}
          </span>
        </div>
      </header>
      <div className="activity-body">
        {activity && (
          <>
            <Link className="activity-back" href="/actividades">
              ← Todas las actividades
            </Link>
            <nav className="activity-tabs" aria-label="Actividades">
              {activities.map((a) => (
                <Link
                  key={a.slug}
                  href={`/actividades/${a.slug}`}
                  aria-current={a.slug === activity.slug ? 'page' : undefined}
                >
                  {a.number} ·{' '}
                  {a.slug === 'demostraciones'
                    ? 'Paso falso'
                    : a.slug === 'escape'
                      ? 'Escape room'
                      : a.slug === 'turing'
                        ? 'Turing'
                        : a.slug === 'contraejemplos'
                          ? 'Contraejemplos'
                          : 'Cuantificadores'}
                </Link>
              ))}
            </nav>
          </>
        )}
        {children}
      </div>
      <footer>MM3032 · Actividades · Comprender también es experimentar</footer>
    </main>
  );
}

export function ActivityHome() {
  return (
    <ActivityShell>
      <div className="activity-intro">
        <div>
          <span className="activity-kicker">ELIGE TU PRÓXIMO RETO</span>
          <h2>Una idea, una experiencia.</h2>
        </div>
        <p>
          No necesitas seguir un orden. Cada actividad incluye instrucciones, pistas y una
          explicación.
        </p>
      </div>
      <div className="activity-catalog">
        {activities.map((a) => (
          <Link
            className={`activity-tile activity-tile-${a.slug}`}
            href={`/actividades/${a.slug}`}
            key={a.slug}
          >
            <div className="activity-tile-top">
              <span>
                {a.number} / {a.kind}
              </span>
              <span aria-hidden="true">↗</span>
            </div>
            <div className="activity-tile-symbol" aria-hidden="true">
              {a.symbol}
            </div>
            <h2>{a.title}</h2>
            <p className="activity-short">{a.short}</p>
            <p>{a.description}</p>
            <div className="activity-tile-bottom">
              <span>{a.time} · A tu ritmo</span>
              <strong>Explorar →</strong>
            </div>
          </Link>
        ))}
      </div>
      <aside className="activity-note">
        <strong>De observar a comprender.</strong>
        <p>
          El evaluador comprueba fórmulas; aquí tú tomas las decisiones. Los mundos son finitos y
          los ejemplos están acotados para que puedas explorar cada paso.
        </p>
      </aside>
    </ActivityShell>
  );
}
