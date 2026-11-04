import { createId } from '../services/interpretationService.js';

export function SymbolEditor({ title, kind, items, setItems, domain, tupleOptions }) {
  const update = (id, changes) =>
    setItems((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">02 · Lenguaje e interpretación</span>
          <h2>{title}</h2>
        </div>
        <button
          className="secondary compact"
          type="button"
          onClick={() =>
            setItems((previous) => [
              ...previous,
              { id: createId(), name: '', arity: 1, table: {}, tuples: {} },
            ])
          }
        >
          + Agregar
        </button>
      </div>
      <p className="hint">
        {kind === 'function'
          ? 'Define una salida para cada combinación de argumentos.'
          : 'Marca las tuplas que pertenecen a la relación.'}
      </p>
      {items.length === 0 && <p className="empty">Todavía no hay {title.toLowerCase()}.</p>}
      {items.map((item) => {
        const tuples = tupleOptions[item.arity] ?? [];
        return (
          <div className="symbol" key={item.id}>
            <div className="symbol-top">
              <label>
                Nombre
                <input
                  aria-label={`Nombre de ${kind}`}
                  value={item.name}
                  onChange={(event) => update(item.id, { name: event.target.value })}
                  placeholder={kind === 'function' ? 'f' : 'P'}
                />
              </label>
              <label>
                Aridad
                <input
                  aria-label={`Aridad de ${item.name || kind}`}
                  type="number"
                  min="0"
                  step="1"
                  value={item.arity}
                  onChange={(event) =>
                    update(item.id, {
                      arity: event.target.value === '' ? '' : Number(event.target.value),
                    })
                  }
                />
              </label>
              <button
                className="icon-button remove"
                type="button"
                aria-label={`Eliminar ${item.name || kind}`}
                onClick={() => setItems((previous) => previous.filter((x) => x.id !== item.id))}
              >
                ×
              </button>
            </div>
            {item.name &&
              item.arity !== '' &&
              Number.isInteger(Number(item.arity)) &&
              Number(item.arity) >= 0 && (
                <div className="tuple-grid">
                  {tuples.map((tuple) => {
                    const tupleKey = JSON.stringify(tuple);
                    return (
                      <div className="tuple-row" key={tupleKey}>
                        <span className="tuple-name">
                          {item.name}({tuple.join(', ')})
                        </span>
                        {kind === 'function' ? (
                          <select
                            aria-label={`Valor de ${item.name}(${tuple.join(', ')})`}
                            value={item.table?.[tupleKey] ?? ''}
                            onChange={(event) =>
                              update(item.id, {
                                table: { ...item.table, [tupleKey]: event.target.value },
                              })
                            }
                          >
                            <option value="">Seleccionar…</option>
                            {domain.map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <label className="check-label">
                            <input
                              type="checkbox"
                              checked={Boolean(item.tuples?.[tupleKey])}
                              onChange={(event) =>
                                update(item.id, {
                                  tuples: { ...item.tuples, [tupleKey]: event.target.checked },
                                })
                              }
                            />{' '}
                            Pertenece
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        );
      })}
    </section>
  );
}
