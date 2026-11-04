import { ValidationError } from '../domain/errors.js';

export function tupleOptions(domain, arities) {
  if (
    !Array.isArray(domain) ||
    !domain.length ||
    domain.some((x) => typeof x !== 'string' || !x.trim()) ||
    new Set(domain).size !== domain.length
  ) {
    throw new ValidationError(
      'El dominio debe contener elementos únicos, no vacíos y ser no vacío.',
      'domain',
    );
  }
  if (!Array.isArray(arities) || arities.some((x) => !Number.isInteger(x) || x < 0)) {
    throw new ValidationError('Las aridades deben ser enteros no negativos.', 'symbols');
  }
  const tuples = {};
  for (const arity of arities) {
    let options = [[]];
    for (let i = 0; i < arity; i++)
      options = options.flatMap((tuple) => domain.map((value) => [...tuple, value]));
    tuples[arity] = options;
  }
  return tuples;
}
