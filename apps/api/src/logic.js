export class ValidationError extends Error {
  constructor(message, field = 'formula', position = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.position = position;
  }
}

const identifier = /^[A-Za-z_][A-Za-z_0-9]*$/;
const key = args => JSON.stringify(args);
const tupleText = args => `(${args.join(', ')})`;

function tokenize(source) {
  const tokens = [];
  const pattern = /\s+|<->|->|[¬∧∨→↔∀∃()=.,!&|]|[A-Za-z_][A-Za-z_0-9]*|./gu;
  for (const match of source.matchAll(pattern)) {
    const raw = match[0];
    if (/^\s+$/u.test(raw)) continue;
    const aliases = { '!': '¬', '&': '∧', '|': '∨', '->': '→', '<->': '↔' };
    const value = aliases[raw] ?? raw;
    if (!identifier.test(value) && !'¬∧∨→↔∀∃()=.,'.includes(value)) {
      throw new ValidationError(`Símbolo no reconocido: ${raw}`, 'formula', match.index);
    }
    tokens.push({ value, position: match.index });
  }
  tokens.push({ value: '<fin>', position: source.length });
  return tokens;
}

export function parse(source) {
  if (typeof source !== 'string' || !source.trim()) throw new ValidationError('Ingresa una fórmula.');
  const tokens = tokenize(source);
  let index = 0;
  const current = () => tokens[index];
  const take = value => current().value === value ? (index++, true) : false;
  const expect = value => {
    if (!take(value)) throw new ValidationError(`Se esperaba «${value}» y se encontró «${current().value}».`, 'formula', current().position);
  };
  const name = () => {
    const token = current();
    if (!identifier.test(token.value)) throw new ValidationError(`Se esperaba un identificador y se encontró «${token.value}».`, 'formula', token.position);
    index++;
    return token.value;
  };
  function term() {
    const value = name();
    if (!take('(')) return { kind: 'name', name: value };
    const args = [];
    if (!take(')')) {
      do { args.push(term()); } while (take(','));
      expect(')');
    }
    return { kind: 'call', name: value, args };
  }
  function atom() {
    if (take('(')) {
      const expression = equivalence();
      expect(')');
      return expression;
    }
    const left = term();
    if (take('=')) return { kind: 'equality', left, right: term() };
    return { kind: 'predicate', name: left.name, args: left.args ?? [] };
  }
  function unary() {
    if (take('¬')) return { kind: 'not', child: unary() };
    if (take('∀') || take('∃')) {
      const quantifier = tokens[index - 1].value;
      const variable = name();
      take('.');
      return { kind: 'quantifier', quantifier, variable, child: unary() };
    }
    return atom();
  }
  function conjunction() {
    let left = unary();
    while (take('∧')) left = { kind: 'binary', operator: '∧', left, right: unary() };
    return left;
  }
  function disjunction() {
    let left = conjunction();
    while (take('∨')) left = { kind: 'binary', operator: '∨', left, right: conjunction() };
    return left;
  }
  function implication() {
    const left = disjunction();
    return take('→') ? { kind: 'binary', operator: '→', left, right: implication() } : left;
  }
  function equivalence() {
    let left = implication();
    while (take('↔')) left = { kind: 'binary', operator: '↔', left, right: implication() };
    return left;
  }
  const ast = equivalence();
  if (current().value !== '<fin>') throw new ValidationError(`Token inesperado: «${current().value}».`, 'formula', current().position);
  return ast;
}

