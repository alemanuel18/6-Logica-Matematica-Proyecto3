'use client';

import Link from 'next/link';
import { createContext, useContext, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LearningPageShell, peanoLinks } from '../../../components/LearningPageShell.jsx';
import { useRequest, Feedback } from './PeanoRequest.jsx';

const axioms = [
  ['P1', 'Cero no es sucesor', '∀x.¬(S(x)=0)', 'Ningún sucesor es cero.'],
  [
    'P2',
    'Sucesor inyectivo',
    '∀x.∀y.(S(x)=S(y)→x=y)',
    'Sucesores iguales tienen antecesores iguales.',
  ],
  ['P3', 'Suma con cero', '∀x.(x+0=x)', 'Sumar cero deja el mismo número.'],
  [
    'P4',
    'Suma con sucesor',
    '∀x.∀y.(x+S(y)=S(x+y))',
    'Define la suma cuando el segundo término es un sucesor.',
  ],
  ['P5', 'Producto con cero', '∀x.(x*0=0)', 'Multiplicar por cero da cero.'],
  [
    'P6',
    'Producto con sucesor',
    '∀x.∀y.(x*S(y)=x*y+x)',
    'Define el producto cuando el segundo término es un sucesor.',
  ],
];
const rules = [
  [
    'axiom',
    'Axioma P1–P6',
    0,
    'Copia un axioma tal como aparece; luego particulariza sus variables.',
    'P1, P2, P3, P4, P5 o P6',
  ],
  [
    'induction',
    'Esquema de inducción',
    0,
    'Genera (φ(0) ∧ ∀x.(φ(x) → φ(S(x)))) → ∀x.φ(x), con cierre universal de los parámetros.',
    '(φ(0) ∧ ∀x.(φ(x) → φ(S(x)))) → ∀x.φ(x)',
  ],
  [
    'forallElim',
    'Eliminación de ∀',
    1,
    'De ∀x.φ obtiene φ[x:=t]. El término debe ser libre para x: no se permite capturar variables.',
    '∀x.φ(x)  ⊢  φ(t)',
  ],
  [
    'forallIntro',
    'Introducción de ∀',
    1,
    'De φ obtiene ∀x.φ. Aquí todos los pasos se derivan sin hipótesis abiertas.',
    'φ(a)  ⊢  ∀x.φ(x)   (a arbitrario)',
  ],
  ['mp', 'Modus ponens', 2, 'De A→B (ref. 1) y A (ref. 2), obtiene B.', 'A→B,  A  ⊢  B'],
  ['refl', 'Igualdad: reflexividad', 0, 'Obtiene t=t para el término indicado.', 't=t'],
  ['sym', 'Igualdad: simetría', 1, 'De a=b obtiene b=a.', 'a=b  ⊢  b=a'],
  [
    'trans',
    'Igualdad: transitividad',
    2,
    'De a=b y b=c, en ese orden, obtiene a=c.',
    'a=b,  b=c  ⊢  a=c',
  ],
  ['successor', 'Congruencia del sucesor', 1, 'De a=b obtiene S(a)=S(b).', 'a=b  ⊢  S(a)=S(b)'],
  [
    'congruence',
    'Congruencia de suma o producto',
    2,
    'De a=b y c=d obtiene a+c=b+d o a*c=b*d.',
    'a=b,  c=d  ⊢  a+c=b+d  /  a*c=b*d',
  ],
  [
    'existsIntro',
    'Introducción de ∃',
    1,
    'De φ[x:=t] obtiene ∃x.φ con el testigo t, sin capturar variables.',
    'φ(t)  ⊢  ∃x.φ(x)',
  ],
  ['andIntro', 'Introducción de ∧', 2, 'De A y B obtiene A∧B.', 'A,  B  ⊢  A∧B'],
  ['andLeft', 'Eliminación de ∧ (izquierda)', 1, 'De A∧B obtiene A.', 'A∧B  ⊢  A'],
  ['andRight', 'Eliminación de ∧ (derecha)', 1, 'De A∧B obtiene B.', 'A∧B  ⊢  B'],
];
const blankStep = () => ({
  formula: '',
  rule: 'axiom',
  axiom: 'P3',
  refs: [],
  term: '0',
  variable: 'x',
  body: 'x+0=x',
  operator: '+',
});
const example = () => [
  { ...blankStep(), formula: '∀x.(x+0=x)' },
  { ...blankStep(), rule: 'forallElim', formula: '0+0=0', refs: [1] },
  { ...blankStep(), rule: 'successor', formula: 'S(0+0)=S(0)', refs: [2] },
  { ...blankStep(), axiom: 'P4', formula: '∀x.∀y.(x+S(y)=S(x+y))' },
  { ...blankStep(), rule: 'forallElim', formula: '∀y.(0+S(y)=S(0+y))', refs: [4] },
  { ...blankStep(), rule: 'forallElim', formula: '0+S(0)=S(0+0)', refs: [5] },
  { ...blankStep(), rule: 'trans', formula: '0+1=1', refs: [6, 3] },
];

