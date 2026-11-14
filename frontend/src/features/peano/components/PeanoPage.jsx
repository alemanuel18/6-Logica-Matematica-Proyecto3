'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { WorkspaceNav } from '../../../components/WorkspaceNav.jsx';
import { post } from '../../../repositories/httpClient.js';

const axioms = [
  ['P1', 'Cero no es sucesor', '∀x.¬(S(x)=0)'],
  ['P2', 'Sucesor inyectivo', '∀x.∀y.(S(x)=S(y)→x=y)'],
  ['P3', 'Suma con cero', '∀x.(x+0=x)'],
  ['P4', 'Suma con sucesor', '∀x.∀y.(x+S(y)=S(x+y))'],
  ['P5', 'Producto con cero', '∀x.(x*0=0)'],
  ['P6', 'Producto con sucesor', '∀x.∀y.(x*S(y)=x*y+x)'],
];
const rules = [
  [
    'axiom',
    'Axioma P1–P6',
    0,
    'Copia un axioma tal como aparece; luego particulariza sus variables.',
  ],
  [
    'induction',
    'Esquema de inducción',
    0,
    'Genera (φ(0) ∧ ∀x.(φ(x) → φ(S(x)))) → ∀x.φ(x), con cierre universal de los parámetros.',
  ],
  [
    'forallElim',
    'Eliminación de ∀',
    1,
    'De ∀x.φ obtiene φ[x:=t]. El término debe ser libre para x: no se permite capturar variables.',
  ],
  [
    'forallIntro',
    'Introducción de ∀',
    1,
    'De φ obtiene ∀x.φ. Aquí todos los pasos se derivan sin hipótesis abiertas.',
  ],
  ['mp', 'Modus ponens', 2, 'De A→B (ref. 1) y A (ref. 2), obtiene B.'],
  ['refl', 'Igualdad: reflexividad', 0, 'Obtiene t=t para el término indicado.'],
  ['sym', 'Igualdad: simetría', 1, 'De a=b obtiene b=a.'],
  ['trans', 'Igualdad: transitividad', 2, 'De a=b y b=c, en ese orden, obtiene a=c.'],
  ['successor', 'Congruencia del sucesor', 1, 'De a=b obtiene S(a)=S(b).'],
  ['congruence', 'Congruencia de suma o producto', 2, 'De a=b y c=d obtiene a+c=b+d o a*c=b*d.'],
  [
    'existsIntro',
    'Introducción de ∃',
    1,
    'De φ[x:=t] obtiene ∃x.φ con el testigo t, sin capturar variables.',
  ],
  ['andIntro', 'Introducción de ∧', 2, 'De A y B obtiene A∧B.'],
  ['andLeft', 'Eliminación de ∧ (izquierda)', 1, 'De A∧B obtiene A.'],
  ['andRight', 'Eliminación de ∧ (derecha)', 1, 'De A∧B obtiene B.'],
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

function useRequest() {
  const [state, setState] = useState({ data: null, error: '', busy: false });
  const version = useRef(0);
  const clear = () => {
    version.current++;
    setState({ data: null, error: '', busy: false });
  };
  const run = async (body) => {
    const id = ++version.current;
    setState({ data: null, error: '', busy: true });
    try {
      const data = await post('peano', body);
      if (id === version.current) setState({ data, error: '', busy: false });
    } catch (error) {
      if (id === version.current)
        setState({
          data: null,
          error: error.error || error.message || 'No se pudo conectar con la API.',
          busy: false,
        });
    }
  };
  return { ...state, run, clear };
}

function Feedback({ request, children }) {
  return (
    <div aria-live="polite" aria-busy={request.busy}>
      {request.busy && <p className="hint">Comprobando…</p>}
      {request.error && (
        <p className="inline-error" role="alert">
          {request.error}
        </p>
      )}
      {request.data && children}
    </div>
  );
}

export function PeanoPage() {
  const [formula, setFormula] = useState('2+2=4');
  const [mode, setMode] = useState('automatic');
  const [maxSteps, setMaxSteps] = useState(100);
  const [body, setBody] = useState('x+0=x');
  const [variable, setVariable] = useState('x');
  const [steps, setSteps] = useState(example);
  const [godelFormula, setGodelFormula] = useState('0=0');
  const [number, setNumber] = useState('');
  const editor = useRef(null);
  const analysis = useRequest(),
    automatic = useRequest(),
    induction = useRequest(),
    proof = useRequest(),
    encoding = useRequest(),
    decoding = useRequest();
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

  return (
    <main className="shell">
      <header className="hero">
        <div className="topbar">
          <div className="brand">
            <span className="brand-mark">ℕ</span>
            <span>MM3032 · Lógica Matemática</span>
          </div>
          <Link className="top-link" href="/guia">
            Guía de uso
          </Link>
        </div>
        <WorkspaceNav active="peano" />
        <div className="hero-content">
          <span className="eyebrow">ARITMÉTICA FORMAL · PA DE PRIMER ORDEN</span>
          <h1>De los axiomas a una demostración.</h1>
          <p>
            Escribe fórmulas, justifica cada paso y explora cómo una expresión se convierte en un
            número.
          </p>
        </div>
      </header>
      <div className="workspace peano-workspace">
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
                        editor.current?.focus();
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
        <div className="right-column">
          <section className="card" aria-labelledby="pa-auto" hidden={mode !== 'automatic'}>
            <span className="eyebrow">03 · SOLUCIÓN GUIADA</span>
            <h2 id="pa-auto">Demostración automática</h2>
            <p className="hint">
              El motor intenta construir una prueba usando los axiomas, la reducción de sumas y
              productos, la igualdad, la conjunción y los cuantificadores. Puedes ingresar cualquier
              fórmula válida del lenguaje; no todas se resolverán.
            </p>
            <details className="pa-details">
              <summary>Alcance y límites del motor</summary>
              <p>
                Reduce términos mediante P3–P6, prueba igualdades con la misma forma reducida,
                introduce ∀ y ∧, y busca testigos de ∃ entre 0 y 5. También reconoce los seis
                axiomas tal como están escritos. No realiza búsqueda general por inducción ni decide
                toda PA.
              </p>
              <p>
                La búsqueda tiene un límite de pasos y trabajo. «Sin demostración encontrada» no
                significa que la fórmula sea falsa o indemostrable. La indecidibilidad de PA impide
                un solucionador que decida todas las fórmulas.
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
              El ejemplo demuestra 0 + 1 = 1. El comprobador admite las reglas listadas abajo, sin
              hipótesis abiertas. Es un conjunto inicial de reglas; todavía no es un asistente
              completo para toda PA. En este modo tú eliges cada paso y su justificación.
            </p>
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
            <ol className="proof-list">
              {steps.map((step, index) => {
                const rule = rules.find(([id]) => id === step.rule);
                const status = proof.data?.steps[index];
                return (
                  <li
                    key={index}
                    className={`proof-step ${status ? (status.valid ? 'step-valid' : 'step-invalid') : ''}`}
                  >
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
                          <input
                            type="number"
                            min={1}
                            max={index || 1}
                            className="pa-input"
                            value={step.refs[slot] ?? ''}
                            onChange={(e) => {
                              const refs = [...step.refs];
                              refs[slot] = Number(e.target.value);
                              updateStep(index, { refs });
                            }}
                          />
                        </label>
                      ))}
                    </div>
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
              onClick={() => proof.run({ action: 'proof', steps })}
            >
              Comprobar demostración <span>→</span>
            </button>
            <Feedback request={proof}>
              {proof.data && (
                <p className={proof.data.valid ? 'reason pa-success' : 'inline-error'}>
                  {proof.data.valid
                    ? 'Todos los pasos están justificados. La última fórmula se deriva de los axiomas de PA con las reglas admitidas.'
                    : 'La demostración tiene pasos sin justificar. Revisa los mensajes en cada paso.'}
                </p>
              )}
            </Feedback>
          </section>
        </div>
        <section className="card pa-full" aria-labelledby="pa-godel">
          <span className="eyebrow">04 · ARITMETIZACIÓN DE LA SINTAXIS</span>
          <h2 id="pa-godel">Números de Gödel</h2>
          <p className="hint">
            Cada símbolo recibe un código positivo. La secuencia a₁, …, aₙ se representa por 2ᵃ¹ ·
            3ᵃ² · 5ᵃ³ · … · pₙᵃⁿ. La factorización única permite recuperar la fórmula. Este es un
            convenio didáctico propio, no la tabla histórica de Gödel.
          </p>
          <details className="pa-details">
            <summary>Ver el convenio de codificación</summary>
            <p>0→1, S→2, +→3, *→4, =→5, ¬→6, ∧→7, ∨→8, →→9, ↔→10, ∀→11, ∃→12, (→13, )→14, .→15.</p>
            <p>
              Para variables: código = 16 + valor en base 38 de sus caracteres. El alfabeto a…z,
              0…9, _ tiene dígitos 1…37. Por ejemplo x→40, y→41. El código 16 se reserva. Se
              codifica la escritura canónica con paréntesis y numerales expandidos.
            </p>
          </details>
          <div className="godel-grid">
            <div>
              <label className="field-label" htmlFor="godel-formula">
                Fórmula que se codificará
              </label>
              <textarea
                id="godel-formula"
                value={godelFormula}
                maxLength={2000}
                onChange={(e) => {
                  setGodelFormula(e.target.value);
                  encoding.clear();
                }}
              />
              <button
                className="secondary pa-action"
                disabled={encoding.busy}
                onClick={() => encoding.run({ action: 'encode', formula: godelFormula })}
              >
                Calcular número de Gödel
              </button>
              <Feedback request={encoding}>
                {encoding.data && (
                  <div className="reason">
                    <p>
                      Forma canónica: <span className="math-text">{encoding.data.canonical}</span>
                    </p>
                    <div className="godel-factors" aria-label="Factores de la codificación">
                      {encoding.data.factors.map((f, i) => (
                        <span key={i} title={`Símbolo ${f.token}; código ${f.exponent}`}>
                          {f.prime}
                          <sup>{f.exponent}</sup>
                          <small>{f.token}</small>
                        </span>
                      ))}
                    </div>
                    {encoding.data.number ? (
                      <>
                        <label className="field-label" htmlFor="godel-output">
                          Entero exacto ({encoding.data.number.length} cifras)
                        </label>
                        <textarea
                          id="godel-output"
                          readOnly
                          value={encoding.data.number}
                          rows={4}
                        />
                        <button
                          className="secondary compact pa-action"
                          onClick={() => {
                            setNumber(encoding.data.number);
                            decoding.clear();
                          }}
                        >
                          Usar en decodificador
                        </button>
                      </>
                    ) : (
                      <p>
                        El entero excede el límite de expansión de 12 000 bits. La factorización de
                        arriba lo representa exactamente.
                      </p>
                    )}
                  </div>
                )}
              </Feedback>
            </div>
            <div>
              <label className="field-label" htmlFor="godel-number">
                Número que se decodificará
              </label>
              <textarea
                id="godel-number"
                value={number}
                maxLength={4000}
                onChange={(e) => {
                  setNumber(e.target.value);
                  decoding.clear();
                }}
                placeholder="Pega aquí el entero generado"
              />
              <button
                className="secondary pa-action"
                disabled={decoding.busy}
                onClick={() => decoding.run({ action: 'decode', number: number.trim() })}
              >
                Recuperar fórmula
              </button>
              <p className="syntax-note">
                Hasta 4000 cifras y 350 símbolos. Solo acepta fórmulas canónicas del convenio
                mostrado.
              </p>
              <Feedback request={decoding}>
                {decoding.data && <p className="reason math-text">{decoding.data.formula}</p>}
              </Feedback>
            </div>
          </div>
        </section>
        <section className="card pa-full">
          <span className="eyebrow">MÁS ADELANTE</span>
          <h2>Hacia la incompletitud</h2>
          <p className="hint">
            Esta sección prepara el lenguaje, las derivaciones y la codificación. Una ampliación
            futura podrá explicar la representación de demostraciones, la autorreferencia y el
            primer teorema de incompletitud. Asignar números a fórmulas, por sí solo, no demuestra
            ese teorema.
          </p>
          <p className="syntax-note">
            Referencia:{' '}
            <a
              href="https://ic.openlogicproject.org/ic-screen.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Open Logic Project · Incompleteness and Computability
            </a>
            .
          </p>
        </section>
      </div>
      <footer>Aritmética de Peano · Deducción formal y numeración de Gödel</footer>
    </main>
  );
}
