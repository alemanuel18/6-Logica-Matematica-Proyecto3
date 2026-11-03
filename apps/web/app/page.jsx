'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const buttons = ['¬', '∧', '∨', '→', '↔', '∀', '∃', '(', ')', '='];
const initialFunctions = [{ id: 'c', name: 'c', arity: 0, table: { '[]': 'a' } }];
const initialPredicates = [{ id: 'P', name: 'P', arity: 1, tuples: { '["a"]': true } }];
const nextId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

function SymbolEditor({ title, kind, items, setItems, domain, tupleOptions }) {
  const update = (id, changes) => setItems(previous => previous.map(item => item.id === id ? { ...item, ...changes } : item));
  return <section className="card">
    <div className="section-heading"><div><span className="eyebrow">02 · Lenguaje e interpretación</span><h2>{title}</h2></div>
      <button className="secondary compact" type="button" onClick={() => setItems(previous => [...previous, { id: nextId(), name: '', arity: 1, table: {}, tuples: {} }])}>+ Agregar</button></div>
    <p className="hint">{kind === 'function' ? 'Define una salida para cada combinación de argumentos.' : 'Marca las tuplas que pertenecen a la relación.'}</p>
    {items.length === 0 && <p className="empty">Todavía no hay {title.toLowerCase()}.</p>}
    {items.map(item => {
      const tuples = tupleOptions[item.arity] ?? [];
      return <div className="symbol" key={item.id}>
        <div className="symbol-top"><label>Nombre<input aria-label={`Nombre de ${kind}`} value={item.name} onChange={event => update(item.id, { name: event.target.value })} placeholder={kind === 'function' ? 'f' : 'P'} /></label>
          <label>Aridad<input aria-label={`Aridad de ${item.name || kind}`} type="number" min="0" step="1" value={item.arity} onChange={event => update(item.id, { arity: event.target.value === '' ? '' : Number(event.target.value) })} /></label>
          <button className="icon-button remove" type="button" aria-label={`Eliminar ${item.name || kind}`} onClick={() => setItems(previous => previous.filter(x => x.id !== item.id))}>×</button></div>
        {item.name && item.arity !== '' && Number.isInteger(Number(item.arity)) && Number(item.arity) >= 0 && <div className="tuple-grid">
          {tuples.map(tuple => {
            const tupleKey = JSON.stringify(tuple);
            return <div className="tuple-row" key={tupleKey}>
              <span className="tuple-name">{item.name}({tuple.join(', ')})</span>
              {kind === 'function' ? <select aria-label={`Valor de ${item.name}(${tuple.join(', ')})`} value={item.table?.[tupleKey] ?? ''} onChange={event => update(item.id, { table: { ...item.table, [tupleKey]: event.target.value } })}>
                <option value="">Seleccionar…</option>{domain.map(value => <option key={value} value={value}>{value}</option>)}
              </select> : <label className="check-label"><input type="checkbox" checked={Boolean(item.tuples?.[tupleKey])} onChange={event => update(item.id, { tuples: { ...item.tuples, [tupleKey]: event.target.checked } })} /> Pertenece</label>}
            </div>;
          })}</div>}
      </div>;
    })}
  </section>;
}

function Explanation({ node, depth = 0 }) {
  if (!node) return null;
  return <div className={`reason depth-${Math.min(depth, 2)}`}>
    <div className="reason-line"><span className={`mini-status ${node.value ? 'true' : 'false'}`}>{node.value ? 'V' : 'F'}</span><span>{node.reason}</span></div>
    {node.evidence === 'complete' && <p className="evidence-label">Se comprobaron todos los elementos del dominio.</p>}
  </div>;
}

