import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, inspect } from './logic.js';

// Semilla fija: cualquier fallo se reproduce con el mismo número de caso.
const SEED = 0x5e4a2026;
let state = SEED;
function random() {
  state += 0x6d2b79f5;
  let value = state;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}
const integer = (limit) => Math.floor(random() * limit);
const pick = (values) => values[integer(values.length)];
const tupleKey = (tuple) => JSON.stringify(tuple);

function product(domain, arity) {
  let tuples = [[]];
  for (let index = 0; index < arity; index++) {
    tuples = tuples.flatMap((tuple) => domain.map((value) => [...tuple, value]));
  }
  return tuples;
}

function makeInterpretation() {
  const domain = Array.from({ length: 1 + integer(4) }, (_, index) => `d${index}`);
  const table = (arity) => product(domain, arity).map((args) => ({ args, value: pick(domain) }));
  const relation = (arity) => {
    const all = product(domain, arity);
    const selected = all.filter(() => random() < 0.45);
    return selected.length ? selected : [pick(all)];
  };
  return {
    domain,
    functions: [
      { name: 'c', arity: 0, table: table(0) },
      { name: 'f', arity: 1, table: table(1) },
      { name: 'g', arity: 2, table: table(2) },
    ],
    predicates: [
      { name: 'P', arity: 1, tuples: relation(1) },
      { name: 'R', arity: 2, tuples: relation(2) },
      { name: 'T', arity: 0, tuples: [[]] },
    ],
  };
}

function makeTerm(depth) {
  if (depth > 0 && random() < 0.42) {
    const name = pick(['f', 'g']);
    return {
      tag: 'function',
      name,
      args: Array.from({ length: name === 'f' ? 1 : 2 }, () => makeTerm(depth - 1)),
    };
  }
  return random() < 0.3 ? { tag: 'constant' } : { tag: 'variable', name: pick(['x', 'y', 'z']) };
}

function atom(kind = integer(4)) {
  if (kind === 0) return { tag: 'equality', left: makeTerm(2), right: makeTerm(2) };
  if (kind === 1) return { tag: 'predicate', name: 'P', args: [makeTerm(2)] };
  if (kind === 2) return { tag: 'predicate', name: 'R', args: [makeTerm(2), makeTerm(2)] };
  return { tag: 'predicate', name: 'T', args: [] };
}

function makeFormula(depth, mode = integer(10)) {
  if (depth === 0 || mode < 3) return atom(mode < 3 ? mode : undefined);
  if (mode === 3) return { tag: 'not', child: makeFormula(depth - 1) };
  if (mode < 8) {
    return {
      tag: 'binary',
      operator: ['∧', '∨', '→', '↔'][mode - 4],
      left: makeFormula(depth - 1),
      right: makeFormula(depth - 1),
    };
  }
  return {
    tag: 'quantifier',
    quantifier: mode === 8 ? '∀' : '∃',
    variable: pick(['x', 'y', 'z']),
    child: makeFormula(depth - 1),
  };
}

function termText(term, aliases) {
  if (term.tag === 'variable') return term.name;
  if (term.tag === 'constant') return aliases ? 'c()' : 'c';
  return `${term.name}(${term.args.map((arg) => termText(arg, aliases)).join(',')})`;
}

function formulaText(formula, aliases) {
  switch (formula.tag) {
    case 'predicate':
      return formula.args.length
        ? `${formula.name}(${formula.args.map((arg) => termText(arg, aliases)).join(',')})`
        : aliases
          ? 'T()'
          : 'T';
    case 'equality':
      return `${termText(formula.left, aliases)} = ${termText(formula.right, aliases)}`;
    case 'not':
      return `${aliases ? '!' : '¬'}(${formulaText(formula.child, aliases)})`;
    case 'binary': {
      const operator = aliases
        ? { '∧': '&', '∨': '|', '→': '->', '↔': '<->' }[formula.operator]
        : formula.operator;
      return `(${formulaText(formula.left, aliases)} ${operator} ${formulaText(formula.right, aliases)})`;
    }
    case 'quantifier':
      return `${formula.quantifier}${formula.variable}.(${formulaText(formula.child, aliases)})`;
  }
}

