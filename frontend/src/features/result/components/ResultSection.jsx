import { Explanation } from './Explanation.jsx';
import { VoiceGuide } from './VoiceGuide.jsx';

export function ResultSection({ result, error, environment, formula }) {
  return (
    <>
      {error && (
        <section className="result-card error-result" role="alert">
          <span className="eyebrow">Revisa la entrada</span>
          <h2>No se puede evaluar</h2>
          <p>{error.error}</p>
          {error.field && (
            <small>
              Sección: {error.field}
              {Number.isInteger(error.position) ? ` · posición ${error.position + 1}` : ''}
            </small>
          )}
        </section>
      )}
      {result && (
        <section
          className={`result-card ${result.truth ? 'is-true' : 'is-false'}`}
          aria-live="polite"
        >
          <span className="eyebrow">Resultado</span>
          <div className="result-heading">
            <h2>{result.result}</h2>
            <span className="result-symbol">{result.truth ? '✓' : '×'}</span>
          </div>
          <p className="result-caption">
            {result.freeVariables.length
              ? `Con el entorno: ${result.freeVariables.map((name) => `${name} = ${environment[name]}`).join(', ')}.`
              : 'Fórmula cerrada.'}
          </p>
          <h3>¿Por qué?</h3>
          <Explanation node={result.explanation} />
        </section>
      )}
      <VoiceGuide result={result} formula={formula} environment={environment} />
    </>
  );
}