export default function Home() {
  const [domainText, setDomainText] = useState('a, b');
  const [functions, setFunctions] = useState(initialFunctions);
  const [predicates, setPredicates] = useState(initialPredicates);
  const [formula, setFormula] = useState('∃x.P(x)');
  const [environment, setEnvironment] = useState({});
  const [freeVariables, setFreeVariables] = useState([]);
  const [analysisError, setAnalysisError] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tupleOptions, setTupleOptions] = useState({});
  const textarea = useRef(null);
  const domain = useMemo(() => domainText.split(/[,\n]/).map(value => value.trim()).filter(Boolean), [domainText]);
  const tupleRequest = JSON.stringify({ domain, arities: [...new Set([...functions, ...predicates].map(item => item.arity === '' ? null : Number(item.arity)))].sort((a, b) => a - b) });
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${API}/api/tuples`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: tupleRequest });
        const data = await response.json();
        if (active) setTupleOptions(response.ok ? data.tuples : {});
      } catch { if (active) setTupleOptions({}); }
    }, 200);
    return () => { active = false; clearTimeout(timer); };
  }, [tupleRequest]);
  const payload = useMemo(() => ({
    domain,
    functions: functions.map(item => ({ name: item.name, arity: item.arity === '' ? null : Number(item.arity), table: (tupleOptions[item.arity] ?? []).map(args => ({ args, value: item.table?.[JSON.stringify(args)] ?? '' })) })),
    predicates: predicates.map(item => ({ name: item.name, arity: item.arity === '' ? null : Number(item.arity), tuples: (tupleOptions[item.arity] ?? []).filter(args => item.tuples?.[JSON.stringify(args)]) })),
    formula,
    environment
  }), [domain, functions, predicates, formula, environment, tupleOptions]);

  useEffect(() => { setResult(null); setError(null); }, [payload]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${API}/api/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await response.json();
        if (active) { setFreeVariables(response.ok ? data.freeVariables : []); setAnalysisError(response.ok ? '' : data.error); }
      } catch { if (active) { setFreeVariables([]); setAnalysisError('No se pudo conectar con el servidor.'); } }
    }, 350);
    return () => { active = false; clearTimeout(timer); };
  }, [payload]);

  const insert = symbol => {
    const input = textarea.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    setFormula(current => `${current.slice(0, start)}${symbol}${current.slice(end)}`);
    requestAnimationFrame(() => { input.focus(); input.setSelectionRange(start + symbol.length, start + symbol.length); });
  };
  const submit = async event => {
    event.preventDefault(); setLoading(true); setError(null); setResult(null);
    try {
      const response = await fetch(`${API}/api/evaluate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) setError(data);
      else { setResult(data); setFreeVariables(data.freeVariables); }
    } catch { setError({ error: 'No se pudo conectar con el servidor. Comprueba que la API esté iniciada.' }); }
    finally { setLoading(false); }
  };

  return <main className="shell">
    <header className="hero"><div className="brand"><span className="brand-mark">∀</span><span>MM3032 · Lógica Matemática</span></div>
      <div className="hero-content"><span className="eyebrow">EVALUADOR SEMÁNTICO</span><h1>Explora el valor de una fórmula.</h1><p>Construye una interpretación finita, escribe una fórmula y descubre por qué es verdadera o falsa.</p></div></header>
    <form onSubmit={submit} className="workspace">
      <div className="left-column">
        <section className="card"><span className="eyebrow">01 · Universo</span><h2>Dominio</h2><p className="hint">Escribe elementos distintos, separados por comas o saltos de línea.</p>
          <label className="field-label" htmlFor="domain">Elementos de D</label><textarea id="domain" className="domain-input" value={domainText} onChange={event => setDomainText(event.target.value)} placeholder="a, b, c" />
          <div className="chips">{domain.map((value, index) => <span className="chip" key={`${value}-${index}`}>{value}</span>)}</div></section>
        <SymbolEditor title="Funciones" kind="function" items={functions} setItems={setFunctions} domain={domain} tupleOptions={tupleOptions} />
        <SymbolEditor title="Predicados" kind="predicate" items={predicates} setItems={setPredicates} domain={domain} tupleOptions={tupleOptions} />
      </div>
      <div className="right-column"><section className="card formula-card"><span className="eyebrow">03 · Expresión</span><h2>Fórmula</h2><p className="hint">Usa los botones o escribe con el teclado. Agrupa con paréntesis el alcance de cada cuantificador.</p>
        <div className="symbol-buttons" aria-label="Símbolos lógicos">{buttons.map(symbol => <button key={symbol} type="button" onClick={() => insert(symbol)} aria-label={`Insertar ${symbol}`}>{symbol}</button>)}</div>
        <label className="field-label" htmlFor="formula">Expresión lógica</label><textarea ref={textarea} id="formula" className="formula-input" spellCheck="false" value={formula} onChange={event => setFormula(event.target.value)} placeholder="∀x.(P(x) → Q(x))" />
        <p className="syntax-note">También puedes escribir !, &amp;, |, -&gt; y &lt;-&gt;.</p>
      </section>
      <section className="card"><span className="eyebrow">04 · Variables libres</span><h2>Entorno</h2>
        {analysisError ? <p className="inline-error">{analysisError}</p> : freeVariables.length === 0 ? <p className="empty">No hay variables libres en la fórmula.</p> : <div className="environment-grid">{freeVariables.map(variable => <label key={variable}>{variable}<select value={environment[variable] ?? ''} onChange={event => setEnvironment(previous => ({ ...previous, [variable]: event.target.value }))}><option value="">Seleccionar…</option>{domain.map(value => <option key={value} value={value}>{value}</option>)}</select></label>)}</div>}
      </section>
      <button className="evaluate-button" disabled={loading} type="submit">{loading ? 'Evaluando…' : 'Evaluar fórmula'} <span>→</span></button>
      {error && <section className="result-card error-result" role="alert"><span className="eyebrow">Revisa la entrada</span><h2>No se puede evaluar</h2><p>{error.error}</p>{error.field && <small>Sección: {error.field}{Number.isInteger(error.position) ? ` · posición ${error.position + 1}` : ''}</small>}</section>}
      {result && <section className={`result-card ${result.truth ? 'is-true' : 'is-false'}`} aria-live="polite"><span className="eyebrow">Resultado</span><div className="result-heading"><h2>{result.result}</h2><span className="result-symbol">{result.truth ? '✓' : '×'}</span></div><p className="result-caption">{result.freeVariables.length ? `Con el entorno: ${result.freeVariables.map(name => `${name} = ${environment[name]}`).join(', ')}.` : 'Fórmula cerrada.'}</p><h3>¿Por qué?</h3><Explanation node={result.explanation} /></section>}
      </div>
    </form>
    <footer>Evaluador de lógica de primer orden · Interpretaciones finitas</footer>
  </main>;
}
