import { ValidationError } from './errors.js';

export const identifier = /^[A-Za-z_][A-Za-z_0-9]*$/;

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
  if (typeof source !== 'string' || !source.trim())
    throw new ValidationError('Ingresa una fórmula.');
  const tokens = tokenize(source);
  let index = 0;
  const current = () => tokens[index];
  const take = (value) => (current().value === value ? (index++, true) : false);
  const expect = (value) => {
    if (!take(value))
      throw new ValidationError(
        `Se esperaba «${value}» y se encontró «${current().value}».`,
        'formula',
        current().position,
      );
  };
  const name = () => {
    const token = current();
    if (!identifier.test(token.value))
      throw new ValidationError(
        `Se esperaba un identificador y se encontró «${token.value}».`,
        'formula',
        token.position,
      );
    index++;
    return token.value;
  };
  function term() {
    const value = name();
    if (!take('(')) return { kind: 'name', name: value };
    const args = [];
    if (!take(')')) {
      do {
        args.push(term());
      } while (take(','));
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
  if (current().value !== '<fin>')
    throw new ValidationError(
      `Token inesperado: «${current().value}».`,
      'formula',
      current().position,
    );
  return ast;
}
