'use client';

import { useState } from 'react';
import { reviewWorkshop, workshopFormula, workshopTasks } from '../services/theoremWorkshop.js';

export function TheoremWorkshop({ theory, hypothesis, onAssumeConsistency }) {
  const [schema, setSchema] = useState('goedel');
  const [choices, setChoices] = useState({});
  const [reviewed, setReviewed] = useState(null);
  const [trace, setTrace] = useState(0);
  const [draft, setDraft] = useState(null);
  const task = workshopTasks[schema];
  const formula = workshopFormula(schema, choices, theory);
  const context = JSON.stringify([schema, choices, theory, hypothesis]);
  const result = reviewed === context ? reviewWorkshop(schema, choices, hypothesis) : null;
  const complete = task.slots.every((slot) => choices[slot.id]);

  return (
    <section className="theorem-workshop" aria-labelledby="workshop-title">
      <h3 id="workshop-title">Construir y poner a prueba el esquema</h3>
      <p className="hint">
        Elige las piezas que expresan la idea, comprueba su sentido y descubre qué pasos conectan la
        construcción con su conclusión. Se usan la teoría y la hipótesis seleccionadas arriba.
      </p>
      <label className="field-label" htmlFor="workshop-task">
        ¿Qué quieres construir?
      </label>
      <select
        id="workshop-task"
        className="pa-input"
        value={schema}
        onChange={(event) => {
          setSchema(event.target.value);
          setChoices({});
          setReviewed(null);
          setTrace(0);
          setDraft(null);
        }}
      >
        {Object.entries(workshopTasks).map(([id, value]) => (
          <option key={id} value={id}>
            {value.label}
          </option>
        ))}
      </select>
      <p className="workshop-goal">
        <strong>Tu objetivo.</strong> {task.goal}
      </p>
      <p className="syntax-note">
        Teoría: {theory}. Hipótesis actual:{' '}
        {hypothesis === 'omega'
          ? 'ω-consistencia'
          : hypothesis === 'consistent'
            ? 'consistencia'
            : 'sin asumir consistencia'}
        . Puedes cambiarla en los selectores de esta página.
      </p>
      <div className="godel-grid">
        {task.slots.map((slot) => (
          <label
            key={`${schema}-${slot.id}`}
            className="field-label"
            htmlFor={`workshop-${slot.id}`}
          >
            {slot.label}
            <select
              id={`workshop-${slot.id}`}
              className="pa-input"
              value={choices[slot.id] ?? ''}
              onChange={(event) => {
                setChoices((old) => ({ ...old, [slot.id]: event.target.value }));
                setTrace(0);
                setDraft(null);
              }}
            >
              <option value="">Elige una pieza…</option>
              {slot.options.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="workshop-preview">
        <span className="eyebrow">ASÍ VA TU CONSTRUCCIÓN</span>
        <p className="math-text">{formula}</p>
        <p className="syntax-note">
          {complete
            ? 'Esta es tu propuesta; compruébala antes de usar su conclusión.'
            : 'Los cuadros □ se completan al elegir las piezas.'}
        </p>
      </div>
      <button
        className="secondary pa-action"
        onClick={() => {
          setReviewed(context);
          setTrace(0);
        }}
      >
        Comprobar mi construcción
      </button>
      <div aria-live="polite" aria-atomic="true">
        {result && (
          <div className={`course-feedback ${result.status === 'ready' ? 'is-correct' : ''}`}>
            <strong>
              {result.status === 'ready'
                ? 'Las piezas encajan'
                : result.status === 'missingHypothesis'
                  ? 'Falta una hipótesis'
                  : 'Revisa tu construcción'}
            </strong>
            {result.messages.map((message) => (
              <p key={message}>{message}</p>
            ))}
            {result.status === 'missingHypothesis' && (
              <button className="secondary compact" onClick={onAssumeConsistency}>
                Explorar suponiendo consistencia
              </button>
            )}
          </div>
        )}
      </div>
      {result?.status === 'ready' && (
        <div className="workshop-reasoning">
          <h4>¿Cómo llegamos a la conclusión?</h4>
          {trace === 0 && (
            <p className="hint">
              Revela el razonamiento paso a paso, sin saltar directamente a la fórmula final.
            </p>
          )}
          <ol aria-live="polite">
            {task.reasoning.slice(0, trace).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
          {trace < task.reasoning.length ? (
            <button className="secondary compact" onClick={() => setTrace(trace + 1)}>
              {trace === 0 ? 'Empezar el razonamiento' : 'Ver el siguiente paso'}
            </button>
          ) : (
            <p className="pa-success">
              Recorrido completado. Cambia una pieza o la hipótesis para explorar por qué el
              resultado deja de aplicarse.
            </p>
          )}
        </div>
      )}
      <details className="pa-details course-optional">
        <summary>Guardar una versión con mis propias palabras o símbolos</summary>
        <label className="field-label" htmlFor="incompleteness-draft">
          Borrador libre
        </label>
        <textarea
          id="incompleteness-draft"
          rows={4}
          maxLength={5000}
          value={draft ?? formula}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button className="secondary pa-action" onClick={() => setDraft(null)}>
          Usar la construcción actual
        </button>
        <p className="syntax-note">Este borrador es libre y no se comprueba automáticamente.</p>
      </details>
      <p className="syntax-note">
        La revisión comprueba las piezas elegidas y las hipótesis de este ejercicio. No certifica
        una demostración formal completa ni la consistencia de PA. G, R, Proof y Prov son
        abreviaturas; ⊢ significa «demuestra», ⊬ «no demuestra» y ⌜A⌝ señala el código de A.
      </p>
    </section>
  );
}
