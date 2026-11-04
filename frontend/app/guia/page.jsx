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
            función. En los predicados, marca las combinaciones verdaderas; si no marcas ninguna,
            todas son falsas.
          </p>
          <p>
            Las tablas muestran hasta 20 combinaciones por página. Filtra por argumento o por estado
            para revisar las verdaderas, las falsas o las salidas pendientes. Los botones «Todas
            verdaderas» y «Todas falsas» afectan todas las combinaciones del predicado, incluso las
            que no aparecen por los filtros o la paginación.
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
        <section className="card">
          <span className="eyebrow">05</span>
          <h2>Guía de voz</h2>
          <p>
            Pulsa «Escuchar introducción» para oír una explicación breve del evaluador. Después de
            evaluar una fórmula, puedes pedirle que lea el resultado y su explicación. Elige una voz
            en español instalada en tu navegador o sistema y pulsa «Detener voz» cuando quieras
            interrumpirla. La voz disponible depende del dispositivo.
          </p>
        </section>
      </div>
    </main>
  );
}
