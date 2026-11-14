'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  lessons,
  LESSON_STORAGE_KEY,
  restoreLesson,
  unlockedLesson,
} from '../services/godelLesson.js';

export function IncompletenessSection() {
  const [progress, setProgress] = useState(() => restoreLesson(null));
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [choice, setChoice] = useState(null);
  const [hints, setHints] = useState({});
  const heading = useRef(null);
  const { current, responses, revealed, notebook } = progress;
  const lesson = lessons[current];
  const correct = responses[lesson.id] === lesson.correct;
  const reviewed = revealed.includes(lesson.id);
  const answered = Number.isInteger(responses[lesson.id]) && responses[lesson.id] === choice;
  const hintCount = hints[lesson.id] ?? 0;
  const available = unlockedLesson(responses, revealed);
  const completed = lessons.filter(
    (item) => responses[item.id] === item.correct || revealed.includes(item.id),
  ).length;
  const solved = lessons.filter((item) => responses[item.id] === item.correct).length;

  useEffect(() => {
    try {
      const restored = restoreLesson(JSON.parse(localStorage.getItem(LESSON_STORAGE_KEY)));
      setProgress(restored);
      setChoice(restored.responses[lessons[restored.current].id] ?? null);
    } catch {
      /* A missing or unreadable save starts a fresh lesson. */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(LESSON_STORAGE_KEY, JSON.stringify(progress));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [progress, ready]);

  function goTo(index) {
    if (index < 0 || index > available) return;
    setProgress((old) => ({ ...old, current: index }));
    setChoice(responses[lessons[index].id] ?? null);
    requestAnimationFrame(() => heading.current?.focus());
  }

  return (
    <section className="card pa-full godel-course" aria-labelledby="godel-course-title">
      <div className="course-intro">
        <span className="eyebrow">05 · APRENDE HACIÉNDOLO</span>
        <h2 id="godel-course-title">¿Podemos construir una máquina que lo demuestre todo?</h2>
        <p>
          Ese será tu encargo. En nueve retos cortos vas a descubrir por qué unas reglas para los
          números pueden dejar preguntas sin respuesta. No necesitas escribir fórmulas ni conocer
          vocabulario especial.
        </p>
        <p className="syntax-note">
          Puedes equivocarte, pedir pistas o ver una explicación. No hay tiempo límite ni
          penalizaciones.
        </p>
      </div>
      <div className="course-progress">
        <label htmlFor="godel-course-progress">
          Tu recorrido: {completed} de {lessons.length} retos revisados
        </label>
        <progress id="godel-course-progress" max={lessons.length} value={completed} />
        <span>
          {saved
            ? 'Tu avance se guarda en este navegador.'
            : 'Puedes continuar el recorrido durante esta visita.'}
        </span>
      </div>
      <div className="course-layout">
        <nav className="course-map" aria-label="Retos de la lección de Gödel">
          <ol>
            {lessons.map((item, index) => {
              const done = responses[item.id] === item.correct || revealed.includes(item.id);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled={!ready || index > available}
                    aria-current={current === index ? 'step' : undefined}
                    onClick={() => goTo(index)}
                  >
                    <span className="course-number" aria-hidden="true">
                      {done ? '✓' : index + 1}
                    </span>
                    <span>
                      {item.label}
                      <small>
                        {responses[item.id] === item.correct
                          ? 'Resuelto'
                          : revealed.includes(item.id)
                            ? 'Revisado con ayuda'
                            : index > available
                              ? 'Se abre al avanzar'
                              : 'Por descubrir'}
                      </small>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
        <div className="course-challenge">
          <span className="eyebrow">
            RETO {current + 1} DE {lessons.length}
          </span>
          <h3 ref={heading} tabIndex={-1} className="course-title">
            {lesson.title}
          </h3>
          <p className="course-story">{lesson.story}</p>
          <ol className="course-scene" aria-label="La idea de este reto">
            {lesson.scene.map((text, index) => (
              <li key={text}>
                <span aria-hidden="true">{index + 1}</span>
                {text}
              </li>
            ))}
          </ol>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (choice !== null && !correct)
                setProgress((old) => ({
                  ...old,
                  responses: { ...old.responses, [lesson.id]: choice },
                }));
            }}
          >
            <fieldset disabled={!ready || correct}>
              <legend>{lesson.question}</legend>
              <div className="course-options">
                {lesson.options.map(([text], index) => (
                  <label
                    key={text}
                    className={`course-option ${choice === index ? 'is-selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`godel-${lesson.id}`}
                      value={index}
                      checked={choice === index}
                      onChange={() => setChoice(index)}
                    />
                    <span>{text}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="pa-toolbar">
              <button
                className="secondary pa-action"
                type="submit"
                disabled={!ready || choice === null || correct}
              >
                {correct ? 'Reto resuelto' : 'Comprobar mi respuesta'}
              </button>
              <button
                className="secondary compact"
                type="button"
                disabled={!ready || hintCount >= lesson.hints.length}
                onClick={() => setHints((old) => ({ ...old, [lesson.id]: hintCount + 1 }))}
              >
                {hintCount >= lesson.hints.length ? 'Ya viste las pistas' : 'Dame una pista'}
              </button>
            </div>
          </form>
          <div aria-live="polite" aria-atomic="true">
            {lesson.hints.slice(0, hintCount).map((hint, index) => (
              <p key={hint} className="course-hint">
                <strong>Pista {index + 1}.</strong> {hint}
              </p>
            ))}
            {answered && (
              <div className={`course-feedback ${correct ? 'is-correct' : ''}`}>
                <strong>{correct ? '¡Esa es la idea!' : 'Probemos otra posibilidad'}</strong>
                <p>{lesson.options[choice][1]}</p>
                {!correct && (
                  <p>Puedes cambiar tu respuesta y volver a probar, o pedir una explicación.</p>
                )}
              </div>
            )}
          </div>
          {!correct && !reviewed && (
            <button
              className="course-help"
              type="button"
              disabled={!ready}
              onClick={() =>
                setProgress((old) => ({ ...old, revealed: [...old.revealed, lesson.id] }))
              }
            >
              Necesito que me lo expliques
            </button>
          )}
          {(correct || reviewed) && (
            <div className="course-takeaway" aria-live="polite">
              {!correct && (
                <>
                  <strong>Vamos juntos</strong>
                  <p>La opción que buscamos es: «{lesson.options[lesson.correct][0]}».</p>
                  <p>{lesson.options[lesson.correct][1]}</p>
                </>
              )}
              <strong>Qué te llevas de este reto</strong>
              <p>{lesson.takeaway}</p>
            </div>
          )}
          <details className="pa-details course-optional" key={lesson.id}>
            <summary>Si tienes curiosidad: el detalle matemático</summary>
            <p>{lesson.formal}</p>
          </details>
          <div className="course-navigation">
            <button
              className="secondary compact"
              type="button"
              disabled={!ready || current === 0}
              onClick={() => goTo(current - 1)}
            >
              ← Reto anterior
            </button>
            {current < lessons.length - 1 ? (
              <button
                className="secondary pa-action"
                type="button"
                disabled={!ready || (!correct && !reviewed)}
                onClick={() => goTo(current + 1)}
              >
                Continuar al siguiente reto →
              </button>
            ) : (
              <span className="syntax-note">
                {correct || reviewed
                  ? 'Llegaste al final del recorrido.'
                  : 'Resuelve el último reto o revisa su explicación.'}
              </span>
            )}
          </div>
        </div>
      </div>
      {completed === lessons.length && (
        <section className="course-finish" aria-labelledby="godel-finish-title">
          <span className="eyebrow">ENCARGO COMPLETADO</span>
          <h3 id="godel-finish-title">Ahora la conclusión también es tuya</h3>
          <p>
            Revisaste los nueve retos: {solved} resueltos y {completed - solved} revisados con
            ayuda. Puedes volver a cualquiera para practicar.
          </p>
          <p>
            Ya puedes contar la idea: si unas reglas mecánicas para una aritmética suficientemente
            rica no se contradicen, hay afirmaciones que esas reglas no pueden decidir.
          </p>
          <label className="field-label" htmlFor="godel-notebook">
            Cuéntaselo a alguien con tus palabras
          </label>
          <textarea
            id="godel-notebook"
            rows={4}
            maxLength={4000}
            value={notebook}
            onChange={(event) => setProgress((old) => ({ ...old, notebook: event.target.value }))}
            placeholder="Imagina una máquina que sigue unas reglas…"
          />
          <p className="syntax-note">Esta reflexión es tuya. No se califica automáticamente.</p>
          <details className="pa-details">
            <summary>Ver una posible explicación, sin fórmulas</summary>
            <p>
              Le dimos reglas a una máquina para demostrar cosas sobre números. Después usamos
              números para hablar de sus propias pruebas. Gödel construyó un mensaje especial que
              esas reglas no podían demostrar sin contradecirse. Con un ajuste adicional de Rosser,
              aparece un mensaje que tampoco pueden refutar. Por eso unas reglas fijas, mecánicas y
              consistentes, con suficiente aritmética, no pueden decidirlo todo.
            </p>
          </details>
          <details className="pa-details course-optional">
            <summary>¿Y si añadimos la respuesta como una regla nueva?</summary>
            <p>
              Podemos ampliar el sistema. Pero, si las nuevas reglas siguen siendo mecánicas,
              consistentes y suficientemente potentes, el resultado vuelve a aplicarse al sistema
              ampliado. La nueva pregunta sin decidir puede ser otra.
            </p>
          </details>
        </section>
      )}
      <div className="pa-toolbar">
        <button
          type="button"
          className="course-help"
          disabled={!ready}
          onClick={() => {
            setProgress((old) => ({ ...restoreLesson(null), notebook: old.notebook }));
            setChoice(null);
            setHints({});
            requestAnimationFrame(() => heading.current?.focus());
          }}
        >
          Reiniciar los retos
        </button>
      </div>
      <p className="syntax-note">
        Esta es una explicación intuitiva: algunos puentes matemáticos se explican sin demostrarlos
        por completo. Puedes consultar la versión detallada cuando quieras.
      </p>
      <Link className="course-entry" href="/godel/teoremas">
        Consultar la notación y los teoremas con más detalle →
      </Link>
    </section>
  );
}
