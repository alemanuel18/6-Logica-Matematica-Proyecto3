import test from 'node:test';
import assert from 'node:assert/strict';
import { provePA, parsePA, printPA, checkProof, peanoAction } from './domain/peano.js';

test('Automático: produce certificados reutilizables y termina en el objetivo pedido', () => {
  for (const formula of [
    '0+1=1',
    '2+2=4',
    '2*3=6',
    '(1+1)*(1+1)=4',
    '∀n.(n+0=n)',
    '∀x.(x+1=S(x))',
    'x*0=0',
    '∀n.¬(S(n)=0)',
    'S(0)=S(0)→0=0',
    '(1+1=2)∧(2*1=2)',
    '∃x.(x+1=3)',
    '∃x.∃y.(x+y=2)',
  ]) {
    const result = provePA(formula);
    assert.equal(result.status, 'proved', formula);
    assert.equal(checkProof(result.steps).valid, true, formula);
    assert.equal(printPA(parsePA(result.steps.at(-1).formula)), printPA(parsePA(formula)));
    assert.ok(result.steps.length <= 100);
    result.steps.forEach((step, index) =>
      step.refs.forEach((ref) => assert.ok(ref > 0 && ref <= index)),
    );
  }
});

test('Automático: igualdades pequeñas contra aritmética independiente', () => {
  for (let a = 0; a <= 3; a++)
    for (let b = 0; b <= 3; b++) {
      for (const [operator, value] of [
        ['+', a + b],
        ['*', a * b],
      ]) {
        const result = provePA(`${a}${operator}${b}=${value}`);
        assert.equal(result.status, 'proved', `${a}${operator}${b}`);
        assert.equal(checkProof(result.steps).valid, true);
        assert.equal(provePA(`${a}${operator}${b}=${value + 1}`).status, 'notFound');
      }
    }
});

test('Automático: límite, fórmula falsa y teorema fuera de estrategia no se confunden con refutación', () => {
  for (const [formula, limit] of [
    ['2*3=6', 10],
    ['0=1', 100],
    ['∀x.(0+x=x)', 100],
    ['∃x.(x=6)', 100],
    ['∀x.∃y.(y=x)', 100],
  ]) {
    const result = provePA(formula, limit);
    assert.equal(result.status, 'notFound');
    assert.deepEqual(result.steps, []);
    assert.match(result.message, /no implica.*falsa/);
    assert.equal(Object.hasOwn(result, 'truth'), false);
  }
  assert.equal(provePA('2*3=6', 10).reason, 'limit');
  assert.throws(() => provePA('P(x)'));
  for (const limit of [0, 101, 10.5, '100', null]) assert.throws(() => provePA('0=0', limit));
  assert.equal(peanoAction({ action: 'prove', formula: '1+1=2' }).status, 'proved');
});

test('Manual: nuevas reglas comprueban operador, testigo y captura', () => {
  const base = [{ formula: '0=0', rule: 'refl', term: '0' }];
  assert.equal(
    checkProof([...base, { formula: '0+0=0+0', rule: 'congruence', operator: '+', refs: [1, 1] }])
      .valid,
    true,
  );
  assert.equal(
    checkProof([...base, { formula: '0*0=0*0', rule: 'congruence', operator: '*', refs: [1, 1] }])
      .valid,
    true,
  );
  assert.equal(
    checkProof([...base, { formula: '0+0=0+0', rule: 'congruence', operator: '-', refs: [1, 1] }])
      .valid,
    false,
  );
  assert.equal(
    checkProof([...base, { formula: '∃x.(x=0)', rule: 'existsIntro', term: '0', refs: [1] }]).valid,
    true,
  );
  assert.equal(
    checkProof([...base, { formula: '∃x.(x=0)', rule: 'existsIntro', term: '1', refs: [1] }]).valid,
    false,
  );
  const capture = checkProof([
    { formula: 'y=y', rule: 'refl', term: 'y' },
    { formula: '∀y.(y=y)', rule: 'forallIntro', variable: 'y', refs: [1] },
    { formula: '∃x.∀y.(x=y)', rule: 'existsIntro', term: 'y', refs: [2] },
  ]);
  assert.equal(capture.valid, false);
  assert.match(capture.steps[2].error, /captura/);
});