function usePeanoWorkspace() {
  const [formula, setFormula] = useState('2+2=4');
  const [mode, setMode] = useState('automatic');
  const [maxSteps, setMaxSteps] = useState(100);
  const [body, setBody] = useState('x+0=x');
  const [variable, setVariable] = useState('x');
  const [steps, setSteps] = useState(example);
  const editor = useRef(null);
  const analysis = useRequest(),
    automatic = useRequest(),
    induction = useRequest(),
    proof = useRequest();
  const editFormula = (text) => {
    setFormula(text);
    analysis.clear();
    automatic.clear();
  };
  const updateStep = (index, patch) => {
    setSteps((old) => old.map((s, i) => (i === index ? { ...s, ...patch } : s)));
    proof.clear();
  };
  const insert = (symbol) => {
    const input = editor.current,
      start = input.selectionStart,
      end = input.selectionEnd;
    editFormula(formula.slice(0, start) + symbol + formula.slice(end));
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + symbol.length, start + symbol.length);
    });
  };

  return {
    formula,
    mode,
    setMode,
    maxSteps,
    setMaxSteps,
    body,
    setBody,
    variable,
    setVariable,
    steps,
    setSteps,
    editor,
    analysis,
    automatic,
    induction,
    proof,
    editFormula,
    updateStep,
    insert,
  };
}

const PeanoContext = createContext(null);
export function PeanoWorkspaceProvider({ children }) {
  const state = usePeanoWorkspace();
  return <PeanoContext.Provider value={state}>{children}</PeanoContext.Provider>;
}