// Oráculo separado: consulta directamente las tablas de entrada y el árbol generado.
function referenceTerm(term, model, environment) {
  if (term.tag === 'variable') return environment[term.name];
  const name = term.tag === 'constant' ? 'c' : term.name;
  const args =
    term.tag === 'constant' ? [] : term.args.map((arg) => referenceTerm(arg, model, environment));
  return model.functions
    .find((symbol) => symbol.name === name)
    .table.find((row) => tupleKey(row.args) === tupleKey(args)).value;
}

function referenceFormula(formula, model, environment) {
  switch (formula.tag) {
    case 'predicate': {
      const args = formula.args.map((arg) => referenceTerm(arg, model, environment));
      return model.predicates
        .find((symbol) => symbol.name === formula.name)
        .tuples.some((tuple) => tupleKey(tuple) === tupleKey(args));
    }
    case 'equality':
      return (
        referenceTerm(formula.left, model, environment) ===
        referenceTerm(formula.right, model, environment)
      );
    case 'not':
      return !referenceFormula(formula.child, model, environment);
    case 'binary': {
      const left = referenceFormula(formula.left, model, environment);
      const right = referenceFormula(formula.right, model, environment);
      switch (formula.operator) {
        case '∧':
          return left && right;
        case '∨':
          return left || right;
        case '→':
          return !left || right;
        case '↔':
          return left === right;
      }
    }
    case 'quantifier': {
      const values = model.domain.map((value) =>
        referenceFormula(formula.child, model, { ...environment, [formula.variable]: value }),
      );
      return formula.quantifier === '∀' ? values.every(Boolean) : values.some(Boolean);
    }
  }
}

function freeVariables(formula, bound = new Set()) {
  const found = new Set();
  const term = (value) => {
    if (value.tag === 'variable' && !bound.has(value.name)) found.add(value.name);
    if (value.tag === 'function') value.args.forEach(term);
  };
  switch (formula.tag) {
    case 'predicate':
      formula.args.forEach(term);
      break;
    case 'equality':
      term(formula.left);
      term(formula.right);
      break;
    case 'not':
      return freeVariables(formula.child, bound);
    case 'binary': {
      freeVariables(formula.left, bound).forEach((value) => found.add(value));
      freeVariables(formula.right, bound).forEach((value) => found.add(value));
      break;
    }
    case 'quantifier':
      return freeVariables(formula.child, new Set([...bound, formula.variable]));
  }
  return [...found].sort();
}

const coverage = {
  domainSizes: new Set(),
  formulaKinds: new Set(),
  open: 0,
  closed: 0,
  quantifierOutcomes: new Set(),
};

for (let index = 0; index < 1000; index++) {
  const model = makeInterpretation();
  const mode = index % 10;
  let formula = makeFormula(1 + integer(3), mode);
  if (mode === 8 && index % 20 === 8)
    formula = {
      tag: 'quantifier',
      quantifier: '∀',
      variable: 'x',
      child: { tag: 'predicate', name: 'P', args: [{ tag: 'variable', name: 'x' }] },
    };
  if (mode === 9 && index % 20 === 9)
    formula = {
      tag: 'quantifier',
      quantifier: '∃',
      variable: 'x',
      child: {
        tag: 'predicate',
        name: 'R',
        args: [
          { tag: 'variable', name: 'x' },
          { tag: 'variable', name: 'y' },
        ],
      },
    };
  const environment = Object.fromEntries(
    ['x', 'y', 'z'].map((variable) => [variable, pick(model.domain)]),
  );
  const input = { ...model, formula: formulaText(formula, index % 2 === 0), environment };
  const expected = referenceFormula(formula, model, environment);
  const expectedFree = freeVariables(formula);
  coverage.domainSizes.add(model.domain.length);
  coverage.formulaKinds.add(
    formula.tag === 'binary'
      ? formula.operator
      : formula.tag === 'quantifier'
        ? formula.quantifier
        : formula.tag,
  );
  coverage[expectedFree.length ? 'open' : 'closed'] += 1;
  if (formula.tag === 'quantifier')
    coverage.quantifierOutcomes.add(`${formula.quantifier}:${expected}`);

  test(`interpretación y fórmula aleatoria ${String(index + 1).padStart(4, '0')}`, () => {
    const actual = evaluate(input);
    const context = `semilla=${SEED}, caso=${index + 1}, entrada=${JSON.stringify(input)}`;
    assert.equal(actual.truth, expected, context);
    assert.equal(actual.explanation.value, expected, context);
    assert.equal(actual.result, expected ? 'Verdadero' : 'Falso', context);
    assert.deepEqual(actual.freeVariables, expectedFree, context);
    assert.deepEqual(inspect(input).freeVariables, expectedFree, context);
    if (formula.tag === 'quantifier') {
      const checks = model.domain.map((value) =>
        referenceFormula(formula.child, model, { ...environment, [formula.variable]: value }),
      );
      const decisiveIndex = checks.findIndex((value) => value === (formula.quantifier === '∃'));
      assert.equal(
        actual.explanation.evidence,
        decisiveIndex < 0 ? 'complete' : 'decisive',
        context,
      );
      if (decisiveIndex < 0) {
        assert.deepEqual(
          actual.explanation.checks.map((check) => check.value),
          checks,
          context,
        );
      } else {
        assert.equal(
          actual.explanation.checks[0].assignment[formula.variable],
          model.domain[decisiveIndex],
          context,
        );
      }
    }
  });
}

