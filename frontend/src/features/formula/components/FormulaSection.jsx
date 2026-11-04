const buttons = ['¬', '∧', '∨', '→', '↔', '∀', '∃', '(', ')', '='];

export function FormulaSection({ formula, setFormula, textarea, insert }) {
  return (
    <section className="card formula-card">
      <span className="eyebrow">03 · Expresión</span>
      <h2>Fórmula</h2>
      <p className="hint">
        Usa los botones o escribe con el teclado. Agrupa con paréntesis el alcance de cada
        cuantificador.
      </p>
      <div className="symbol-buttons" aria-label="Símbolos lógicos">
        {buttons.map((symbol) => (
          <button
            key={symbol}
            type="button"
            onClick={() => insert(symbol)}
            aria-label={`Insertar ${symbol}`}
          >
            {symbol}
          </button>
        ))}
      </div>
      <label className="field-label" htmlFor="formula">
        Expresión lógica
      </label>
      <textarea
        ref={textarea}
        id="formula"
        className="formula-input"
        spellCheck="false"
        value={formula}
        onChange={(event) => setFormula(event.target.value)}
        placeholder="∀x.(P(x) → Q(x))"
      />
      <p className="syntax-note">También puedes escribir !, &amp;, |, -&gt; y &lt;-&gt;.</p>
    </section>
  );
}
