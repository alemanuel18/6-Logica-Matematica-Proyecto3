const key = (args) => JSON.stringify(args);

export const functionValue = (context, name, args) =>
  context.symbols.get(name).entries.get(key(args));
export const relationContains = (context, name, args) =>
  context.symbols.get(name).tuples.has(key(args));
