'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  edge,
  people,
  relationFacts,
  programs,
  initialMachine,
  stepMachine,
  falseProofs,
  rooms,
} from './activities.js';

function Message({ children, success = false }) {
  return (
    <div className={`activity-feedback ${success ? 'is-success' : ''}`} role="status">
      {children}
    </div>
  );
}
function Panel({ label, title, children }) {
  return (
    <section className="activity-panel">
      <span className="activity-kicker">{label}</span>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
function RelationMap({ size = 3, edges, onToggle, disabled = false }) {
  const nodes = people.slice(0, size);
  const coords =
    size === 2
      ? [
          [95, 100],
          [325, 100],
        ]
      : [
          [210, 42],
          [80, 220],
          [340, 220],
        ];
  return (
    <div className="relation-map">
      <svg
        viewBox="0 0 420 285"
        role="img"
        aria-label={`Mapa de relaciones: ${
          edges.length
            ? edges
                .map((e) => {
                  const [x, y] = e.split(':');
                  return `${people[x]} conoce a ${people[y]}`;
                })
                .join('; ')
            : 'ninguna flecha'
        }`}
      >
        <defs>
          <marker
            id="relation-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
        </defs>
        {edges.map((e) => {
          const [x, y] = e.split(':').map(Number);
          const [ax, ay] = coords[x],
            [bx, by] = coords[y];
          if (x === y)
            return (
              <path
                key={e}
                d={`M ${ax - 18} ${ay - 15} C ${ax - 65} ${ay - 70}, ${ax + 65} ${ay - 70}, ${ax + 18} ${ay - 15}`}
                fill="none"
                markerEnd="url(#relation-arrow)"
              />
            );
          const length = Math.hypot(bx - ax, by - ay),
            dx = (bx - ax) / length,
            dy = (by - ay) / length;
          return (
            <path
              key={e}
              d={`M ${ax + dx * 30 - dy * 5} ${ay + dy * 30 + dx * 5} L ${bx - dx * 34 - dy * 5} ${by - dy * 34 + dx * 5}`}
              markerEnd="url(#relation-arrow)"
            />
          );
        })}
        {nodes.map((name, i) => (
          <g key={name}>
            <circle cx={coords[i][0]} cy={coords[i][1]} r="27" />
            <text x={coords[i][0]} y={coords[i][1] + 5} textAnchor="middle">
              {name[0]}
            </text>
            <text
              className="relation-name"
              x={coords[i][0]}
              y={coords[i][1] + 47}
              textAnchor="middle"
            >
              {name}
            </text>
          </g>
        ))}
      </svg>
      {onToggle && (
        <div className="relation-controls" role="group" aria-label="Flechas del mundo">
          {nodes.flatMap((x, i) =>
            nodes.map((y, j) => (
              <button
                type="button"
                key={edge(i, j)}
                disabled={disabled}
                aria-pressed={edges.includes(edge(i, j))}
                onClick={() => onToggle(edge(i, j))}
              >
                {x} → {y}
              </button>
            )),
          )}
        </div>
      )}
    </div>
  );
}

function QuantifierDuel() {
  const [mode, setMode] = useState('each');
  const [world, setWorld] = useState('cycle');
  const [round, setRound] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [message, setMessage] = useState('');
  const [finished, setFinished] = useState(false);
  const edges = world === 'cycle' ? ['0:1', '1:2', '2:0'] : ['0:1', '1:1', '2:1'];
  function reset() {
    setRound(0);
    setChosen(null);
    setMessage('');
    setFinished(false);
  }
  function choose(y) {
    if (mode === 'each') {
      if (!edges.includes(edge(round, y))) {
        setMessage(
          `${people[round]} no conoce a ${people[y]}. Mira las flechas y prueba con otro testigo.`,
        );
        return;
      }
      setChosen(y);
      if (round === 2) {
        setFinished(true);
        setMessage(
          '¡Fórmula defendida! Encontraste un testigo para cada persona. El testigo pudo cambiar en cada turno.',
        );
      } else
        setMessage(
          `Correcto: ${people[round]} conoce a ${people[y]}. Avanza para responder al siguiente turno.`,
        );
    } else {
      setChosen(y);
      const counter = people.findIndex((_, x) => !edges.includes(edge(x, y)));
      setFinished(true);
      setMessage(
        counter === -1
          ? `¡Fórmula defendida! Todo el mundo conoce a ${people[y]}. Este único testigo funciona para las tres personas.`
          : `La máquina responde con ${people[counter]}: no conoce a ${people[y]}. ${world === 'cycle' ? 'En este mundo, ninguna persona es conocida por todos: la fórmula es falsa.' : 'Esta elección pierde, pero la fórmula sí tiene otro testigo. Reinicia y búscalo.'}`,
      );
    }
  }
  return (
    <div className="activity-columns">
      <Panel label="01 / TABLERO DE TURNOS" title="¿Quién elige primero?">
        <label className="activity-label" htmlFor="duel-world">
          Mundo
        </label>
        <select
          id="duel-world"
          value={world}
          onChange={(e) => {
            setWorld(e.target.value);
            reset();
          }}
        >
          <option value="cycle">Un círculo de conocidos</option>
          <option value="hub">Todos conocen a Bruno</option>
        </select>
        <label className="activity-label" htmlFor="duel-mode">
          Fórmula que defenderás
        </label>
        <select
          id="duel-mode"
          value={mode}
          onChange={(e) => {
            setMode(e.target.value);
            reset();
          }}
        >
          <option value="each">∀x.∃y.R(x,y) · Cada uno conoce a alguien</option>
          <option value="one">∃y.∀x.R(x,y) · Alguien es conocido por todos</option>
        </select>
        <p>
          R(x,y) significa «x conoce a y». Solo cuentan las flechas dibujadas; una flecha hacia sí
          mismo también cuenta.
        </p>
        <RelationMap edges={edges} />
      </Panel>
      <Panel
        label="TU PARTIDA"
        title={mode === 'each' ? `Turno ${round + 1} de 3` : 'Un testigo para todos'}
      >
        <div className="duel-order">
          <span className={mode === 'each' ? 'is-active' : ''}>Máquina · elige x</span>
          <span aria-hidden="true">{mode === 'each' ? '→' : '←'}</span>
          <span className={mode === 'one' ? 'is-active' : ''}>Tú · eliges y</span>
        </div>
        <div className="activity-prompt">
          {mode === 'each' ? (
            <>
              La máquina elige a <strong>{people[round]}</strong>. ¿A quién conoce?
            </>
          ) : (
            <>
              Elige a una persona que sea conocida por <strong>todos</strong>. La máquina intentará
              refutarte.
            </>
          )}
        </div>
        <div className="person-choices">
          {people.map((p, y) => (
            <button
              key={p}
              disabled={finished || (mode === 'each' && chosen !== null)}
              onClick={() => choose(y)}
            >
              <span aria-hidden="true">{p[0]}</span>
              {p}
            </button>
          ))}
        </div>
        {message && (
          <Message
            success={
              mode === 'each'
                ? chosen !== null
                : chosen !== null && people.every((_, x) => edges.includes(edge(x, chosen)))
            }
          >
            {message}
          </Message>
        )}
        <div className="activity-actions">
          {mode === 'each' && chosen !== null && !finished && (
            <button
              onClick={() => {
                setRound(round + 1);
                setChosen(null);
                setMessage('');
              }}
            >
              Siguiente turno →
            </button>
          )}
          <button className="activity-secondary" onClick={reset}>
            Reiniciar partida
          </button>
        </div>
        <aside className="activity-note">
          <strong>La diferencia está en la dependencia.</strong>
          <p>
            En ∀x.∃y puedes adaptar y a cada x. En ∃y.∀x debes fijar un y antes de ver la elección
            de x. Prueba ambas fórmulas en el mismo mundo.
          </p>
        </aside>
      </Panel>
    </div>
  );
}

function Counterexamples() {
  const [size, setSize] = useState(3),
    [edges, setEdges] = useState([]),
    [challenge, setChallenge] = useState('common'),
    [checked, setChecked] = useState(false),
    [hint, setHint] = useState(false);
  const facts = relationFacts(size, edges);
  const success =
    facts.everyoneKnowsSomeone &&
    !(challenge === 'common' ? facts.someoneKnownByEveryone : facts.symmetric);
  function clear() {
    setEdges([]);
    setChecked(false);
    setHint(false);
  }
  return (
    <div className="activity-columns">
      <Panel label="02 / MAPA DE RELACIONES" title="Construye el mundo que lo contradiga">
        <label className="activity-label" htmlFor="counter-challenge">
          Afirmación que investigarás
        </label>
        <select
          id="counter-challenge"
          value={challenge}
          onChange={(e) => {
            setChallenge(e.target.value);
            clear();
          }}
        >
          <option value="common">Si todos conocen a alguien, alguien es conocido por todos.</option>
          <option value="symmetric">
            Si todos conocen a alguien, conocer es una relación simétrica.
          </option>
        </select>
        <label className="activity-label" htmlFor="counter-size">
          Tamaño del mundo
        </label>
        <select
          id="counter-size"
          value={size}
          onChange={(e) => {
            setSize(Number(e.target.value));
            clear();
          }}
        >
          <option value={2}>2 personas · reto mínimo</option>
          <option value={3}>3 personas · más posibilidades</option>
        </select>
        <p>
          Pulsa los botones para añadir o quitar flechas. Ada → Bruno significa que Ada conoce a
          Bruno. Se permiten relaciones consigo mismo.
        </p>
        <RelationMap
          size={size}
          edges={edges}
          onToggle={(e) => {
            setEdges(edges.includes(e) ? edges.filter((x) => x !== e) : [...edges, e]);
            setChecked(false);
          }}
        />
      </Panel>
      <Panel label="CUADERNO DEL DETECTIVE" title="Premisa verdadera. Conclusión falsa.">
        <p>
          Para refutar una implicación, necesitas un mundo donde se cumpla lo que supone y falle lo
          que concluye.
        </p>
        <div className="activity-formula">
          {challenge === 'common'
            ? '(∀x.∃y.R(x,y)) → (∃y.∀x.R(x,y))'
            : '(∀x.∃y.R(x,y)) → ∀x.∀y.(R(x,y) → R(y,x))'}
        </div>
        <div className="activity-actions">
          <button onClick={() => setChecked(true)}>Comprobar mundo</button>
          <button
            className="activity-secondary"
            onClick={() => setHint(!hint)}
            aria-expanded={hint}
          >
            Pista
          </button>
          <button className="activity-secondary" onClick={clear}>
            Borrar flechas
          </button>
        </div>
        {hint && (
          <Message>
            {challenge === 'common'
              ? 'Haz que cada persona tenga alguna flecha saliente. Reparte las llegadas para que ninguna reciba una flecha de todas las personas. También puedes usar dos bucles separados.'
              : 'Asegura una salida por persona, pero deja al menos una flecha sin su inversa.'}
          </Message>
        )}
        {checked && (
          <Message success={success}>
            <strong>
              {success
                ? '¡Contraejemplo encontrado!'
                : 'Este mundo todavía no refuta la afirmación.'}
            </strong>
            <ul>
              <li>Todos conocen a alguien: {facts.everyoneKnowsSomeone ? 'sí' : 'no'}.</li>
              <li>
                {challenge === 'common'
                  ? `Alguien es conocido por todos: ${facts.someoneKnownByEveryone ? 'sí' : 'no'}.`
                  : `Cada flecha tiene su inversa: ${facts.symmetric ? 'sí' : 'no'}.`}
              </li>
            </ul>
            {success
              ? `Lo lograste con ${size} personas y ${edges.length} flechas. Intenta reducir el mundo o probar el otro reto.`
              : !facts.everyoneKnowsSomeone
                ? 'La premisa es falsa. Añade al menos una salida para cada persona.'
                : 'La conclusión también es verdadera. Modifica las relaciones para hacerla falsa.'}
          </Message>
        )}
        <aside className="activity-note">
          <strong>Un límite claro.</strong>
          <p>
            Estos retos comprueban dos afirmaciones concretas en el mundo finito que construyes. No
            encontrar un contraejemplo aquí no prueba que una fórmula sea válida en todos los
            mundos.
          </p>
        </aside>
      </Panel>
    </div>
  );
}

function TuringConsole() {
  const [programIndex, setProgramIndex] = useState(0);
  const program = programs[programIndex];
  const [machine, setMachine] = useState(() => initialMachine(programs[0]));
  const [prediction, setPrediction] = useState(''),
    [revealed, setRevealed] = useState(false),
    [diagonal, setDiagonal] = useState(0);
  const stopped = machine.status === 'halted' || machine.status === 'cycle';
  const capped = machine.steps >= 200;
  const status =
    machine.status === 'halted'
      ? 'TERMINÓ'
      : machine.status === 'cycle'
        ? 'CICLO DEMOSTRADO'
        : capped
          ? 'LÍMITE · SIN CONCLUSIÓN'
          : machine.steps
            ? 'PAUSADO · SIN CONCLUSIÓN'
            : 'LISTO';
  function run(count) {
    setMachine((old) => {
      let next = old;
      for (let i = 0; i < count && next.steps < 200; i++) {
        next = stepMachine(program, next);
        if (next.status === 'halted' || next.status === 'cycle') break;
      }
      return next;
    });
  }
  return (
    <>
      <div className="activity-columns turing-columns">
        <Panel label="03 / LABORATORIO DE EJECUCIÓN" title="Antes de ejecutar, haz una predicción">
          <p>
            Esta pequeña máquina usa un registro natural n y saltos entre líneas. No es un emulador
            de cinta de Turing: sirve para experimentar con la terminación paso a paso.
          </p>
          <label className="activity-label" htmlFor="turing-program">
            Programa
          </label>
          <select
            id="turing-program"
            value={programIndex}
            onChange={(e) => {
              const i = Number(e.target.value);
              setProgramIndex(i);
              setMachine(initialMachine(programs[i]));
              setPrediction('');
              setRevealed(false);
            }}
          >
            {programs.map((p, i) => (
              <option key={p.id} value={i}>
                {p.name}
              </option>
            ))}
          </select>
          <p>
            Valor inicial: <strong>n = {program.initial}</strong>. Restar en 0 conserva 0. Los
            números de línea comienzan en 1.
          </p>
          <label className="activity-label" htmlFor="turing-prediction">
            ¿Qué crees que ocurrirá?
          </label>
          <select
            id="turing-prediction"
            value={prediction}
            onChange={(e) => {
              setPrediction(e.target.value);
              setRevealed(false);
            }}
          >
            <option value="">Elige tu predicción…</option>
            <option value="halts">Terminará</option>
            <option value="cycle">Repetirá una configuración completa</option>
            <option value="grows">Seguirá creciendo sin repetir configuración</option>
          </select>
          <button disabled={!prediction} onClick={() => setRevealed(true)}>
            Contrastar mi predicción
          </button>
          {revealed && (
            <Message success={prediction === program.prediction}>
              <strong>
                {prediction === program.prediction
                  ? 'Tu predicción es correcta. '
                  : 'Revisa tu predicción. '}
              </strong>
              {program.why}
            </Message>
          )}
          <aside className="activity-note">
            <strong>Observar no siempre permite decidir.</strong>
            <p>
              Alcanzar 200 pasos solo detiene esta simulación. Una configuración repetida sí
              demuestra un ciclo en esta máquina determinista. Un bucle puede existir sin repetir
              configuraciones.
            </p>
          </aside>
        </Panel>
        <section className="turing-terminal" aria-label="Consola de ejecución">
          <div className="terminal-bar">
            <span>
              <i /> MM3032 / runtime
            </span>
            <span>REGISTRO · n ∈ ℕ</span>
          </div>
          <div className="terminal-content">
            <div className="terminal-command">$ cargar «{program.name}»</div>
            <ol className="terminal-code">
              {program.lines.map((line, i) => (
                <li
                  key={i}
                  className={machine.pc === i ? 'current-line' : ''}
                  aria-current={machine.pc === i ? 'step' : undefined}
                >
                  <span>{line}</span>
                  {machine.pc === i && <b aria-hidden="true">←</b>}
                </li>
              ))}
            </ol>
            <div className="terminal-registers">
              <div>
                <small>REGISTRO n</small>
                <strong>{machine.n}</strong>
              </div>
              <div>
                <small>PASOS</small>
                <strong>{machine.steps.toString().padStart(3, '0')}</strong>
              </div>
              <div>
                <small>LÍNEA</small>
                <strong>{machine.pc + 1}</strong>
              </div>
            </div>
            <div className="terminal-status" role="status">
              ● {status}
            </div>
            <div className="activity-actions">
              <button disabled={stopped || capped} onClick={() => run(1)}>
                Un paso
              </button>
              <button disabled={stopped || capped} onClick={() => run(20)}>
                Ejecutar 20
              </button>
              <button
                className="terminal-reset"
                onClick={() => setMachine(initialMachine(program))}
              >
                Reiniciar
              </button>
            </div>
            <details className="terminal-trace">
              <summary>Traza · últimos 30 pasos</summary>
              <pre>{machine.trace.join('\n') || 'Esperando la primera instrucción.'}</pre>
            </details>
          </div>
        </section>
      </div>
      <Panel
        label="MÁS ALLÁ DEL SIMULADOR"
        title="¿Y si intentamos construir un detector universal?"
      >
        <p>
          Los ejemplos anteriores pueden analizarse individualmente. El problema de la parada
          pregunta si un mismo algoritmo podría decidir correctamente todos los programas y todas
          sus entradas.
        </p>
        <div className="diagonal-steps">
          {[
            '1 · Suponemos un detector H(P, entrada) que siempre termina y acierta.',
            '2 · Construimos D(P): si H(P,P) predice que termina, D entra en bucle; si predice bucle, D termina.',
            '3 · Ejecutamos D(D). Si H predice que termina, D hace lo contrario. Si predice que no termina, también hace lo contrario.',
            '4 · La suposición falla: no puede existir ese detector universal. Esto no impide resolver programas particulares.',
          ]
            .slice(0, diagonal + 1)
            .map((s) => (
              <p key={s}>{s}</p>
            ))}
        </div>
        <button
          className="activity-secondary"
          onClick={() => setDiagonal(diagonal === 3 ? 0 : diagonal + 1)}
        >
          {diagonal === 3 ? 'Volver al comienzo' : 'Siguiente idea →'}
        </button>
        <p className="activity-caption">
          Recorrido conceptual, no una ejecución de un detector real. Gödel estudia límites de
          demostración en sistemas formales; aquí el límite es el de una decisión algorítmica
          general.{' '}
          <a
            href="https://www.cs.virginia.edu/~robins/Turing_Paper_1936.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Leer a Turing (1936, en inglés) ↗
          </a>
        </p>
      </Panel>
    </>
  );
}

function EscapeRoom() {
  const [room, setRoom] = useState(0),
    [answer, setAnswer] = useState(null),
    [hint, setHint] = useState(false),
    [unlocked, setUnlocked] = useState(false);
  const completed = room === rooms.length;
  const current = rooms[Math.min(room, rooms.length - 1)];
  function restart() {
    setRoom(0);
    setAnswer(null);
    setHint(false);
    setUnlocked(false);
  }
  return (
    <div className="activity-columns">
      <Panel label="04 / MISIÓN" title="El archivo de las cuatro puertas">
        <p>
          El archivo se ha cerrado. Cada sala guarda una idea que ya conoces. Resuelve su cerradura
          para llegar a la salida; puedes volver a intentarlo sin penalización.
        </p>
        <ol className="escape-doors" aria-label="Avance de la misión">
          {rooms.map((r, i) => (
            <li
              key={r.name}
              className={room > i ? 'door-complete' : room === i ? 'door-current' : ''}
              aria-current={room === i ? 'step' : undefined}
            >
              <span aria-hidden="true">{room > i ? '✓' : `0${i + 1}`}</span>
              <div>
                <strong>{r.name}</strong>
                <small>
                  {room > i ? 'Abierta' : room === i ? 'Estás aquí' : 'Cerrada'} · {r.theme}
                </small>
              </div>
            </li>
          ))}
        </ol>
        <p className="activity-caption">
          La misión permanece abierta mientras estés en esta página.
        </p>
      </Panel>
      <Panel
        label={completed ? 'MISIÓN COMPLETADA' : `SALA ${room + 1} / 4 · ${current.theme}`}
        title={completed ? 'El archivo está abierto.' : current.name}
      >
        {completed ? (
          <>
            <div className="escape-victory" aria-hidden="true">
              ⌑ ✓
            </div>
            <p>
              Has conectado el orden de los cuantificadores, los contraejemplos, una derivación
              aritmética y la codificación de símbolos.
            </p>
            <Message success>
              Cuatro puertas abiertas. En cada una has usado una razón distinta, no solo una
              respuesta.
            </Message>
            <div className="activity-actions">
              <button onClick={restart}>Repetir misión</button>
              <Link href="/actividades" className="activity-text-link">
                Elegir otra actividad →
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="activity-prompt">{current.question}</p>
            <div className="activity-options">
              {current.options.map((option, i) => (
                <button
                  key={option}
                  className={answer === i ? 'selected-option' : ''}
                  disabled={unlocked}
                  aria-pressed={answer === i}
                  onClick={() => {
                    setAnswer(i);
                    if (i === current.correct) setUnlocked(true);
                  }}
                >
                  <span>{String.fromCharCode(65 + i)}</span>
                  {option}
                </button>
              ))}
            </div>
            {answer !== null && (
              <Message success={unlocked}>
                {unlocked
                  ? current.explanation
                  : 'La cerradura sigue cerrada. Revisa el alcance de la afirmación o consulta la pista; puedes elegir otra opción.'}
              </Message>
            )}
            <div className="activity-actions">
              {unlocked ? (
                <button
                  onClick={() => {
                    setRoom(room + 1);
                    setAnswer(null);
                    setHint(false);
                    setUnlocked(false);
                  }}
                >
                  {room === 3 ? 'Abrir la salida →' : 'Entrar a la siguiente sala →'}
                </button>
              ) : (
                <button
                  className="activity-secondary"
                  aria-expanded={hint}
                  onClick={() => setHint(!hint)}
                >
                  Ver pista
                </button>
              )}
              <button className="activity-secondary" onClick={restart}>
                Reiniciar misión
              </button>
            </div>
            {hint && !unlocked && <Message>{current.clue}</Message>}
          </>
        )}
      </Panel>
    </div>
  );
}

function FalseProofs() {
  const [index, setIndex] = useState(0),
    [selected, setSelected] = useState(null),
    [solved, setSolved] = useState([]);
  const proof = falseProofs[index];
  const correct = selected === proof.wrong;
  return (
    <div className="activity-columns">
      <Panel label="05 / MESA DE REVISIÓN" title="¿Dónde deja de valer el argumento?">
        <p>
          Selecciona el <strong>primer paso inválido</strong>. Una conclusión absurda da una señal
          de alarma; tu tarea es localizar la operación que la permitió.
        </p>
        <label className="activity-label" htmlFor="proof-case">
          Expediente
        </label>
        <select
          id="proof-case"
          value={index}
          onChange={(e) => {
            setIndex(Number(e.target.value));
            setSelected(null);
          }}
        >
          {falseProofs.map((p, i) => (
            <option value={i} key={p.title}>
              {i + 1}. {p.title}
              {solved.includes(i) ? ' · Resuelto' : ''}
            </option>
          ))}
        </select>
        <div className="proof-premise">
          <span className="activity-kicker">DATOS DE PARTIDA</span>
          <p>{proof.premise}</p>
        </div>
        <p className="activity-caption">
          Expedientes resueltos: {solved.length} / {falseProofs.length}
        </p>
        <progress
          aria-label="Expedientes resueltos"
          value={solved.length}
          max={falseProofs.length}
        />
        {selected !== null && (
          <Message success={correct}>
            {correct ? (
              <>
                <strong>Error localizado. </strong>
                {proof.explanation}
              </>
            ) : selected < proof.wrong ? (
              'Ese paso sí es válido bajo los datos de partida. Sigue la cadena: el primer error aparece más adelante.'
            ) : (
              'Ese paso ya depende de un error anterior. Busca la primera operación que no se puede justificar.'
            )}
          </Message>
        )}
        <div className="activity-actions">
          <button className="activity-secondary" onClick={() => setSelected(null)}>
            Revisar de nuevo
          </button>
          <button
            onClick={() => {
              setIndex((index + 1) % falseProofs.length);
              setSelected(null);
            }}
          >
            Siguiente expediente →
          </button>
        </div>
      </Panel>
      <Panel label="DEMOSTRACIÓN BAJO SOSPECHA" title={proof.title}>
        <ol className="false-proof-steps">
          {proof.steps.map((s, i) => (
            <li key={s}>
              <button
                className={selected === i ? (correct ? 'step-correct' : 'step-selected') : ''}
                aria-pressed={selected === i}
                onClick={() => {
                  setSelected(i);
                  if (i === proof.wrong && !solved.includes(index)) setSolved([...solved, index]);
                }}
              >
                <span className="proof-line-number">{String(i + 1).padStart(2, '0')}</span>
                <span>{s}</span>
                {selected === i && <b aria-hidden="true">{correct ? '✓' : '?'}</b>}
              </button>
            </li>
          ))}
        </ol>
        <p className="activity-caption">
          Estos casos son ejercicios preparados; no constituyen un comprobador general de
          demostraciones.
        </p>
      </Panel>
    </div>
  );
}

export function ActivityPlayer({ slug }) {
  if (slug === 'cuantificadores') return <QuantifierDuel />;
  if (slug === 'contraejemplos') return <Counterexamples />;
  if (slug === 'turing') return <TuringConsole />;
  if (slug === 'escape') return <EscapeRoom />;
  return <FalseProofs />;
}
