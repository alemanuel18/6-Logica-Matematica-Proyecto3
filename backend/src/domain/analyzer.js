import { ValidationError } from './errors.js';

export function analyze(ast, symbols) {
  const free = new Set();
  function term(node, bound) {
    const symbol = symbols.get(node.name);
    if (node.kind === 'call') {
      if (!symbol || symbol.kind !== 'function')
        throw new ValidationError(
          `«${node.name}» no es un símbolo funcional declarado.`,
          'formula',
        );
      if (node.args.length !== symbol.arity)
        throw new ValidationError(`«${node.name}» espera ${symbol.arity} argumentos.`, 'formula');
      node.args.forEach((arg) => term(arg, bound));
    } else if (symbol) {
      if (symbol.kind !== 'function' || symbol.arity !== 0)
        throw new ValidationError(`«${node.name}» no es una constante funcional.`, 'formula');
    } else if (!bound.has(node.name)) free.add(node.name);
  }
  function formula(node, bound) {
    switch (node.kind) {
      case 'predicate': {
        const symbol = symbols.get(node.name);
        if (!symbol || symbol.kind !== 'predicate')
          throw new ValidationError(`«${node.name}» no es un predicado declarado.`, 'formula');
        if (node.args.length !== symbol.arity)
          throw new ValidationError(`«${node.name}» espera ${symbol.arity} argumentos.`, 'formula');
        node.args.forEach((arg) => term(arg, bound));
        return;
      }
      case 'equality':
        term(node.left, bound);
        term(node.right, bound);
        return;
      case 'not':
        formula(node.child, bound);
        return;
      case 'binary':
        formula(node.left, bound);
        formula(node.right, bound);
        return;
      case 'quantifier': {
        if (symbols.has(node.variable))
          throw new ValidationError(
            `«${node.variable}» está declarado como símbolo y no puede ser variable.`,
            'formula',
          );
        formula(node.child, new Set([...bound, node.variable]));
      }
    }
  }
  formula(ast, new Set());
  return [...free].sort();
}
