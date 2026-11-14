import { ValidationError } from './errors.js';

const fail = (message) => {
  throw new ValidationError(message);
};
const variablePattern = /^[a-z][a-z0-9_]*$/;
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const binary = (op, left, right) => ({ op, left, right });
const quantify = (op, variable, body) => ({ op, variable, body });
const zero = { op: '0' };
const successor = (arg) => ({ op: 'S', arg });

// PA has its own signature and parser: the finite-model language is unchanged.
export function parsePA(source, termOnly = false) {
  if (typeof source !== 'string' || !source.trim()) fail('Escribe una fórmula o término.');
  if (source.length > 2000) fail('El límite es de 2000 caracteres.');
  const aliases = { '->': '→', '<->': '↔', '!': '¬', '&': '∧', '|': '∨', '!=': '≠', '·': '*' };
  const tokens = [...source.matchAll(/\s+|<->|->|!=|[a-z][a-z0-9_]*|\d+|./gu)]
    .filter(([s]) => !/^\s+$/u.test(s))
    .map(([s]) => aliases[s] ?? s);
  if (tokens.length > 350) fail('La expresión admite como máximo 350 símbolos.');
  tokens.push('<fin>');
  let i = 0;
  const take = (s) => (tokens[i] === s ? (i++, true) : false);
  const expect = (s) => {
    if (!take(s)) fail(`Se esperaba «${s}»; se encontró «${tokens[i]}».`);
  };
  function atomTerm() {
    if (take('S')) {
      expect('(');
      const t = term();
      expect(')');
      return successor(t);
    }
    if (take('(')) {
      const t = term();
      expect(')');
      return t;
    }
    const value = tokens[i++];
    if (/^\d+$/.test(value)) {
      if (Number(value) > 50) fail('Usa numerales entre 0 y 50 (abreviaturas de sucesores).');
      let t = zero;
      for (let n = 0; n < Number(value); n++) t = successor(t);
      return t;
    }
    if (variablePattern.test(value) && value !== '<fin>') return { op: 'var', name: value };
    fail(`Término inválido: «${value}». Usa 0, variables, S(t), + y *.`);
  }
  function product() {
    let t = atomTerm();
    while (take('*')) t = binary('*', t, atomTerm());
    return t;
  }
  function term() {
    let t = product();
    while (take('+')) t = binary('+', t, product());
    return t;
  }
  function unary() {
    if (take('¬')) return { op: '¬', arg: unary() };
    if (tokens[i] === '∀' || tokens[i] === '∃') {
      const op = tokens[i++],
        variable = tokens[i++];
      if (!variablePattern.test(variable))
        fail('El cuantificador necesita una variable minúscula.');
      take('.');
      return quantify(op, variable, unary());
    }
    // Parentheses can enclose either a term or a formula.
    const saved = i;
    try {
      const left = term();
      const op = tokens[i++];
      if (!['=', '≠'].includes(op)) fail('Se esperaba una igualdad.');
      const equality = binary('=', left, term());
      return op === '=' ? equality : { op: '¬', arg: equality };
    } catch (error) {
      i = saved;
      if (!take('(')) throw error;
      const f = formula();
      expect(')');
      return f;
    }
  }
  function and() {
    let f = unary();
    while (take('∧')) f = binary('∧', f, unary());
    return f;
  }
  function or() {
    let f = and();
    while (take('∨')) f = binary('∨', f, and());
    return f;
  }
  function implies() {
    const f = or();
    return take('→') ? binary('→', f, implies()) : f;
  }
  function formula() {
    let f = implies();
    while (take('↔')) f = binary('↔', f, implies());
    return f;
  }
  const ast = termOnly ? term() : formula();
  if (tokens[i] !== '<fin>') fail(`Símbolo inesperado: «${tokens[i]}».`);
  return ast;
}

export function printPA(n) {
  if (n.op === 'var') return n.name;
  if (n.op === '0') return '0';
  if (n.op === 'S' || n.op === '¬') return `${n.op}(${printPA(n.arg)})`;
  if (n.body) return `${n.op}${n.variable}.(${printPA(n.body)})`;
  return `(${printPA(n.left)}${n.op}${printPA(n.right)})`;
}