function validateModel(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ValidationError('Se requiere una interpretación.', 'model');
  const { domain, functions = [], predicates = [] } = input;
  if (!Array.isArray(domain) || !domain.length || domain.some(x => typeof x !== 'string' || !x.trim()) || new Set(domain).size !== domain.length) {
    throw new ValidationError('El dominio debe contener elementos únicos, no vacíos y ser no vacío.', 'domain');
  }
  if (!Array.isArray(functions) || !Array.isArray(predicates)) throw new ValidationError('Las funciones y predicados deben ser listas.', 'symbols');
  const symbols = new Map();
  const register = (item, kind) => {
    if (!item || !identifier.test(item.name ?? '') || !Number.isInteger(item.arity) || item.arity < 0) {
      throw new ValidationError(`Nombre o aridad inválida para ${kind}. La aridad debe ser un entero no negativo.`, 'symbols');
    }
    if (symbols.has(item.name)) throw new ValidationError(`El símbolo «${item.name}» está declarado más de una vez.`, 'symbols');
    symbols.set(item.name, { ...item, kind });
  };
  functions.forEach(x => register(x, 'function'));
  predicates.forEach(x => register(x, 'predicate'));
  const member = value => domain.includes(value);
  const validateTuple = (args, arity, field) => {
    if (!Array.isArray(args) || args.length !== arity || args.some(x => !member(x))) {
      throw new ValidationError(`Tupla inválida en ${field}: se esperan ${arity} elementos del dominio.`, field);
    }
  };
  for (const fn of functions) {
    if (!Array.isArray(fn.table) || !fn.table.length) throw new ValidationError(`La función «${fn.name}» requiere una tabla no vacía.`, `functions.${fn.name}`);
    const entries = new Map();
    for (const row of fn.table) {
      validateTuple(row?.args, fn.arity, `functions.${fn.name}`);
      if (!member(row.value)) throw new ValidationError(`El resultado de «${fn.name}» debe pertenecer al dominio.`, `functions.${fn.name}`);
      if (entries.has(key(row.args))) throw new ValidationError(`Tupla repetida en «${fn.name}»: ${tupleText(row.args)}.`, `functions.${fn.name}`);
      entries.set(key(row.args), row.value);
    }
    const expected = domain.length ** fn.arity;
    if (entries.size !== expected) throw new ValidationError(`La función «${fn.name}» requiere ${expected} asignaciones; se recibieron ${entries.size}.`, `functions.${fn.name}`);
    symbols.get(fn.name).entries = entries;
  }
  for (const predicate of predicates) {
    if (!Array.isArray(predicate.tuples) || !predicate.tuples.length) throw new ValidationError(`El predicado «${predicate.name}» requiere una relación no vacía.`, `predicates.${predicate.name}`);
    const tuples = new Set();
    for (const args of predicate.tuples) {
      validateTuple(args, predicate.arity, `predicates.${predicate.name}`);
      if (tuples.has(key(args))) throw new ValidationError(`Tupla repetida en «${predicate.name}»: ${tupleText(args)}.`, `predicates.${predicate.name}`);
      tuples.add(key(args));
    }
    symbols.get(predicate.name).tuples = tuples;
  }
  return { domain, symbols };
}

function analyze(ast, symbols) {
  const free = new Set();
  function term(node, bound) {
    const symbol = symbols.get(node.name);
    if (node.kind === 'call') {
      if (!symbol || symbol.kind !== 'function') throw new ValidationError(`«${node.name}» no es un símbolo funcional declarado.`, 'formula');
      if (node.args.length !== symbol.arity) throw new ValidationError(`«${node.name}» espera ${symbol.arity} argumentos.`, 'formula');
      node.args.forEach(arg => term(arg, bound));
    } else if (symbol) {
      if (symbol.kind !== 'function' || symbol.arity !== 0) throw new ValidationError(`«${node.name}» no es una constante funcional.`, 'formula');
    } else if (!bound.has(node.name)) free.add(node.name);
  }
  function formula(node, bound) {
    switch (node.kind) {
      case 'predicate': {
        const symbol = symbols.get(node.name);
        if (!symbol || symbol.kind !== 'predicate') throw new ValidationError(`«${node.name}» no es un predicado declarado.`, 'formula');
        if (node.args.length !== symbol.arity) throw new ValidationError(`«${node.name}» espera ${symbol.arity} argumentos.`, 'formula');
        node.args.forEach(arg => term(arg, bound));
        return;
      }
      case 'equality': term(node.left, bound); term(node.right, bound); return;
      case 'not': formula(node.child, bound); return;
      case 'binary': formula(node.left, bound); formula(node.right, bound); return;
      case 'quantifier': {
        if (symbols.has(node.variable)) throw new ValidationError(`«${node.variable}» está declarado como símbolo y no puede ser variable.`, 'formula');
        formula(node.child, new Set([...bound, node.variable]));
      }
    }
  }
  formula(ast, new Set());
  return [...free].sort();
}

