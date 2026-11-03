import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, inspect, tupleOptions, ValidationError } from './logic.js';

const model = {
  domain: ['a', 'b'],
  functions: [
    { name: 'c', arity: 0, table: [{ args: [], value: 'a' }] },
    { name: 'f', arity: 1, table: [{ args: ['a'], value: 'b' }, { args: ['b'], value: 'a' }] }
  ],
  predicates: [
    { name: 'P', arity: 1, tuples: [['a']] },
    { name: 'R', arity: 2, tuples: [['a', 'b']] }
  ]
};
const run = (formula, environment = {}, changes = {}) => evaluate({ ...model, ...changes, formula, environment });

test('funciones, igualdad y conectivos', () => {
  assert.equal(run('P(f(c))').truth, false);
  assert.equal(run('f(c) = b', { b: 'b' }).truth, true);
  assert.equal(run('¬P(f(c)) ∧ (P(c) → R(c,f(c)))').truth, true);
  assert.equal(run('P(c) ↔ P(f(c))').truth, false);
});

test('variables libres y entorno', () => {
  assert.deepEqual(inspect({ ...model, formula: 'P(x) ∨ R(x,y)' }).freeVariables, ['x', 'y']);
  assert.equal(run('P(x)', { x: 'a' }).truth, true);
  assert.throws(() => run('P(x)'), /Falta asignar/);
  assert.throws(() => run('P(x)', { x: 'z' }), /no pertenece al dominio/);
});

test('cuantificadores y evidencia decisiva o completa', () => {
  const witness = run('∃x.P(x)');
  assert.equal(witness.truth, true);
  assert.equal(witness.explanation.evidence, 'decisive');
  assert.equal(witness.explanation.checks[0].assignment.x, 'a');
  const counterexample = run('∀x.P(x)');
  assert.equal(counterexample.truth, false);
  assert.equal(counterexample.explanation.checks[0].assignment.x, 'b');
  assert.equal(run('∀x.(P(x) ∨ ¬P(x))').explanation.checks.length, 2);
  assert.equal(run('∃x.(P(x) ∧ ¬P(x))').explanation.evidence, 'complete');
  assert.equal(run('∀x.∃y.(R(x,y) ∨ x = y)').truth, true);
});

test('rechaza sintaxis, símbolos y aridades inválidos', () => {
  for (const formula of ['P(', 'P(c) ∧', 'Q(c)', 'P(c,c)', 'f(c)', 'P(@)']) {
    assert.throws(() => run(formula), ValidationError);
  }
});

test('rechaza dominios, tablas y relaciones inválidas', () => {
  assert.throws(() => run('P(c)', {}, { domain: [] }), /dominio/);
  assert.throws(() => run('P(c)', {}, { functions: [{ name: 'c', arity: 0, table: [] }] }), /tabla no vacía/);
  assert.throws(() => run('P(c)', {}, { functions: [{ name: 'f', arity: 1, table: [{ args: ['a'], value: 'a' }] }] }), /requiere 2 asignaciones/);
  assert.throws(() => run('P(c)', {}, { predicates: [{ name: 'P', arity: 1, tuples: [] }] }), /relación no vacía/);
  assert.throws(() => run('P(c)', {}, { predicates: [{ name: 'P', arity: 1, tuples: [['z']] }] }), /Tupla inválida/);
});

test('genera tuplas para formularios desde el backend', () => {
  assert.deepEqual(tupleOptions(['a', 'b'], [0, 2]), { 0: [[]], 2: [['a', 'a'], ['a', 'b'], ['b', 'a'], ['b', 'b']] });
});
