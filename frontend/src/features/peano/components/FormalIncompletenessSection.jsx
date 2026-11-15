'use client';

import { useState } from 'react';
import { TheoremWorkshop } from './TheoremWorkshop.jsx';

export function FormalIncompletenessSection() {
  const [theory, setTheory] = useState('PA');
  const [hypothesis, setHypothesis] = useState('consistent');
  const [step, setStep] = useState(0);
  const t = theory;
  const g = `G_${t}`;
  const r = `R_${t}`;
  const prov = `Prov_${t}`;
  const proof = `Proof_${t}`;
  const consistent = hypothesis !== 'none';
  const omega = hypothesis === 'omega';
  const steps = [
    {
      title: 'Fijar la teoría y las hipótesis',
      formula: `${t}: aritmética de primer orden, con axiomas enumerables efectivamente`,
      text: 'Tomamos PA, o una extensión efectiva de PA, con lógica clásica e igualdad. Una teoría es sintácticamente completa si, para cada oración A de su lenguaje, demuestra A o demuestra su negación. Es consistente si no demuestra una contradicción. La hipótesis de consistencia se asume desde fuera: esta página no la certifica.',
      detail:
        'El esquema infinito de inducción de PA sigue siendo efectivo: se puede reconocer si una fórmula es una instancia. El comprobador educativo de esta aplicación admite solo una parte de las reglas de PA; no es una formalización completa del sistema usado en el teorema.',
    },
    {
      title: 'Convertir la sintaxis en aritmética',
      formula: 'fórmula A → código ⌜A⌝ ; demostración π → código ⌜π⌝',
      text: 'La numeración de Gödel asigna números a expresiones finitas y permite recuperar sus símbolos. También se codifican secuencias de fórmulas y las justificaciones de sus pasos. Así se puede hablar aritméticamente de objetos que antes eran cadenas de símbolos.',
      detail:
        'La calculadora de arriba codifica fórmulas canónicas individuales. Para codificar una demostración hace falta además fijar un convenio para secuencias y reglas; no basta con concatenar los números ni con usar el código de su última fórmula.',
    },
    {
      title: 'Representar la comprobación de una prueba',
      formula: `${proof}(p,x): «p codifica una demostración de la fórmula con código x»`,
      text: 'Para PA se puede decidir si una secuencia finita es una prueba correcta: cada línea debe ser un axioma o seguir de líneas previas por una regla. Esa comprobación se representa mediante una fórmula aritmética. Para una teoría con axiomas solo enumerables, se incorporan certificados de enumeración al código de prueba.',
      detail:
        'Comprobar una prueba concreta y encontrar una prueba son problemas distintos. Proof es una abreviatura de una fórmula construida con la firma aritmética; no es un nuevo predicado primitivo ni una llamada al servidor de esta aplicación.',
    },
    {
      title: 'Expresar que una fórmula es demostrable',
      formula: `${prov}(x) ≡ ∃p.${proof}(p,x)`,
      text: 'Una fórmula es demostrable en la teoría cuando existe un número que codifica una prueba suya. La cuantificación recorre todos los naturales, no un rango de búsqueda fijado por la interfaz.',
      detail:
        'Que el motor automático se detenga sin encontrar una prueba no demuestra la negación de Prov. Tampoco prueba que una oración sea independiente: un límite computacional no equivale a un resultado de incompletitud.',
    },
    {
      title: 'Construir la autorreferencia por diagonalización',
      formula: `${t} ⊢ ${g} ↔ ¬${prov}(⌜${g}⌝)`,
      text: 'El lema diagonal dice que para una fórmula θ(x) existe una oración G tal que la teoría demuestra G ↔ θ(⌜G⌝). Se aplica a θ(x) = ¬Prov(x). El resultado es una oración que, mediante su código, expresa que ella misma no es demostrable en la teoría.',
      detail:
        'Es un punto fijo demostrable, no una sustitución textual que se repite infinitamente. ⌜G⌝ designa aquí el numeral del código de la oración. Esta vista usa metanotación: no calcula la expansión completa de Proof ni un supuesto entero concreto de G.',
    },
    {
      title: 'Suponer que G se demuestra y llegar a contradicción',
      formula: `${t} ⊢ ${g} ⇒ ${t} ⊢ ${prov}(⌜${g}⌝) y ${t} ⊢ ¬${prov}(⌜${g}⌝)`,
      text: 'Si hubiera una prueba de G, su código permitiría demostrar dentro de la teoría que G es demostrable. Pero la equivalencia del paso anterior permitiría demostrar también que no lo es. Por consistencia, la teoría no puede demostrar G.',
      detail:
        'El argumento se hace en la metateoría y usa la representación correcta de pruebas y las propiedades habituales de demostrabilidad. No se añade G como axioma para luego fingir que se ha derivado de PA.',
    },
    {
      title: 'Por qué la otra dirección necesita cuidado',
      formula: `ω-consistencia de ${t} ⇒ ${t} ⊬ ¬${g}`,
      text: 'Bajo consistencia, no existe una prueba estándar de G; para cada numeral n, la teoría puede verificar que n no codifica esa prueba. Si demostrara ¬G, la equivalencia diagonal le permitiría demostrar que existe una prueba de G. Afirmar esa existencia mientras se rechaza cada testigo numeral contradice la ω-consistencia.',
      detail:
        'La ω-consistencia es más fuerte que la consistencia. En el argumento original no se obtiene la imposibilidad de demostrar ¬G únicamente a partir de consistencia. El selector de hipótesis de abajo mantiene esta distinción.',
    },
    {
      title: 'La mejora de Rosser',
      formula: `consistencia de ${t} ⇒ ${t} ⊬ ${r} y ${t} ⊬ ¬${r}`,
      text: 'Rosser modifica la oración para comparar códigos de pruebas de ella y de su negación. La comparación permite demostrar la independencia suponiendo solo consistencia. Se trata de una nueva oración R, que no debe confundirse con la G del argumento original.',
      detail:
        'Primer teorema, en su versión Gödel–Rosser: toda extensión consistente y efectivamente axiomatizable de PA es sintácticamente incompleta. No afirma que cada fórmula sea indecidible ni que toda la matemática sea imposible de demostrar.',
    },
    {
      title: 'El segundo teorema y los modelos',
      formula: `Con(${t}) ≡ ¬${prov}(⌜0=S(0)⌝) ; ${t} ⊬ Con(${t}) si ${t} es consistente`,
      text: 'Con el predicado habitual de demostrabilidad y sus condiciones de derivabilidad, una extensión efectiva y consistente de PA no demuestra su propia consistencia. Eso no impide estudiar su consistencia desde una teoría más fuerte, cuyas hipótesis también hay que justificar.',
      detail:
        'Una teoría es un conjunto de axiomas; un modelo es una estructura que los satisface. Si R es independiente, ambas teorías PA+R y PA+¬R son consistentes y, por completitud de la lógica de primer orden, tienen modelos. Esa completitud de la lógica no significa que PA decida todas las oraciones.',
    },
  ];

  return (
    <section className="card pa-full incompleteness-section" aria-labelledby="incompleteness-title">
      <span className="eyebrow">05 · DE LA CODIFICACIÓN A LA INCOMPLETITUD</span>
      <h2 id="incompleteness-title">El teorema de incompletitud de Gödel</h2>
      <p className="hint">
        Un recorrido guiado para entender y escribir el argumento. Aquí se trabaja con la teoría
        completa de PA y con metanotación; es una explicación matemática, no un certificado generado
        por el comprobador manual.
      </p>
      <div className="godel-grid">
        <label className="field-label">
          Teoría de referencia
          <select
            className="pa-input"
            value={theory}
            onChange={(event) => {
              setTheory(event.target.value);
            }}
          >
            <option value="PA">PA: aritmética de Peano</option>
            <option value="T">T: una extensión efectiva de PA</option>
          </select>
        </label>
        <label className="field-label">
          Hipótesis para explorar
          <select
            className="pa-input"
            value={hypothesis}
            onChange={(event) => setHypothesis(event.target.value)}
          >
            <option value="none">Sin asumir consistencia</option>
            <option value="consistent">Asumir consistencia</option>
            <option value="omega">Asumir ω-consistencia</option>
          </select>
        </label>
      </div>
      <nav className="pa-toolbar" aria-label="Pasos del argumento de Gödel">
        {steps.map((item, index) => (
          <button
            key={item.title}
            type="button"
            className="secondary compact"
            aria-current={index === step ? 'step' : undefined}
            aria-label={`Paso ${index + 1}: ${item.title}`}
            onClick={() => setStep(index)}
          >
            {index + 1}
          </button>
        ))}
      </nav>
      <article className="reason" aria-live="polite" aria-atomic="true">
        <span className="eyebrow">
          PASO {step + 1} DE {steps.length}
        </span>
        <h3>{steps[step].title}</h3>
        <p className="math-text">{steps[step].formula}</p>
        <p>{steps[step].text}</p>
        <p>{steps[step].detail}</p>
      </article>
      <div className="pa-toolbar">
        <button
          className="secondary compact"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          ← Anterior
        </button>
        <button
          className="secondary compact"
          disabled={step === steps.length - 1}
          onClick={() => setStep(step + 1)}
        >
          Siguiente →
        </button>
      </div>
      <div className="reason" aria-live="polite">
        <h3>Qué permite concluir la hipótesis elegida</h3>
        <ul>
          <li>
            <strong>Oración G: </strong>
            {consistent
              ? `${t} no demuestra ${g}.`
              : 'Sin consistencia asumida no se obtiene aquí una conclusión de no demostrabilidad.'}
          </li>
          <li>
            <strong>Negación de G: </strong>
            {omega
              ? `La ω-consistencia permite concluir que ${t} tampoco demuestra ¬${g}.`
              : 'El argumento original necesita una hipótesis adicional, como ω-consistencia, para excluir una prueba de ¬G.'}
          </li>
          <li>
            <strong>Rosser: </strong>
            {consistent
              ? `La consistencia basta para que ${t} no demuestre ${r} ni ¬${r}.`
              : 'No se ha supuesto la consistencia necesaria para aplicar el teorema de Rosser.'}
          </li>
          <li>
            <strong>Consistencia interna: </strong>
            {consistent
              ? `Con la demostrabilidad habitual, ${t} no demuestra Con(${t}).`
              : 'Sin la hipótesis de consistencia no se aplica esta conclusión del segundo teorema.'}
          </li>
        </ul>
      </div>
      <TheoremWorkshop
        theory={theory}
        hypothesis={hypothesis}
        onAssumeConsistency={() => setHypothesis('consistent')}
      />
      <details className="pa-details">
        <summary>Por qué el codificador añade paréntesis</summary>
        <p>
          Se codifica el árbol sintáctico escrito en forma canónica, con paréntesis y numerales
          expandidos. Por eso 0=0 y (0=0) reciben el mismo número en este convenio. También sería
          posible codificar el texto literal; sería un convenio diferente y los números cambiarían.
          Lo esencial para el argumento es que la codificación y las operaciones sintácticas sean
          efectivas, no usar un número histórico concreto.
        </p>
      </details>
      <p className="syntax-note">
        Lecturas:{' '}
        <a
          href="https://builds.openlogicproject.org/content/incompleteness/incompleteness.pdf"
          target="_blank"
          rel="noreferrer"
        >
          Open Logic Project · Incompleteness
        </a>{' '}
        y{' '}
        <a
          href="https://plato.stanford.edu/entries/goedel-incompleteness/"
          target="_blank"
          rel="noreferrer"
        >
          Stanford Encyclopedia of Philosophy · Gödel’s Incompleteness Theorems
        </a>
        .
      </p>
    </section>
  );
}