test('la batería cubre dominios, fórmulas abiertas y cerradas y ambos resultados de cada cuantificador', () => {
  assert.deepEqual([...coverage.domainSizes].sort(), [1, 2, 3, 4]);
  assert.ok(coverage.open > 0 && coverage.closed > 0);
  assert.deepEqual([...coverage.quantifierOutcomes].sort(), [
    '∀:false',
    '∀:true',
    '∃:false',
    '∃:true',
  ]);
  for (const kind of ['equality', 'predicate', 'not', '∧', '∨', '→', '↔', '∀', '∃']) {
    assert.ok(coverage.formulaKinds.has(kind), `Falta cobertura de ${kind}`);
  }
});

const invalidCases = [
  {
    name: 'sintaxis incompleta',
    field: 'formula',
    change: (input) => ({ ...input, formula: 'P(x' }),
  },
  {
    name: 'predicado no declarado',
    field: 'formula',
    change: (input) => ({ ...input, formula: 'Q(x)' }),
  },
  {
    name: 'aridad de tupla incorrecta',
    field: 'predicates.P',
    change: (input) => ({
      ...input,
      predicates: input.predicates.map((symbol) =>
        symbol.name === 'P' ? { ...symbol, arity: 2 } : symbol,
      ),
    }),
  },
  {
    name: 'dominio duplicado',
    field: 'domain',
    change: (input) => ({ ...input, domain: [...input.domain, input.domain[0]] }),
  },
  {
    name: 'relación vacía',
    field: 'predicates.P',
    change: (input) => ({
      ...input,
      predicates: input.predicates.map((symbol) =>
        symbol.name === 'P' ? { ...symbol, tuples: [] } : symbol,
      ),
    }),
  },
  {
    name: 'función incompleta',
    field: 'functions.f',
    change: (input) => ({
      ...input,
      functions: input.functions.map((symbol) =>
        symbol.name === 'f' ? { ...symbol, table: symbol.table.slice(1) } : symbol,
      ),
    }),
  },
  {
    name: 'salida fuera del dominio',
    field: 'functions.c',
    change: (input) => ({
      ...input,
      functions: input.functions.map((symbol) =>
        symbol.name === 'c' ? { ...symbol, table: [{ args: [], value: 'fuera' }] } : symbol,
      ),
    }),
  },
  {
    name: 'tupla fuera del dominio',
    field: 'predicates.P',
    change: (input) => ({
      ...input,
      predicates: input.predicates.map((symbol) =>
        symbol.name === 'P' ? { ...symbol, tuples: [['fuera']] } : symbol,
      ),
    }),
  },
  {
    name: 'asignación faltante',
    field: 'environment.x',
    change: (input) => ({ ...input, environment: {} }),
  },
  {
    name: 'asignación fuera del dominio',
    field: 'environment.x',
    change: (input) => ({ ...input, environment: { x: 'fuera' } }),
  },
];

for (let index = 0; index < 100; index++) {
  const model = makeInterpretation();
  const invalidCase = invalidCases[index % invalidCases.length];
  const input = invalidCase.change({
    ...model,
    formula: 'P(x)',
    environment: { x: pick(model.domain) },
  });
  test(`entrada inválida ${String(index + 1).padStart(3, '0')}: ${invalidCase.name}`, () => {
    assert.throws(
      () => evaluate(input),
      (error) => error.name === 'ValidationError' && error.field === invalidCase.field,
      `semilla=${SEED}, caso inválido=${index + 1}, entrada=${JSON.stringify(input)}`,
    );
  });
}
