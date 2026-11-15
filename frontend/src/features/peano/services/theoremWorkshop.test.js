import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewWorkshop, workshopFormula, workshopTasks } from './theoremWorkshop.js';

test('Taller: construir una definición o punto fijo no presupone consistencia', () => {
  for (const schema of ['proof', 'goedel'])
    assert.equal(reviewWorkshop(schema, workshopTasks[schema].correct, 'none').status, 'ready');
  assert.equal(
    reviewWorkshop('proof', { quantifier: 'all', arguments: 'proofFirst' }, 'omega').status,
    'revise',
  );
  assert.match(
    reviewWorkshop('proof', { quantifier: 'exists', arguments: 'formulaFirst' }, 'consistent')
      .messages[0],
    /primer lugar/,
  );
  assert.equal(
    reviewWorkshop('goedel', { claim: 'notProvable', reference: 'other' }, 'omega').status,
    'revise',
  );
});

test('Taller: las conclusiones de incompletitud requieren las hipótesis y oraciones adecuadas', () => {
  for (const schema of ['rosser', 'second']) {
    const choices = workshopTasks[schema].correct;
    assert.equal(reviewWorkshop(schema, choices, 'none').status, 'missingHypothesis');
    assert.equal(reviewWorkshop(schema, choices, 'consistent').status, 'ready');
    assert.equal(reviewWorkshop(schema, choices, 'omega').status, 'ready');
  }
  assert.equal(
    reviewWorkshop('rosser', { sentence: 'goedel', conclusion: 'neither' }, 'consistent').status,
    'revise',
  );
  assert.equal(
    reviewWorkshop('second', { scope: 'other', conclusion: 'cannotProve' }, 'consistent').status,
    'revise',
  );
  assert.equal(
    reviewWorkshop('second', { scope: 'self', conclusion: 'canProve' }, 'omega').status,
    'revise',
  );
});

test('Taller: rechaza piezas vacías o desconocidas y genera la propuesta, incluso cuando es incorrecta', () => {
  assert.equal(reviewWorkshop('goedel', {}, 'consistent').status, 'incomplete');
  assert.equal(
    reviewWorkshop('proof', { quantifier: 'invalid', arguments: 'proofFirst' }, 'consistent')
      .status,
    'incomplete',
  );
  assert.equal(
    workshopFormula('proof', workshopTasks.proof.correct, 'PA'),
    'Prov_PA(x) ≡ ∃p.Proof_PA(p,x)',
  );
  assert.equal(
    workshopFormula('goedel', workshopTasks.goedel.correct, 'T'),
    'T ⊢ (G_T ↔ ¬Prov_T(⌜G_T⌝))',
  );
  assert.match(
    workshopFormula('goedel', { claim: 'provable', reference: 'other' }, 'PA'),
    /↔ Prov_PA\(⌜A⌝\)/,
  );
  assert.match(
    workshopFormula('second', { scope: 'other', conclusion: 'canProve' }, 'T'),
    /^T ⊢ Con\(U\)$/,
  );
});
