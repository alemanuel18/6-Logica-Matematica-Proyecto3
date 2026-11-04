export function DomainSection({ domainText, setDomainText, domain }) {
  return (
    <section className="card">
      <span className="eyebrow">01 · Universo</span>
      <h2>Dominio</h2>
      <p className="hint">Escribe elementos distintos, separados por comas o saltos de línea.</p>
      <label className="field-label" htmlFor="domain">
        Elementos de D
      </label>
      <textarea
        id="domain"
        className="domain-input"
        value={domainText}
        onChange={(event) => setDomainText(event.target.value)}
        placeholder="a, b, c"
      />
      <div className="chips">
        {domain.map((value, index) => (
          <span className="chip" key={`${value}-${index}`}>
            {value}
          </span>
        ))}
      </div>
    </section>
  );
}
