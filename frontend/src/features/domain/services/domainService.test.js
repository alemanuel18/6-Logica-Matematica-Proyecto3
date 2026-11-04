import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDomain } from './domainService.js';

test('convierte la entrada del dominio en elementos visibles para la interfaz', () => {
  assert.deepEqual(parseDomain(' a, b\nc '), ['a', 'b', 'c']);
  assert.deepEqual(parseDomain(''), []);
});