export function freePA(n, bound = new Set(), result = new Set()) {
  if (n.op === 'var' && !bound.has(n.name)) result.add(n.name);
  if (n.body) freePA(n.body, new Set([...bound, n.variable]), result);
  if (n.arg) freePA(n.arg, bound, result);
  if (n.left) {
    freePA(n.left, bound, result);
    freePA(n.right, bound, result);
  }
  return [...result].sort();
}

function substitute(n, variable, replacement) {
  if (n.op === 'var') return n.name === variable ? replacement : n;
  if (n.body) {
    if (n.variable === variable) return n;
    if (freePA(n.body).includes(variable) && freePA(replacement).includes(n.variable))
      fail(`Sustitución con captura de «${n.variable}». Renombra la variable ligada.`);
    return { ...n, body: substitute(n.body, variable, replacement) };
  }
  if (n.arg) return { ...n, arg: substitute(n.arg, variable, replacement) };
  if (n.left)
    return {
      ...n,
      left: substitute(n.left, variable, replacement),
      right: substitute(n.right, variable, replacement),
    };
  return n;
}

export const PA_AXIOMS = [
  { id: 'P1', title: 'Cero no es sucesor', formula: '∀x.¬(S(x)=0)' },
  { id: 'P2', title: 'Sucesor inyectivo', formula: '∀x.∀y.(S(x)=S(y)→x=y)' },
  { id: 'P3', title: 'Suma con cero', formula: '∀x.(x+0=x)' },
  { id: 'P4', title: 'Suma con sucesor', formula: '∀x.∀y.(x+S(y)=S(x+y))' },
  { id: 'P5', title: 'Producto con cero', formula: '∀x.(x*0=0)' },
  { id: 'P6', title: 'Producto con sucesor', formula: '∀x.∀y.(x*S(y)=x*y+x)' },
];

export function inductionPA(body, variable) {
  if (typeof variable !== 'string' || !variablePattern.test(variable))
    fail('Variable de inducción inválida.');
  const phi = parsePA(body);
  let axiom = binary(
    '→',
    binary(
      '∧',
      substitute(phi, variable, zero),
      quantify(
        '∀',
        variable,
        binary('→', phi, substitute(phi, variable, successor({ op: 'var', name: variable }))),
      ),
    ),
    quantify('∀', variable, phi),
  );
  // Universally close the parameters of the schema instance.
  for (const parameter of freePA(axiom).reverse()) axiom = quantify('∀', parameter, axiom);
  return axiom;
}

export function checkProof(steps) {
  if (!Array.isArray(steps) || !steps.length || steps.length > 100)
    fail('Incluye entre 1 y 100 pasos.');
  const checked = [];
  const results = steps.map((step, index) => {
    try {
      if (!step || typeof step !== 'object') fail('Paso inválido.');
      const target = parsePA(step.formula);
      const reference = (slot) => {
        const number = step.refs?.[slot];
        if (!Number.isInteger(number) || number < 1 || number > index || !checked[number - 1])
          fail('La referencia debe ser un paso anterior válido.');
        return checked[number - 1];
      };
      let expected;
      switch (step.rule) {
        case 'axiom': {
          const axiom = PA_AXIOMS.find((a) => a.id === step.axiom);
          if (!axiom) fail('Selecciona un axioma P1–P6.');
          expected = parsePA(axiom.formula);
          break;
        }
        case 'induction':
          expected = inductionPA(step.body, step.variable);
          break;
        case 'forallElim': {
          const source = reference(0);
          if (source.op !== '∀') fail('La referencia debe comenzar por ∀.');
          expected = substitute(source.body, source.variable, parsePA(step.term, true));
          break;
        }
        case 'forallIntro': {
          if (!variablePattern.test(step.variable ?? '')) fail('Variable inválida.');
          expected = quantify('∀', step.variable, reference(0));
          break;
        }
        case 'mp': {
          const implication = reference(0),
            premise = reference(1);
          if (implication.op !== '→' || !eq(implication.left, premise))
            fail('Usa A→B como primera referencia y A como segunda.');
          expected = implication.right;
          break;
        }
        case 'refl': {
          const t = parsePA(step.term, true);
          expected = binary('=', t, t);
          break;
        }
        case 'sym': {
          const a = reference(0);
          if (a.op !== '=') fail('Se requiere una igualdad.');
          expected = binary('=', a.right, a.left);
          break;
        }
        case 'trans': {
          const a = reference(0),
            b = reference(1);
          if (a.op !== '=' || b.op !== '=' || !eq(a.right, b.left))
            fail('Se requiere a=b y b=c, en ese orden.');
          expected = binary('=', a.left, b.right);
          break;
        }
        case 'successor': {
          const a = reference(0);
          if (a.op !== '=') fail('Se requiere una igualdad.');
          expected = binary('=', successor(a.left), successor(a.right));
          break;
        }
        case 'congruence': {
          const a = reference(0),
            b = reference(1);
          if (!['+', '*'].includes(step.operator) || a.op !== '=' || b.op !== '=')
            fail('La congruencia requiere dos igualdades y el operador + o *.');
          expected = binary(
            '=',
            binary(step.operator, a.left, b.left),
            binary(step.operator, a.right, b.right),
          );
          break;
        }
        case 'existsIntro': {
          if (target.op !== '∃') fail('La conclusión debe comenzar por ∃.');
          const instance = substitute(target.body, target.variable, parsePA(step.term, true));
          if (!eq(reference(0), instance))
            fail('La referencia no coincide con la instancia del testigo.');
          expected = target;
          break;
        }
        case 'andIntro':
          expected = binary('∧', reference(0), reference(1));
          break;
        case 'andLeft':
        case 'andRight': {
          const a = reference(0);
          if (a.op !== '∧') fail('Se requiere una conjunción.');
          expected = step.rule === 'andLeft' ? a.left : a.right;
          break;
        }
        default:
          fail('Regla no reconocida.');
      }
      if (!eq(target, expected)) fail(`La regla produce: ${printPA(expected)}`);
      checked.push(target);
      return { valid: true, formula: printPA(target) };
    } catch (error) {
      if (!(error instanceof ValidationError)) throw error;
      checked.push(null);
      return { valid: false, error: error.message };
    }
  });
  return { valid: results.every((s) => s.valid), steps: results };
}

