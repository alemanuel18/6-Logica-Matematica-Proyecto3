import { parse } from '../domain/syntax.js';
import { validateModel } from '../domain/interpretation.js';
import { analyze } from '../domain/analyzer.js';

export function inspect(input) {
  const context = validateModel(input);
  const ast = parse(input.formula);
  const freeVariables = analyze(ast, context.symbols);
  return { context, ast, freeVariables };
}
