import { useRef, useState } from 'react';

export function useFormulaController() {
  const [formula, setFormula] = useState('∃x.P(x)');
  const textarea = useRef(null);
  const insert = (symbol) => {
    const input = textarea.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    setFormula((current) => `${current.slice(0, start)}${symbol}${current.slice(end)}`);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + symbol.length, start + symbol.length);
    });
  };
  return { formula, setFormula, textarea, insert };
}