// Goal-directed, bounded proof construction. Every successful result is replayed
// through the same checker used by the manual workspace, never trusted as a verdict.
export function provePA(formula, maxSteps = 100) {
  const goal = parsePA(formula);
  if (!Number.isInteger(maxSteps) || maxSteps < 10 || maxSteps > 100)
    fail('El límite de búsqueda debe estar entre 10 y 100 pasos.');
  const steps = [],
    known = new Map(),
    normalized = new Map();
  let operations = 0;
  class SearchStopped extends Error {}
  const stop = (reason) => {
    throw new SearchStopped(reason);
  };
  const tick = () => {
    if (++operations > 2000) stop('limit');
  };
  const emit = (ast, rule, fields = {}) => {
    tick();
    const text = printPA(ast);
    if (known.has(text)) return known.get(text);
    if (steps.length >= maxSteps) stop('limit');
    // Intermediate steps obey the exact same syntax limits as manual input.
    try {
      parsePA(text);
    } catch (error) {
      if (!(error instanceof ValidationError)) throw error;
      stop('limit');
    }
    steps.push({ formula: text, rule, refs: [], ...fields });
    known.set(text, steps.length);
    return steps.length;
  };
  const equality = (a, b, rule, fields) => emit(binary('=', a, b), rule, fields);
  const reflexivity = (a) => equality(a, a, 'refl', { term: printPA(a) });
  function instance(id, terms) {
    const axiom = PA_AXIOMS.find((a) => a.id === id);
    let ast = parsePA(axiom.formula),
      ref = emit(ast, 'axiom', { axiom: id });
    for (const term of terms) {
      try {
        ast = substitute(ast.body, ast.variable, term);
      } catch (error) {
        if (!(error instanceof ValidationError)) throw error;
        stop('unsupported');
      }
      ref = emit(ast, 'forallElim', { refs: [ref], term: printPA(term) });
    }
    return ref;
  }
  function normalize(term, depth = 0) {
    tick();
    if (depth > 60) stop('limit');
    const key = printPA(term);
    if (normalized.has(key)) return normalized.get(key);
    let result;
    if (term.op === '0' || term.op === 'var') result = { value: term, ref: reflexivity(term) };
    else if (term.op === 'S') {
      const arg = normalize(term.arg, depth + 1),
        value = successor(arg.value);
      result = { value, ref: equality(term, value, 'successor', { refs: [arg.ref] }) };
    } else {
      const left = normalize(term.left, depth + 1),
        right = normalize(term.right, depth + 1);
      const current = binary(term.op, left.value, right.value);
      let ref = equality(term, current, 'congruence', {
        operator: term.op,
        refs: [left.ref, right.ref],
      });
      let value = current;
      if (right.value.op === '0') {
        value = term.op === '+' ? left.value : zero;
        const reduction = instance(term.op === '+' ? 'P3' : 'P5', [left.value]);
        ref = equality(term, value, 'trans', { refs: [ref, reduction] });
      } else if (right.value.op === 'S') {
        const expanded =
          term.op === '+'
            ? successor(binary('+', left.value, right.value.arg))
            : binary('+', binary('*', left.value, right.value.arg), left.value);
        const reduction = instance(term.op === '+' ? 'P4' : 'P6', [left.value, right.value.arg]);
        const reduced = normalize(expanded, depth + 1);
        const intermediate = equality(current, reduced.value, 'trans', {
          refs: [reduction, reduced.ref],
        });
        value = reduced.value;
        ref = equality(term, value, 'trans', { refs: [ref, intermediate] });
      }
      result = { value, ref };
    }
    normalized.set(key, result);
    return result;
  }
  function prove(target, depth = 0) {
    tick();
    if (depth > 30) stop('limit');
    const text = printPA(target);
    if (known.has(text)) return known.get(text);
    for (const axiom of PA_AXIOMS)
      if (eq(parsePA(axiom.formula), target)) return emit(target, 'axiom', { axiom: axiom.id });
    // Recognize universal axiom instances, including successor nonzeroness
    // and injectivity; substitutions are still checked for variable capture.
    for (const axiom of PA_AXIOMS) {
      let pattern = parsePA(axiom.formula);
      const variables = [],
        bindings = new Map();
      while (pattern.op === '∀') {
        variables.push(pattern.variable);
        pattern = pattern.body;
      }
      function match(a, b) {
        if (a.op === 'var' && variables.includes(a.name)) {
          if (bindings.has(a.name)) return eq(bindings.get(a.name), b);
          bindings.set(a.name, b);
          return true;
        }
        if (a.op !== b.op) return false;
        if (a.arg) return match(a.arg, b.arg);
        if (a.left) return match(a.left, b.left) && match(a.right, b.right);
        return eq(a, b);
      }
      if (match(pattern, target) && variables.every((v) => bindings.has(v)))
        return instance(
          axiom.id,
          variables.map((v) => bindings.get(v)),
        );
    }
    if (target.op === '∀') {
      const ref = prove(target.body, depth + 1);
      return emit(target, 'forallIntro', { refs: [ref], variable: target.variable });
    }
    if (target.op === '∧') {
      const a = prove(target.left, depth + 1),
        b = prove(target.right, depth + 1);
      return emit(target, 'andIntro', { refs: [a, b] });
    }
    if (target.op === '∃') {
      // Failed witness attempts have separate budgets/state; no failed derivation
      // can contaminate a subsequent witness or exceed the global work cap.
      for (let n = 0; n <= 5; n++) {
        const checkpoint = steps.length;
        const term = parsePA(String(n), true);
        try {
          const ref = prove(substitute(target.body, target.variable, term), depth + 1);
          return emit(target, 'existsIntro', { refs: [ref], term: printPA(term) });
        } catch (error) {
          if (!(error instanceof SearchStopped) && !(error instanceof ValidationError)) throw error;
          if (error.message === 'limit') throw error;
          steps.length = checkpoint;
          known.clear();
          normalized.clear();
          steps.forEach((step, i) => known.set(step.formula, i + 1));
        }
      }
      stop('unsupported');
    }
    if (target.op === '=') {
      if (eq(target.left, target.right)) return reflexivity(target.left);
      const left = normalize(target.left),
        right = normalize(target.right);
      if (!eq(left.value, right.value)) stop('normalFormsDiffer');
      const reverse = equality(right.value, target.right, 'sym', { refs: [right.ref] });
      return emit(target, 'trans', { refs: [left.ref, reverse] });
    }
    stop('unsupported');
  }
  try {
    const last = prove(goal);
    // Remove unused branches, renumber references and put the requested goal last.
    const certificate = [],
      translated = new Map();
    function visit(ref) {
      if (translated.has(ref)) return translated.get(ref);
      const step = steps[ref - 1],
        refs = step.refs.map(visit);
      certificate.push({ ...step, refs });
      translated.set(ref, certificate.length);
      return certificate.length;
    }
    visit(last);
    if (!checkProof(certificate).valid)
      throw new Error('El certificado automático no superó la comprobación.');
    return { status: 'proved', formula: printPA(goal), steps: certificate, maxSteps };
  } catch (error) {
    if (!(error instanceof SearchStopped)) throw error;
    return {
      status: 'notFound',
      formula: printPA(goal),
      steps: [],
      reason: error.message,
      maxSteps,
      message:
        'No se encontró una demostración con estas estrategias y límites. Esto no implica que la fórmula sea falsa ni indemostrable en PA.',
    };
  }
}

