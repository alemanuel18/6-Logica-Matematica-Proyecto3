import test from 'node:test';
import assert from 'node:assert/strict';
import { relationFacts, programs, initialMachine, stepMachine } from './activities.js';
import { evaluate } from '../../../../backend/src/services/evaluationService.js';

test('Los retos de relaciones coinciden con el evaluador para todos los mundos de 2 y 3 elementos', () => {
  for (const size of [2, 3]) {
    const domain = Array.from({ length: size }, (_, i) => String(i));
    for (let mask = 0; mask < 2 ** (size * size); mask++) {
      const edges = [],
        tuples = [];
      for (let i = 0; i < size * size; i++) {
        if (mask & (1 << i)) {
          const x = Math.floor(i / size),
            y = i % size;
          edges.push(`${x}:${y}`);
          tuples.push([String(x), String(y)]);
        }
      }
      const facts = relationFacts(size, edges);
      for (const [fact, formula] of [
        ['everyoneKnowsSomeone', '∀x.∃y.R(x,y)'],
        ['someoneKnownByEveryone', '∃y.∀x.R(x,y)'],
        ['symmetric', '∀x.∀y.(R(x,y) → R(y,x))'],
      ]) {
        assert.equal(
          facts[fact],
          evaluate({ domain, predicates: [{ name: 'R', arity: 2, tuples }], formula }).truth,
          `size=${size}, mask=${mask}, ${fact}`,
        );
      }
    }
  }
});

function execute(program, limit) {
  let state = initialMachine(program);
  for (let i = 0; i < limit; i++) state = stepMachine(program, state);
  return state;
}
test('La cuenta atrás termina y una máquina detenida no sigue ejecutando', () => {
  const state = execute(programs[0], 100);
  assert.equal(state.status, 'halted');
  assert.equal(state.n, 0);
  assert.equal(state.steps, 11);
  assert.equal(stepMachine(programs[0], state), state);
});
test('Un ciclo requiere la repetición de la configuración completa, no solo de la línea', () => {
  const state = execute(programs[1], 100);
  assert.equal(state.status, 'cycle');
  assert.equal(state.steps, 3);
  assert.equal(state.n, 0);
  assert.equal(state.pc, 0);
  const growing = execute(programs[2], 200);
  assert.equal(growing.status, 'running');
  assert.equal(growing.steps, 200);
  assert.equal(growing.n, 100);
  assert.equal(new Set(growing.seen).size, growing.seen.length);
  assert.equal(growing.trace.length, 30);
});
test('La instrucción de resta conserva el dominio natural en cero', () => {
  const program = {
    initial: 0,
    lines: ['n ← n − 1', 'FIN'],
    code: [{ op: 'dec' }, { op: 'halt' }],
  };
  assert.equal(execute(program, 1).n, 0);
  assert.equal(execute(program, 2).status, 'halted');
});
