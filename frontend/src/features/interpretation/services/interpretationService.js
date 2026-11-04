export const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

export const aritiesFor = (functions, predicates) =>
  [
    ...new Set(
      [...functions, ...predicates].map((item) => (item.arity === '' ? null : Number(item.arity))),
    ),
  ].sort((a, b) => a - b);

export function buildInterpretation(domain, functions, predicates, tupleOptions) {
  return {
    domain,
    functions: functions.map((item) => ({
      name: item.name,
      arity: item.arity === '' ? null : Number(item.arity),
      table: (tupleOptions[item.arity] ?? []).map((args) => ({
        args,
        value: item.table?.[JSON.stringify(args)] ?? '',
      })),
    })),
    predicates: predicates.map((item) => ({
      name: item.name,
      arity: item.arity === '' ? null : Number(item.arity),
      tuples: (tupleOptions[item.arity] ?? []).filter(
        (args) => item.tuples?.[JSON.stringify(args)],
      ),
    })),
  };
}
