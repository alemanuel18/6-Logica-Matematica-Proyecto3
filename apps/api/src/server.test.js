import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from './server.js';

test('API: salud, análisis, evaluación y errores sin valor de verdad', async () => {
  const server = await new Promise(resolve => { const listener = app.listen(0, '127.0.0.1', () => resolve(listener)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = async (path, body) => {
    const response = await fetch(`${base}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return { status: response.status, body: await response.json() };
  };
  try {
    assert.equal((await (await fetch(`${base}/api/health`)).json()).status, 'ok');
    const tuples = await post('/api/tuples', { domain: ['a', 'b'], arities: [1] });
    assert.deepEqual(tuples.body.tuples['1'], [['a'], ['b']]);
    const input = { domain: ['a', 'b'], functions: [], predicates: [{ name: 'P', arity: 1, tuples: [['a']] }], formula: 'P(x)', environment: { x: 'a' } };
    assert.deepEqual((await post('/api/analyze', input)).body.freeVariables, ['x']);
    const valid = await post('/api/evaluate', input);
    assert.equal(valid.status, 200);
    assert.equal(valid.body.truth, true);
    const invalid = await post('/api/evaluate', { ...input, environment: {} });
    assert.equal(invalid.status, 422);
    assert.equal(Object.hasOwn(invalid.body, 'truth'), false);
  } finally { server.close(); }
});