export function PeanoPage({ section = 'proof' }) {
  const {
    formula,
    mode,
    setMode,
    maxSteps,
    setMaxSteps,
    body,
    setBody,
    variable,
    setVariable,
    steps,
    setSteps,
    editor,
    analysis,
    automatic,
    induction,
    proof,
    editFormula,
    updateStep,
    insert,
  } = useContext(PeanoContext);
  const router = useRouter();
  const isAxioms = section === 'axioms';
  return (
    <LearningPageShell
      active="peano"
      eyebrow="ARITMÉTICA DE PEANO"
      title={isAxioms ? 'Axiomas e inducción.' : 'Una demostración, paso a paso.'}
      description={
        isAxioms
          ? 'Consulta las reglas de partida y construye instancias del esquema de inducción.'
          : 'Escribe una fórmula y trabaja en modo automático o manual.'
      }
      links={peanoLinks}
      currentPath={isAxioms ? '/peano/axiomas' : '/peano'}
      wide={!isAxioms}
    >
      {isAxioms ? (
        <div className="pa-full">
          {' '}
          <section className="card" aria-labelledby="pa-axioms">
            <span className="eyebrow">02 · FUNDAMENTOS</span>
            <h2 id="pa-axioms">Axiomas de Peano</h2>
            <p className="hint">
              Seis axiomas aritméticos y un esquema infinito de inducción, sobre lógica de primer
              orden con igualdad. No hay un dominio finito que configurar.
            </p>
            <div className="axiom-list">
              {axioms.map(([id, title, text]) => (
                <article key={id}>
                  <div className="section-heading">
                    <strong>
                      {id} · {title}
                    </strong>
                    <button
                      className="secondary compact"
                      onClick={() => {
                        editFormula(text);
                        router.push('/peano');
                      }}
                    >
                      Usar
                    </button>
                  </div>
                  <p className="math-text">{text}</p>
                </article>
              ))}
            </div>
            <h3>Esquema de inducción</h3>
            <p className="hint">
              Una instancia por cada fórmula φ, que puede tener parámetros. El generador reemplaza
              únicamente las apariciones libres de la variable elegida.
            </p>
            <label className="field-label" htmlFor="ind-body">
              Fórmula φ(x)
            </label>
            <input
              id="ind-body"
              className="pa-input"
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                induction.clear();
              }}
              maxLength={2000}
            />
            <label className="field-label" htmlFor="ind-variable">
              Variable de inducción
            </label>
            <input
              id="ind-variable"
              className="pa-input"
              value={variable}
              maxLength={50}
              onChange={(e) => {
                setVariable(e.target.value);
                induction.clear();
              }}
            />
            <button
              className="secondary pa-action"
              disabled={induction.busy}
              onClick={() => induction.run({ action: 'induction', body, variable })}
            >
              Generar instancia
            </button>
            <Feedback request={induction}>
              {induction.data && (
                <div className="reason">
                  <p className="math-text">{induction.data.formula}</p>
                  <button
                    className="secondary compact"
                    onClick={() => {
                      setSteps([
                        ...steps,
                        {
                          ...blankStep(),
                          formula: induction.data.formula,
                          rule: 'induction',
                          body,
                          variable,
                        },
                      ]);
                      proof.clear();
                      setMode('manual');
                      router.push('/peano');
                    }}
                    disabled={steps.length >= 100}
                  >
                    Añadir a la demostración
                  </button>
                </div>
              )}
            </Feedback>
          </section>
        </div>
      ) : (
        <>
          <section className="card pa-full" aria-label="Modo de demostración">
            <span className="eyebrow">DOS FORMAS DE TRABAJAR</span>
            <div className="pa-toolbar pa-modes">
              <button
                type="button"
                className="secondary"
                aria-pressed={mode === 'automatic'}
                onClick={() => setMode('automatic')}
              >
                Demostración automática
              </button>
              <button
                type="button"
                className="secondary"
                aria-pressed={mode === 'manual'}
                onClick={() => setMode('manual')}
              >
                Demostración manual
              </button>
            </div>
            <p className="hint">
              {mode === 'automatic'
                ? 'Ingresa una fórmula y solicita una prueba: verás los axiomas, las reglas y las referencias de cada paso.'
                : 'Construye tu propia demostración, elige las reglas y comprueba tus pasos. Puedes alternar los modos sin perder el trabajo manual.'}
            </p>
            <Link className="course-entry" href="/godel/aprender">
              Aprende Gödel paso a paso · 9 retos guiados →
            </Link>
          </section>

          <div className="left-column">
            <section className="card" aria-labelledby="pa-language">
              <span className="eyebrow">01 · LENGUAJE</span>
              <h2 id="pa-language">Escribir una fórmula</h2>
              <p className="hint">
                El lenguaje tiene 0, sucesor S, suma, producto e igualdad. Los naturales incluyen el
                cero. Los numerales 1–50 abrevian sucesores: 2 = S(S(0)).
              </p>
              <div className="symbol-buttons">
                {['∀', '∃', '¬', '∧', '∨', '→', '↔', 'S(', '+', '*', '=', '(', ')'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => insert(s)}
                    aria-label={`Insertar ${s}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <label className="field-label" htmlFor="pa-formula">
                Fórmula aritmética
              </label>
              <textarea
                id="pa-formula"
                ref={editor}
                className="formula-input"
                value={formula}
                onChange={(e) => editFormula(e.target.value)}
                maxLength={2000}
                spellCheck={false}
              />
              <p className="syntax-note">
                Variables: x, y, z, x1… · Alternativas: -&gt;, &lt;-&gt;, !, &amp;, |, !=.
                Precedencia: S, *, +, =, ¬/cuantificadores, ∧, ∨, →, ↔. Usa ∀x.(…) para ampliar el
                alcance.
              </p>
              <button
                className="secondary pa-action"
                disabled={analysis.busy}
                onClick={() => analysis.run({ action: 'analyze', formula })}
              >
                Validar sintaxis
              </button>
              <Feedback request={analysis}>
                {analysis.data && (
                  <div className="reason">
                    <strong>Fórmula bien formada</strong>
                    <p className="math-text">{analysis.data.canonical}</p>
                    <p>
                      Variables libres:{' '}
                      {analysis.data.freeVariables.join(', ') || 'ninguna; es una oración'}.
                    </p>
                    <p>La validación sintáctica no establece que sea un teorema.</p>
                  </div>
                )}
              </Feedback>
              {mode === 'automatic' && (
                <>
                  <label className="field-label" htmlFor="search-limit">
                    Límite de la búsqueda
                  </label>
                  <select
                    id="search-limit"
                    className="pa-input"
                    value={maxSteps}
                    onChange={(e) => {
                      setMaxSteps(Number(e.target.value));
                      automatic.clear();
                    }}
                  >
                    {[25, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n} pasos
                      </option>
                    ))}
                  </select>
                  <div className="pa-toolbar" aria-label="Ejemplos para demostrar">
                    {['2+2=4', '2*3=6', '∀x.(x+1=S(x))', '∃x.(x+1=3)'].map((text) => (
                      <button
                        key={text}
                        className="secondary compact"
                        onClick={() => editFormula(text)}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                  <button
                    className="evaluate-button"
                    disabled={automatic.busy}
                    onClick={() => automatic.run({ action: 'prove', formula, maxSteps })}
                  >
                    {automatic.busy ? 'Buscando demostración…' : 'Demostrar automáticamente'}{' '}
                    <span>→</span>
                  </button>
                </>
              )}
            </section>
          </div>
          <div className="right-column">
            <section className="card" aria-labelledby="pa-auto" hidden={mode !== 'automatic'}>
              <span className="eyebrow">03 · SOLUCIÓN GUIADA</span>
              <h2 id="pa-auto">Demostración automática</h2>
              <p className="hint">
                El motor intenta construir una prueba usando los axiomas, la reducción de sumas y
                productos, la igualdad, la conjunción y los cuantificadores. Puedes ingresar
                cualquier fórmula válida del lenguaje; no todas se resolverán.
              </p>
              <details className="pa-details">
                <summary>Alcance y límites del motor</summary>
                <p>
                  Reduce términos mediante P3–P6, prueba igualdades con la misma forma reducida,
                  introduce ∀ y ∧, y busca testigos de ∃ entre 0 y 5. También reconoce los seis
                  axiomas tal como están escritos. No realiza búsqueda general por inducción ni
                  decide toda PA.
                </p>
                <p>
                  La búsqueda tiene un límite de pasos y trabajo. «Sin demostración encontrada» no
                  significa que la fórmula sea falsa o indemostrable. La indecidibilidad de PA
                  impide un solucionador que decida todas las fórmulas.
                </p>
                <a
                  href="https://builds.openlogicproject.org/content/incompleteness/theories-computability/consis-with-q.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  Referencia: Open Logic Project · Indecidibilidad
                </a>
              </details>
              {!automatic.data && !automatic.busy && !automatic.error && (
                <p className="empty">
                  Escribe una fórmula en el editor y pulsa «Demostrar automáticamente». La solución
                  aparecerá aquí, paso a paso.
                </p>
              )}
              <Feedback request={automatic}>
                {automatic.data?.status === 'notFound' && (
                  <div className="reason">
                    <h3>Sin demostración encontrada</h3>
                    <p>{automatic.data.message}</p>
                    <p>
                      {automatic.data.reason === 'limit'
                        ? `Se alcanzó el límite de ${automatic.data.maxSteps} pasos o de trabajo del motor. Puedes aumentar el límite si aún es menor de 100.`
                        : 'Las estrategias actuales no resolvieron esta fórmula. Puedes intentar construir su demostración en el modo manual.'}
                    </p>
                    <button className="secondary compact" onClick={() => setMode('manual')}>
                      Ir al modo manual
                    </button>
                  </div>
                )}
                {automatic.data?.status === 'proved' && (
                  <>
                    <p className="reason pa-success">
                      Demostración encontrada y verificada · {automatic.data.steps.length} pasos.
                    </p>
                    <p className="math-text">{automatic.data.formula}</p>
                    <ol
                      className="automatic-steps"
                      aria-label="Pasos de la solución automática"
                      tabIndex={0}
                    >
                      {automatic.data.steps.map((step, index) => {
                        const description = rules.find(([id]) => id === step.rule);
                        return (
                          <li key={index}>
                            <strong>
                              Paso {index + 1} · {description?.[1]}
                            </strong>
                            <p className="math-text">{step.formula}</p>
                            <p className="syntax-note">
                              {description?.[3]}
                              {step.axiom && ` Axioma: ${step.axiom}.`}
                              {step.refs.length > 0 && ` Referencias: ${step.refs.join(', ')}.`}
                              {step.term && ` Término: ${step.term}.`}
                              {step.variable && ` Variable: ${step.variable}.`}
                              {step.operator && ` Operador: ${step.operator}.`}
                            </p>
                          </li>
                        );
                      })}
                    </ol>
                    <button
                      className="secondary pa-action"
                      onClick={() => {
                        setSteps(automatic.data.steps.map((step) => ({ ...blankStep(), ...step })));
                        proof.clear();
                        setMode('manual');
                      }}
                    >
                      Abrir esta prueba en modo manual
                    </button>
                  </>
                )}
              </Feedback>
            </section>
            <section className="card" aria-labelledby="pa-proof" hidden={mode !== 'manual'}>
              <span className="eyebrow">03 · DEDUCCIÓN</span>
              <h2 id="pa-proof">Demostración manual</h2>
              <p className="hint">
                Escribe primero la fórmula que quieres demostrar. Después construye una deducción
                cuyo último paso sea exactamente ese objetivo. El comprobador admite las reglas
                listadas abajo, sin hipótesis abiertas.
              </p>
              <div className="manual-proof-goal">
                <span className="eyebrow">FÓRMULA A DEMOSTRAR</span>
                <label className="field-label" htmlFor="manual-proof-formula">
                  Objetivo de la demostración
                </label>
                <textarea
                  id="manual-proof-formula"
                  className="formula-input"
                  value={formula}
                  onChange={(event) => editFormula(event.target.value)}
                  maxLength={2000}
                  rows={2}
                  spellCheck={false}
                />
                <p className="syntax-note">
                  El último paso debe producir esta fórmula. El objetivo no cuenta como un paso de
                  la prueba.
                </p>
              </div>
              <details className="pa-details">
                <summary>Consultar reglas y condiciones</summary>
                {rules.map(([id, label, , description]) => (
                  <p key={id}>
                    <strong>{label}.</strong> {description}
                  </p>
                ))}
              </details>
              <div className="pa-toolbar">
                <button
                  className="secondary compact"
                  onClick={() => {
                    setSteps(example());
                    proof.clear();
                  }}
                >
                  Cargar ejemplo 0 + 1 = 1
                </button>
                <button
                  className="secondary compact"
                  onClick={() => {
                    setSteps([blankStep()]);
                    proof.clear();
                  }}
                >
                  Nueva demostración
                </button>
              </div>
              <div className="manual-proof-heading">
                <span className="eyebrow">PASOS DE LA DEDUCCIÓN</span>
                <p>Justifica cada línea hasta alcanzar el objetivo.</p>
              </div>
              <ol className="proof-list">
                {steps.map((step, index) => {
                  const rule = rules.find(([id]) => id === step.rule);
                  const status = proof.data?.steps[index];
                  return (
                    <li
                      key={index}
                      className={`proof-step ${status ? (status.valid ? 'step-valid' : 'step-invalid') : ''}`}
                    >
                      <details open={status ? !status.valid : index === steps.length - 1}>
                        <summary className="proof-summary">
                          Paso {index + 1} · {step.formula || 'Escribe una fórmula'}
                          {status ? (status.valid ? ' · ✓' : ' · Revisar') : ''}
                        </summary>
                        <label className="field-label" htmlFor={`step-${index}`}>
                          Paso {index + 1} · Fórmula
                        </label>
                        <textarea
                          id={`step-${index}`}
                          value={step.formula}
                          maxLength={2000}
                          rows={2}
                          spellCheck={false}
                          onChange={(e) => updateStep(index, { formula: e.target.value })}
                        />
                        <label className="field-label" htmlFor={`rule-${index}`}>
                          Justificación
                        </label>
                        <select
                          id={`rule-${index}`}
                          className="pa-input"
                          value={step.rule}
                          onChange={(e) => updateStep(index, { rule: e.target.value })}
                        >
                          {rules.map(([id, label]) => (
                            <option key={id} value={id}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <div className="rule-visual-guide" aria-live="polite">
                          <span className="eyebrow">FORMA DE LA REGLA</span>
                          <p className="math-text">
                            {step.rule === 'axiom'
                              ? axioms.find(([id]) => id === step.axiom)?.[2]
                              : rule[4]}
                          </p>
                          <p>{rule[3]}</p>
                          {step.rule === 'axiom' && (
                            <p className="rule-meaning">
                              {axioms.find(([id]) => id === step.axiom)?.[3]}
                            </p>
                          )}
                        </div>
                        {step.rule === 'axiom' && (
                          <>
                            <label className="field-label" htmlFor={`axiom-${index}`}>
                              Axioma
                            </label>
                            <select
                              id={`axiom-${index}`}
                              className="pa-input"
                              value={step.axiom}
                              onChange={(e) => updateStep(index, { axiom: e.target.value })}
                            >
                              {axioms.map(([id, label]) => (
                                <option key={id} value={id}>
                                  {id} · {label}
                                </option>
                              ))}
                            </select>
                          </>
                        )}
                        <div className="pa-fields">
                          {Array.from({ length: rule[2] }, (_, slot) => (
                            <label key={slot} className="field-label">
                              Referencia {slot + 1}
                              <select
                                className="pa-input"
                                value={step.refs[slot] ?? ''}
                                onChange={(e) => {
                                  const refs = [...step.refs];
                                  refs[slot] = e.target.value ? Number(e.target.value) : undefined;
                                  updateStep(index, { refs });
                                }}
                                disabled={index === 0}
                              >
                                <option value="">
                                  {index === 0 ? 'Aún no hay pasos anteriores' : 'Elige un paso…'}
                                </option>
                                {steps.slice(0, index).map((previous, previousIndex) => (
                                  <option key={previousIndex} value={previousIndex + 1}>
                                    Paso {previousIndex + 1} · {previous.formula || 'Sin fórmula'}
                                  </option>
                                ))}
                              </select>
                            </label>
                          ))}
                        </div>
                        {rule[2] > 0 && (
                          <div className="rule-premises" aria-label="Premisas seleccionadas">
                            {Array.from({ length: rule[2] }, (_, slot) => {
                              const reference = step.refs[slot];
                              const premise = reference ? steps[reference - 1]?.formula : '';
                              return (
                                <p key={slot}>
                                  <strong>Premisa {slot + 1}</strong>
                                  <span className={premise ? 'math-text' : 'syntax-note'}>
                                    {premise || 'Selecciona un paso anterior.'}
                                  </span>
                                </p>
                              );
                            })}
                          </div>
                        )}
                        {step.rule === 'congruence' && (
                          <label className="field-label">
                            Operador
                            <select
                              className="pa-input"
                              value={step.operator ?? '+'}
                              onChange={(e) => updateStep(index, { operator: e.target.value })}
                            >
                              <option value="+">Suma (+)</option>
                              <option value="*">Producto (*)</option>
                            </select>
                          </label>
                        )}
                        {['forallElim', 'refl', 'existsIntro'].includes(step.rule) && (
                          <label className="field-label">
                            Término t
                            <input
                              className="pa-input"
                              value={step.term}
                              maxLength={2000}
                              onChange={(e) => updateStep(index, { term: e.target.value })}
                            />
                          </label>
                        )}
                        {['forallIntro', 'induction'].includes(step.rule) && (
                          <label className="field-label">
                            Variable
                            <input
                              className="pa-input"
                              value={step.variable}
                              maxLength={50}
                              onChange={(e) => updateStep(index, { variable: e.target.value })}
                            />
                          </label>
                        )}
                        {step.rule === 'induction' && (
                          <label className="field-label">
                            Fórmula φ
                            <input
                              className="pa-input"
                              value={step.body}
                              maxLength={2000}
                              onChange={(e) => updateStep(index, { body: e.target.value })}
                            />
                          </label>
                        )}
                        {status && (
                          <p className={status.valid ? 'pa-success' : 'inline-error'}>
                            {status.valid ? '✓ Paso justificado' : status.error}
                          </p>
                        )}
                      </details>
                    </li>
                  );
                })}
              </ol>
              <div className="pa-toolbar">
                <button
                  className="secondary compact"
                  disabled={steps.length >= 100}
                  onClick={() => {
                    setSteps([...steps, blankStep()]);
                    proof.clear();
                  }}
                >
                  + Añadir paso
                </button>
                <button
                  className="secondary compact"
                  disabled={steps.length <= 1}
                  onClick={() => {
                    setSteps(steps.slice(0, -1));
                    proof.clear();
                  }}
                >
                  Quitar último
                </button>
              </div>
              <button
                className="evaluate-button"
                disabled={proof.busy}
                onClick={() => proof.run({ action: 'proof', formula, steps })}
              >
                Comprobar demostración <span>→</span>
              </button>
              <Feedback request={proof}>
                {proof.data && (
                  <p className={proof.data.valid ? 'reason pa-success' : 'inline-error'}>
                    {proof.data.valid
                      ? 'Todos los pasos están justificados. La última fórmula se deriva de los axiomas de PA con las reglas admitidas.'
                      : proof.data.goal &&
                          !proof.data.goal.valid &&
                          proof.data.steps.every((step) => step.valid)
                        ? `Los pasos están justificados, pero la última fórmula es ${proof.data.goal.derived ?? 'inválida'} y no coincide con el objetivo ${proof.data.goal.formula}.`
                        : 'La demostración tiene pasos sin justificar. Revisa los mensajes en cada paso.'}
                  </p>
                )}
              </Feedback>
            </section>
          </div>
        </>
      )}
    </LearningPageShell>
  );
}
