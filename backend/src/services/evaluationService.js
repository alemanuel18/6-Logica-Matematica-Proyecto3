import { ValidationError } from '../domain/errors.js';
import { evaluateNode } from '../domain/evaluator.js';
import { inspect } from './analysisService.js';

export function evaluate(input) {
  const { context, ast, freeVariables } = inspect(input);
  const environment = input.environment ?? {};
  if (typeof environment !== 'object' || Array.isArray(environment))
    throw new ValidationError('El entorno debe ser un objeto.', 'environment');
  for (const variable of freeVariables) {
    if (!Object.hasOwn(environment, variable))
      throw new ValidationError(
        `Falta asignar la variable libre «${variable}».`,
        `environment.${variable}`,
      );
    if (!context.domain.includes(environment[variable]))
      throw new ValidationError(
        `La asignación de «${variable}» no pertenece al dominio.`,
        `environment.${variable}`,
      );
  }
  const evaluation = evaluateNode(ast, context, environment);
  return {
    truth: evaluation.value,
    result: evaluation.value ? 'Verdadero' : 'Falso',
    freeVariables,
    explanation: evaluation,
  };
}
