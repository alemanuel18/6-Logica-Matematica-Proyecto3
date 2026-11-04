import Link from 'next/link';

export const metadata = { title: 'Guía de uso · Evaluador semántico' };

export default function GuidePage() {
  return (
    <main className="shell">
      <header className="hero guide-hero">
        <div className="topbar">
          <div className="brand">
            <span className="brand-mark">∀</span>
            <span>MM3032 · Lógica Matemática</span>
          </div>
          <Link className="top-link" href="/">
            Volver al evaluador
          </Link>
        </div>
        <div className="hero-content">
          <span className="eyebrow">GUÍA DE USO</span>
          <h1>Una fórmula, paso a paso.</h1>
          <p>Configura el universo y sus símbolos antes de evaluar.</p>
        </div>
      </header>
      <div className="guide-grid">
        <section className="card">
          <span className="eyebrow">01</span>
          <h2>Dominio</h2>
          <p>
            Escribe al menos un elemento. Cada valor debe ser único: por ejemplo, <code>a, b</code>.
          </p>
        </section>
        <section className="card">
          <span className="eyebrow">02</span>
          <h2>Interpretación</h2>
          <p>
            Declara funciones y predicados con nombre y aridad. Completa todas las salidas de cada
            función y marca al menos una tupla para cada predicado.
          </p>
        </section>
        <section className="card">
          <span className="eyebrow">03</span>
          <h2>Fórmula</h2>
          <p>
            Usa <code>¬ ∧ ∨ → ↔ ∀ ∃ =</code>. Una constante es una función de aridad cero. Para un
            alcance amplio, escribe <code>∀x.(P(x) → Q(x))</code>.
          </p>
        </section>
        <section className="card">
          <span className="eyebrow">04</span>
          <h2>Entorno y resultado</h2>
          <p>
            Asigna un elemento del dominio a cada variable libre. La explicación muestra testigos,
            contraejemplos o una comprobación completa según el cuantificador.
          </p>
        </section>
      </div>
    </main>
  );
}
