import { ValidationError } from './errors.js';
import { identifier } from './syntax.js';

const key = (args) => JSON.stringify(args);
const tupleText = (args) => `(${args.join(', ')})`;

export function validateModel(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new ValidationError('Se requiere una interpretación.', 'model');
  const { domain, functions = [], predicates = [] } = input;
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
  if (!Array.isArray(functions) || !Array.isArray(predicates))
    throw new ValidationError('Las funciones y predicados deben ser listas.', 'symbols');
  const symbols = new Map();
  const register = (item, kind) => {
    if (
      !item ||
      !identifier.test(item.name ?? '') ||
      !Number.isInteger(item.arity) ||
      item.arity < 0
    ) {
      throw new ValidationError(
        `Nombre o aridad inválida para ${kind}. La aridad debe ser un entero no negativo.`,
        'symbols',
      );
    }
    if (symbols.has(item.name))
      throw new ValidationError(
        `El símbolo «${item.name}» está declarado más de una vez.`,
        'symbols',
      );
    symbols.set(item.name, { ...item, kind });
  };
  functions.forEach((x) => register(x, 'function'));
  predicates.forEach((x) => register(x, 'predicate'));
  const member = (value) => domain.includes(value);
  const validateTuple = (args, arity, field) => {
    if (!Array.isArray(args) || args.length !== arity || args.some((x) => !member(x))) {
      throw new ValidationError(
        `Tupla inválida en ${field}: se esperan ${arity} elementos del dominio.`,
        field,
      );
    }
  };
  for (const fn of functions) {
    if (!Array.isArray(fn.table) || !fn.table.length)
      throw new ValidationError(
        `La función «${fn.name}» requiere una tabla no vacía.`,
        `functions.${fn.name}`,
      );
    const entries = new Map();
    for (const row of fn.table) {
      validateTuple(row?.args, fn.arity, `functions.${fn.name}`);
      if (!member(row.value))
        throw new ValidationError(
          `El resultado de «${fn.name}» debe pertenecer al dominio.`,
          `functions.${fn.name}`,
        );
      if (entries.has(key(row.args)))
        throw new ValidationError(
          `Tupla repetida en «${fn.name}»: ${tupleText(row.args)}.`,
          `functions.${fn.name}`,
        );
      entries.set(key(row.args), row.value);
    }
    const expected = domain.length ** fn.arity;
    if (entries.size !== expected)
      throw new ValidationError(
        `La función «${fn.name}» requiere ${expected} asignaciones; se recibieron ${entries.size}.`,
        `functions.${fn.name}`,
      );
    symbols.get(fn.name).entries = entries;
  }
  for (const predicate of predicates) {
    if (!Array.isArray(predicate.tuples) || !predicate.tuples.length)
      throw new ValidationError(
        `El predicado «${predicate.name}» requiere una relación no vacía.`,
        `predicates.${predicate.name}`,
      );
    const tuples = new Set();
    for (const args of predicate.tuples) {
      validateTuple(args, predicate.arity, `predicates.${predicate.name}`);
      if (tuples.has(key(args)))
        throw new ValidationError(
          `Tupla repetida en «${predicate.name}»: ${tupleText(args)}.`,
          `predicates.${predicate.name}`,
        );
      tuples.add(key(args));
    }
    symbols.get(predicate.name).tuples = tuples;
  }
  return { domain, symbols };
}
