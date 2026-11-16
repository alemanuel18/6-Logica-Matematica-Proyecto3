import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePA,
  printPA,
  freePA,
  PA_AXIOMS,
  inductionPA,
  checkProof,
  encodeGodel,
  decodeGodel,
  peanoAction,
} from './domain/peano.js';
import { app } from './app.js';

test('PA: firma, precedencia, numerales y variables libres', () => {
  assert.equal(printPA(parsePA('x+2*y=S(0)')), '((x+(S(S(0))*y))=S(0))');
  assert.equal(printPA(parsePA('(x+0)=x')), '((x+0)=x)');
  assert.deepEqual(freePA(parsePA('∀x.(x+y=y)')), ['y']);
  assert.deepEqual(freePA(parsePA('∀x.x=x ∧ y=y')), ['y']);
  assert.equal(printPA(parsePA('x!=0 -> !(x=1)')), '(¬((x=0))→¬((x=S(0))))');
  for (const formula of ['P(x)', 'f(x)=0', '51=0', '∀S.(0=0)', 'x+', '', null, 'x<y'])
    assert.throws(() => parsePA(formula));
  for (const axiom of PA_AXIOMS) assert.deepEqual(freePA(parsePA(axiom.formula)), []);
});

test('PA: esquema de inducción con cierre de parámetros y respeto de ligaduras', () => {
  const result = inductionPA('x+y=y+x', 'x');
  assert.deepEqual(freePA(result), []);
  assert.match(printPA(result), /^∀y\./u);
  assert.match(printPA(inductionPA('∀x.(x=0)', 'x')), /∀x\.\(\(x=0\)\)/u);
});

test('PA: prueba aritmética con instanciación, congruencia y transitividad', () => {
  const steps = [
    { rule: 'axiom', axiom: 'P3', formula: '∀x.(x+0=x)' },
    { rule: 'forallElim', refs: [1], term: '0', formula: '0+0=0' },
    { rule: 'successor', refs: [2], formula: 'S(0+0)=1' },
    { rule: 'axiom', axiom: 'P4', formula: '∀x.∀y.(x+S(y)=S(x+y))' },
    { rule: 'forallElim', refs: [4], term: '0', formula: '∀y.(0+S(y)=S(0+y))' },
    { rule: 'forallElim', refs: [5], term: '0', formula: '0+1=S(0+0)' },
    { rule: 'trans', refs: [6, 3], formula: '0+1=1' },
  ];
  assert.equal(checkProof(steps).valid, true);
  const matchingGoal = checkProof(steps, '0+1=1');
  assert.equal(matchingGoal.valid, true);
  assert.equal(matchingGoal.goal.valid, true);
  const differentGoal = checkProof(steps, '0=0');
  assert.equal(differentGoal.valid, false);
  assert.equal(
    differentGoal.steps.every((step) => step.valid),
    true,
  );
  assert.equal(differentGoal.goal.derived, '((0+S(0))=S(0))');
  steps[1].formula = '0+0=1';
  const invalid = checkProof(steps);
  assert.equal(invalid.valid, false);
  assert.equal(invalid.steps[2].valid, false);
  assert.equal(invalid.steps[6].valid, false);
});

test('PA: rechaza captura, referencias futuras y axiomas inventados', () => {
  const checked = checkProof([
    { rule: 'axiom', axiom: 'P2', formula: '∀x.∀y.(S(x)=S(y)→x=y)' },
    { rule: 'forallElim', refs: [1], term: 'y', formula: '∀y.(S(y)=S(y)→y=y)' },
    { rule: 'sym', refs: [4], formula: '0=0' },
    { rule: 'axiom', axiom: 'P3', formula: '0=1' },
  ]);
  assert.equal(checked.steps[0].valid, true);
  assert.match(checked.steps[1].error, /captura/);
  assert.equal(checked.steps[2].valid, false);
  assert.equal(checked.steps[3].valid, false);
});

test('PA: inducción, modus ponens, conjunción, generalización e igualdad', () => {
  const body = 'x=x',
    formula = printPA(inductionPA(body, 'x'));
  assert.equal(
    checkProof([
      { rule: 'induction', body, variable: 'x', formula },
      { rule: 'refl', term: '0', formula: '0=0' },
      { rule: 'refl', term: 'S(0)', formula: '1=1' },
      { rule: 'andIntro', refs: [2, 3], formula: '0=0 ∧ 1=1' },
      { rule: 'andLeft', refs: [4], formula: '0=0' },
      { rule: 'andRight', refs: [4], formula: '1=1' },
      { rule: 'sym', refs: [5], formula: '0=0' },
      { rule: 'forallIntro', refs: [5], variable: 'x', formula: '∀x.(0=0)' },
      { rule: 'axiom', axiom: 'P2', formula: '∀x.∀y.(S(x)=S(y)→x=y)' },
      { rule: 'forallElim', refs: [9], term: '0', formula: '∀y.(S(0)=S(y)→0=y)' },
      { rule: 'forallElim', refs: [10], term: '0', formula: 'S(0)=S(0)→0=0' },
      { rule: 'mp', refs: [11, 3], formula: '0=0' },
    ]).valid,
    true,
  );
});

test('Gödel: entero exacto, normalización, variables y recuperación', () => {
  for (const formula of ['0=0', '1=0', 'x=0', '∀x.(x=0)', 'x1=x1']) {
    const encoded = encodeGodel(formula);
    if (encoded.number) assert.equal(decodeGodel(encoded.number).formula, encoded.canonical);
    assert.ok(encoded.factors.every((f) => BigInt(f.exponent) > 0n));
  }
  const simple = encodeGodel('0=0');
  assert.equal(simple.number, (2n ** 13n * 3n * 5n ** 5n * 7n * 11n ** 14n).toString());
  assert.equal(encodeGodel('long_variable=0').expanded, false);
  for (const value of ['1', '3', '0', '-2', 'abc', '2'.repeat(4001)])
    assert.throws(() => decodeGodel(value));
  assert.throws(() => peanoAction({ action: 'unknown' }));
});

test('API Peano: validación, prueba y errores 422', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.on('listening', resolve));
  try {
    const post = (body) =>
      fetch(`http://127.0.0.1:${server.address().port}/api/peano`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    const valid = await post({ action: 'analyze', formula: '∀x.(x+0=x)' });
    assert.equal(valid.status, 200);
    assert.deepEqual((await valid.json()).freeVariables, []);
    const automatic = await post({ action: 'prove', formula: '2+2=4', maxSteps: 100 });
    assert.equal(automatic.status, 200);
    const solution = await automatic.json();
    assert.equal(solution.status, 'proved');
    const manual = await post({
      action: 'proof',
      formula: solution.formula,
      steps: solution.steps,
    });
    const checkedManual = await manual.json();
    assert.equal(checkedManual.valid, true);
    assert.equal(checkedManual.goal.valid, true);
    assert.equal((await post({ action: 'prove', formula: '0=0', maxSteps: 1000 })).status, 422);
    assert.equal((await post({ action: 'encode', formula: 'P(x)' })).status, 422);
    assert.equal((await post({ action: 'proof', steps: [] })).status, 422);
    assert.equal((await post(null)).status, 400);
  } finally {
    server.close();
  }
});
