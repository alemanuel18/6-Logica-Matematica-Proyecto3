export function formulaToSpeech(formula) {
  let text = formula
    .replace(/\bforall\b/gi, '∀')
    .replace(/\bexists\b/gi, '∃')
    .replace(/<->/g, '↔')
    .replace(/->/g, '→')
    .replace(/&&/g, '∧')
    .replace(/\|\|/g, '∨')
    .replace(/!/g, '¬')
    .replace(/&/g, '∧')
    .replace(/\|/g, '∨');

  text = text.replace(/[∀∃]\s*([A-Za-z_][A-Za-z_0-9]*)\s*\.?/g, (symbol, variable) =>
    symbol.startsWith('∀') ? `para todo ${variable}, ` : `existe un ${variable}, `,
  );

  const applicationPattern = /([A-Za-z_][A-Za-z_0-9]*)\s*\(([^()]*)\)/g;
  for (let index = 0; index <= formula.length && applicationPattern.test(text); index += 1) {
    applicationPattern.lastIndex = 0;
    text = text.replace(applicationPattern, (_, name, argumentsText) => {
      const args = argumentsText
        .split(',')
        .map((argument) => argument.trim())
        .filter(Boolean);
      return args.length ? `${name} aplicado a ${args.join(' y ')}` : name;
    });
  }

  return text
    .replace(/≠/g, ' es distinto de ')
    .replace(/(?<![<>!])=(?!=|>)/g, ' es igual a ')
    .replace(/¬/g, 'no ')
    .replace(/∧/g, ' y ')
    .replace(/∨/g, ' o ')
    .replace(/→/g, ' implica ')
    .replace(/↔/g, ' si y solo si ')
    .replace(/[().]/g, ' ')
    .replace(/,/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function explanationToSpeech(reason) {
  return reason
    .replace(/∀/g, ' para todo ')
    .replace(/∃/g, ' existe ')
    .replace(/∧/g, ' y ')
    .replace(/∨/g, ' o ')
    .replace(/→/g, ' implica ')
    .replace(/↔/g, ' si y solo si ')
    .replace(/≠/g, ' es distinto de ')
    .replace(/(?<![<>!])=(?!=|>)/g, ' es igual a ')
    .replace(/ᴵ/g, ' interpretado')
    .replace(/\s+/g, ' ')
    .trim();
}
