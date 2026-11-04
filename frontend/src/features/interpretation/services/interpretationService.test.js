import test from 'node:test';
import assert from 'node:assert/strict';
import { aritiesFor, buildInterpretation } from './interpretationService.js';

test('solicita una vez cada aridad de funciones y predicados', () => {
  assert.deepEqual(
    aritiesFor([{ arity: 0 }, { arity: 2 }], [{ arity: 2 }, { arity: 1 }]),
    [0, 1, 2],
  );
});

test('construye el contrato de la API con tuplas generadas por el backend', () => {
  const interpretation = buildInterpretation(
    ['a', 'b'],
    [{ name: 'f', arity: 1, table: { '["a"]': 'b', '["b"]': 'a' } }],
    [{ name: 'P', arity: 1, tuples: { '["a"]': true } }],
    { 1: [['a'], ['b']] },
  );
  assert.deepEqual(interpretation.functions[0].table, [
    { args: ['a'], value: 'b' },
    { args: ['b'], value: 'a' },
  ]);
  assert.deepEqual(interpretation.predicates[0].tuples, [['a']]);
});