function evaluateNode(node, context, environment) {
  const { domain, symbols } = context;
  const evaluateTerm = term => {
    const symbol = symbols.get(term.name);
    if (term.kind === 'name' && !symbol) return environment[term.name];
    const args = (term.args ?? []).map(evaluateTerm);
    return symbol.entries.get(key(args));
  };
  const result = (value, reason, details = {}) => ({ value, reason, ...details });
  switch (node.kind) {
    case 'predicate': {
      const args = node.args.map(evaluateTerm);
      const value = symbols.get(node.name).tuples.has(key(args));
      return result(value, `La tupla ${tupleText(args)} ${value ? 'pertenece' : 'no pertenece'} a ${node.name}ᴵ.`);
    }
    case 'equality': {
      const left = evaluateTerm(node.left);
      const right = evaluateTerm(node.right);
      return result(left === right, `${left} ${left === right ? '=' : '≠'} ${right} en el dominio.`);
    }
    case 'not': {
      const child = evaluateNode(node.child, context, environment);
      return result(!child.value, `La negación invierte el valor: ${child.reason}`, { children: [child] });
    }
    case 'binary': {
      const left = evaluateNode(node.left, context, environment);
      const right = evaluateNode(node.right, context, environment);
      const value = { '∧': left.value && right.value, '∨': left.value || right.value, '→': !left.value || right.value, '↔': left.value === right.value }[node.operator];
      const decisive = node.operator === '∧' ? (value ? [left, right] : [left.value ? right : left])
        : node.operator === '∨' ? (value ? [left.value ? left : right] : [left, right])
        : node.operator === '→' ? (!left.value ? [left] : [left, right]) : [left, right];
      return result(value, `${node.operator}: ${value ? 'se cumple' : 'no se cumple'} porque ${decisive.map(x => x.reason).join(' ')}`, { children: decisive });
    }
    case 'quantifier': {
      const checks = domain.map(value => ({ assignment: { [node.variable]: value }, ...evaluateNode(node.child, context, { ...environment, [node.variable]: value }) }));
      const universal = node.quantifier === '∀';
      const value = universal ? checks.every(x => x.value) : checks.some(x => x.value);
      const decisive = universal ? checks.find(x => !x.value) : checks.find(x => x.value);
      if (decisive) return result(value, `${universal ? 'Contraejemplo' : 'Testigo'}: ${node.variable} = ${decisive.assignment[node.variable]}. ${decisive.reason}`, { evidence: 'decisive', checks: [decisive] });
      return result(value, `Comprobación completa: ${checks.map(x => `${node.variable} = ${x.assignment[node.variable]}: ${x.value ? 'Verdadero' : 'Falso'} (${x.reason})`).join('; ')}.`, { evidence: 'complete', checks });
    }
  }
}

export function inspect(input) {
  const context = validateModel(input);
  const ast = parse(input.formula);
  const freeVariables = analyze(ast, context.symbols);
  return { context, ast, freeVariables };
}

export function evaluate(input) {
  const { context, ast, freeVariables } = inspect(input);
  const environment = input.environment ?? {};
  if (typeof environment !== 'object' || Array.isArray(environment)) throw new ValidationError('El entorno debe ser un objeto.', 'environment');
  for (const variable of freeVariables) {
    if (!Object.hasOwn(environment, variable)) throw new ValidationError(`Falta asignar la variable libre «${variable}».`, `environment.${variable}`);
    if (!context.domain.includes(environment[variable])) throw new ValidationError(`La asignación de «${variable}» no pertenece al dominio.`, `environment.${variable}`);
  }
  const evaluation = evaluateNode(ast, context, environment);
  return { truth: evaluation.value, result: evaluation.value ? 'Verdadero' : 'Falso', freeVariables, explanation: evaluation };
}
