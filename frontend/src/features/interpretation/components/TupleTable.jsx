import { useId, useState } from 'react';

const PAGE_SIZE = 20;

export function TupleTable({ item, kind, domain, tuples, update }) {
  const [status, setStatus] = useState('all');
  const [argumentsFilter, setArgumentsFilter] = useState({});
  const [page, setPage] = useState(0);
  const id = useId();
  const isFunction = kind === 'function';
  const arity = Number(item.arity);
  const hasValue = (tuple) => {
    const key = JSON.stringify(tuple);
    return isFunction ? domain.includes(item.table?.[key]) : Boolean(item.tuples?.[key]);
  };
  const defined = tuples.filter(hasValue).length;
  const filtered = tuples.filter((tuple) => {
    if (status === 'yes' && !hasValue(tuple)) return false;
    if (status === 'no' && hasValue(tuple)) return false;
    return tuple.every(
      (value, index) => !argumentsFilter[index] || value === argumentsFilter[index],
    );
  });
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages - 1);
  const start = currentPage * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  const markAll = (value) =>
    update(item.id, {
      tuples: Object.fromEntries(tuples.map((tuple) => [JSON.stringify(tuple), value])),
    });

  return (
    <div className="interpretation-table">
      <div className="tuple-summary" role="status">
        <span className="chip">
          {defined} de {tuples.length} {isFunction ? 'salidas definidas' : 'verdaderas'}
        </span>
        <span>
          {tuples.length - defined} {isFunction ? 'pendientes' : 'falsas'}
        </span>
      </div>
      <p className="hint table-hint">
        {isFunction
          ? 'Cada combinación necesita una salida del dominio.'
          : 'Una casilla sin marcar significa falsa. Puedes dejarlas todas sin marcar.'}
      </p>
      {!isFunction && (
        <div className="tuple-bulk">
          <div className="tuple-actions">
            <button
              className="secondary compact"
              type="button"
              disabled={!tuples.length}
              onClick={() => markAll(true)}
            >
              Todas verdaderas
            </button>
            <button
              className="secondary compact"
              type="button"
              disabled={!tuples.length}
              onClick={() => markAll(false)}
            >
              Todas falsas
            </button>
          </div>
          <p className="syntax-note">
            Estas acciones afectan todas las combinaciones, incluso las filtradas.
          </p>
        </div>
      )}
      <div className="tuple-filters">
        <label htmlFor={`${id}-status`}>
          Mostrar
          <select
            id={`${id}-status`}
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}
          >
            <option value="all">Todas</option>
            <option value="yes">{isFunction ? 'Definidas' : 'Verdaderas'}</option>
            <option value="no">{isFunction ? 'Pendientes' : 'Falsas'}</option>
          </select>
        </label>
        {Array.from({ length: arity }, (_, index) => (
          <label key={index} htmlFor={`${id}-arg-${index}`}>
            Argumento {index + 1}
            <select
              id={`${id}-arg-${index}`}
              value={argumentsFilter[index] ?? ''}
              onChange={(event) => {
                setArgumentsFilter((previous) => ({ ...previous, [index]: event.target.value }));
                setPage(0);
              }}
            >
              <option value="">Todos</option>
              {domain.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      {(status !== 'all' || Object.values(argumentsFilter).some(Boolean)) && (
        <button
          className="clear-filters"
          type="button"
          onClick={() => {
            setStatus('all');
            setArgumentsFilter({});
            setPage(0);
          }}
        >
          Limpiar filtros
        </button>
      )}
      <div
        className="tuple-table-scroll"
        tabIndex={0}
        role="region"
        aria-label={`Combinaciones de ${item.name}`}
      >
        <table className="tuple-table">
          <caption className="sr-only">Interpretación de {item.name}</caption>
          <thead>
            <tr>
              {arity === 0 ? (
                <th scope="col">Símbolo</th>
              ) : (
                Array.from({ length: arity }, (_, index) => (
                  <th scope="col" key={index}>
                    Arg. {index + 1}
                  </th>
                ))
              )}
              <th scope="col">{isFunction ? 'Salida' : 'Verdadera'}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((tuple) => {
              const key = JSON.stringify(tuple);
              const expression = `${item.name}(${tuple.join(', ')})`;
              return (
                <tr key={key} className={hasValue(tuple) ? 'is-defined' : ''}>
                  {arity === 0 ? (
                    <td className="tuple-name">{item.name}()</td>
                  ) : (
                    tuple.map((value, index) => <td key={index}>{value}</td>)
                  )}
                  <td>
                    {isFunction ? (
                      <select
                        aria-label={`Valor de ${expression}`}
                        value={hasValue(tuple) ? item.table[key] : ''}
                        onChange={(event) =>
                          update(item.id, {
                            table: { ...item.table, [key]: event.target.value },
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
                          aria-label={`Verdad de ${expression}`}
                          checked={hasValue(tuple)}
                          onChange={(event) =>
                            update(item.id, {
                              tuples: { ...item.tuples, [key]: event.target.checked },
                            })
                          }
                        />
                        <span>{hasValue(tuple) ? 'Verdadera' : 'Falsa'}</span>
                      </label>
                    )}
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={Math.max(1, arity) + 1} className="tuple-empty">
                  {tuples.length === 0
                    ? 'No hay combinaciones disponibles. Comprueba el dominio y la aridad o espera a que carguen.'
                    : 'No hay combinaciones con estos filtros.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="tuple-pagination">
        <span role="status">
          {filtered.length ? `${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)}` : '0'}{' '}
          de {filtered.length}
          {' · '}Página {currentPage + 1} de {pages}
        </span>
        <div className="tuple-actions">
          <button
            className="secondary compact"
            type="button"
            aria-label={`Página anterior de ${item.name}`}
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
          >
            Anterior
          </button>
          <button
            className="secondary compact"
            type="button"
            aria-label={`Página siguiente de ${item.name}`}
            disabled={currentPage >= pages - 1}
            onClick={() => setPage(currentPage + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