// Fixed positive symbol codes; variables are indexed by an injective base-38 encoding.
const symbols = ['0', 'S', '+', '*', '=', '¬', '∧', '∨', '→', '↔', '∀', '∃', '(', ')', '.'];
const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789_';
function symbolCode(token) {
  if (symbols.includes(token)) return BigInt(symbols.indexOf(token) + 1);
  let n = 0n;
  for (const c of token) n = n * 38n + BigInt(alphabet.indexOf(c) + 1);
  return 16n + n;
}
function fromCode(code) {
  if (code <= 15n) return symbols[Number(code) - 1];
  let n = code - 16n,
    token = '';
  while (n > 0n) {
    const digit = Number(n % 38n);
    if (!digit || digit > alphabet.length) fail('Código de variable inválido.');
    token = alphabet[digit - 1] + token;
    n /= 38n;
  }
  if (!variablePattern.test(token) || symbolCode(token) !== code)
    fail('Código de símbolo inválido.');
  return token;
}
function primes(count) {
  const list = [];
  for (let n = 2; list.length < count; n++)
    if (list.every((p) => p * p > n || n % p !== 0)) list.push(n);
  return list;
}
export function encodeGodel(formula) {
  const canonical = printPA(parsePA(formula));
  const tokens = canonical.match(/[a-z][a-z0-9_]*|./gu);
  const bases = primes(tokens.length);
  const factors = tokens.map((token, i) => ({
    token,
    prime: bases[i],
    exponent: symbolCode(token).toString(),
  }));
  // Always provide the exact factorization, even when expanding the integer is impractical.
  const bits = factors.reduce((n, f) => n + Number(f.exponent) * Math.log2(f.prime), 0);
  let number = null;
  if (bits <= 12000)
    number = factors.reduce((n, f) => n * BigInt(f.prime) ** BigInt(f.exponent), 1n).toString();
  return { canonical, factors, number, expanded: number !== null };
}
export function decodeGodel(value) {
  if (typeof value !== 'string' || !/^[1-9]\d{0,3999}$/.test(value))
    fail('Ingresa un entero positivo de hasta 4000 cifras.');
  let remaining = BigInt(value);
  const tokens = [],
    bases = primes(350);
  for (const prime of bases) {
    if (remaining === 1n) break;
    let exponent = 0n;
    while (remaining % BigInt(prime) === 0n) {
      remaining /= BigInt(prime);
      exponent++;
    }
    if (!exponent) fail('No es una codificación válida: falta un primo consecutivo.');
    tokens.push(fromCode(exponent));
  }
  if (remaining !== 1n || !tokens.length) fail('La codificación supera el límite o está vacía.');
  const formula = tokens.join('');
  const canonical = printPA(parsePA(formula));
  if (canonical !== formula) fail('El número no codifica una fórmula canónica de este convenio.');
  return { formula };
}

export function peanoAction(input) {
  if (!input || typeof input !== 'object') fail('Solicitud inválida.');
  switch (input.action) {
    case 'analyze': {
      const ast = parsePA(input.formula);
      return { canonical: printPA(ast), freeVariables: freePA(ast) };
    }
    case 'induction':
      return { formula: printPA(inductionPA(input.body, input.variable)) };
    case 'proof':
      return checkProof(input.steps);
    case 'prove':
      return provePA(input.formula, input.maxSteps);
    case 'encode':
      return encodeGodel(input.formula);
    case 'decode':
      return decodeGodel(input.number);
    default:
      fail('Acción de Peano no reconocida.');
  }
}
