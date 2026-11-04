export function EnvironmentSection({
  analysisError,
  freeVariables,
  environment,
  setEnvironment,
  domain,
}) {
  return (
    <section className="card">
      <span className="eyebrow">04 · Variables libres</span>
      <h2>Entorno</h2>
      {analysisError ? (
        <p className="inline-error">{analysisError}</p>
      ) : freeVariables.length === 0 ? (
        <p className="empty">No hay variables libres en la fórmula.</p>
      ) : (
        <div className="environment-grid">
          {freeVariables.map((variable) => (
            <label key={variable}>
              {variable}
              <select
                value={environment[variable] ?? ''}
                onChange={(event) =>
                  setEnvironment((previous) => ({ ...previous, [variable]: event.target.value }))
                }
              >
                <option value="">Seleccionar…</option>
                {domain.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}
    </section>
  );
}
