import { functionValue, relationContains } from '../repositories/interpretationRepository.js';

const tupleText = (args) => `(${args.join(', ')})`;

export function evaluateNode(node, context, environment) {
  const { domain, symbols } = context;
  const evaluateTerm = (term) => {
    const symbol = symbols.get(term.name);
    if (term.kind === 'name' && !symbol) return environment[term.name];
    const args = (term.args ?? []).map(evaluateTerm);
    return functionValue(context, term.name, args);
  };
  const result = (value, reason, details = {}) => ({ value, reason, ...details });
  switch (node.kind) {
    case 'predicate': {
      const args = node.args.map(evaluateTerm);
      const value = relationContains(context, node.name, args);
      return result(
        value,
        `La tupla ${tupleText(args)} ${value ? 'pertenece' : 'no pertenece'} a ${node.name}ᴵ.`,
      );
    }
    case 'equality': {
      const left = evaluateTerm(node.left);
      const right = evaluateTerm(node.right);
      return result(
        left === right,
        `${left} ${left === right ? '=' : '≠'} ${right} en el dominio.`,
      );
    }
    case 'not': {
      const child = evaluateNode(node.child, context, environment);
      return result(!child.value, `La negación invierte el valor: ${child.reason}`, {
        children: [child],
      });
    }
    case 'binary': {
      const left = evaluateNode(node.left, context, environment);
      const right = evaluateNode(node.right, context, environment);
      const value = {
        '∧': left.value && right.value,
        '∨': left.value || right.value,
        '→': !left.value || right.value,
        '↔': left.value === right.value,
      }[node.operator];
      const decisive =
        node.operator === '∧'
          ? value
            ? [left, right]
            : [left.value ? right : left]
          : node.operator === '∨'
            ? value
              ? [left.value ? left : right]
              : [left, right]
            : node.operator === '→'
              ? !left.value
                ? [left]
                : [left, right]
              : [left, right];
      return result(
        value,
        `${node.operator}: ${value ? 'se cumple' : 'no se cumple'} porque ${decisive.map((x) => x.reason).join(' ')}`,
        { children: decisive },
      );
    }
    case 'quantifier': {
      const checks = domain.map((value) => ({
        assignment: { [node.variable]: value },
        ...evaluateNode(node.child, context, { ...environment, [node.variable]: value }),
      }));
      const universal = node.quantifier === '∀';
      const value = universal ? checks.every((x) => x.value) : checks.some((x) => x.value);
      const decisive = universal ? checks.find((x) => !x.value) : checks.find((x) => x.value);
      if (decisive)
        return result(
          value,
          `${universal ? 'Contraejemplo' : 'Testigo'}: ${node.variable} = ${decisive.assignment[node.variable]}. ${decisive.reason}`,
          { evidence: 'decisive', checks: [decisive] },
        );
      return result(
        value,
        `Comprobación completa: ${checks.map((x) => `${node.variable} = ${x.assignment[node.variable]}: ${x.value ? 'Verdadero' : 'Falso'} (${x.reason})`).join('; ')}.`,
        { evidence: 'complete', checks },
      );
    }
  }
}
