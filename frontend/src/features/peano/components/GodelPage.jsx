'use client';
import { useState } from 'react';
import { LearningPageShell, godelLinks } from '../../../components/LearningPageShell.jsx';
import { useRequest, Feedback } from './PeanoRequest.jsx';
export function GodelPage() {
  const [godelFormula, setGodelFormula] = useState('0=0');
  const [number, setNumber] = useState('');
  const encoding = useRequest(),
    decoding = useRequest();
  return (
    <LearningPageShell
      active="godel"
      eyebrow="ARITMETIZACIÓN DE LA SINTAXIS"
      title="Una fórmula, un número."
      description="Explora la codificación de Gödel y recupera una fórmula a partir de su código."
      links={godelLinks}
      currentPath="/godel"
    >
      <section className="card pa-full" aria-labelledby="pa-godel">
        <span className="eyebrow">04 · ARITMETIZACIÓN DE LA SINTAXIS</span>
        <h2 id="pa-godel">Números de Gödel</h2>
        <p className="hint">
          Cada símbolo recibe un código positivo. La secuencia a₁, …, aₙ se representa por 2ᵃ¹ · 3ᵃ²
          · 5ᵃ³ · … · pₙᵃⁿ. La factorización única permite recuperar la fórmula. Este es un convenio
          didáctico propio, no la tabla histórica de Gödel.
        </p>
        <details className="pa-details">
          <summary>Ver el convenio de codificación</summary>
          <p>0→1, S→2, +→3, *→4, =→5, ¬→6, ∧→7, ∨→8, →→9, ↔→10, ∀→11, ∃→12, (→13, )→14, .→15.</p>
          <p>
            Para variables: código = 16 + valor en base 38 de sus caracteres. El alfabeto a…z, 0…9,
            _ tiene dígitos 1…37. Por ejemplo x→40, y→41. El código 16 se reserva. Se codifica la
            escritura canónica con paréntesis y numerales expandidos.
          </p>
        </details>
        <div className="godel-grid">
          <div>
            <label className="field-label" htmlFor="godel-formula">
              Fórmula que se codificará
            </label>
            <textarea
              id="godel-formula"
              value={godelFormula}
              maxLength={2000}
              onChange={(e) => {
                setGodelFormula(e.target.value);
                encoding.clear();
              }}
            />
            <button
              className="secondary pa-action"
              disabled={encoding.busy}
              onClick={() => encoding.run({ action: 'encode', formula: godelFormula })}
            >
              Calcular número de Gödel
            </button>
            <Feedback request={encoding}>
              {encoding.data && (
                <div className="reason">
                  <p>
                    Forma canónica: <span className="math-text">{encoding.data.canonical}</span>
                  </p>
                  <div className="godel-factors" aria-label="Factores de la codificación">
                    {encoding.data.factors.map((f, i) => (
                      <span key={i} title={`Símbolo ${f.token}; código ${f.exponent}`}>
                        {f.prime}
                        <sup>{f.exponent}</sup>
                        <small>{f.token}</small>
                      </span>
                    ))}
                  </div>
                  {encoding.data.number ? (
                    <>
                      <label className="field-label" htmlFor="godel-output">
                        Entero exacto ({encoding.data.number.length} cifras)
                      </label>
                      <textarea id="godel-output" readOnly value={encoding.data.number} rows={4} />
                      <button
                        className="secondary compact pa-action"
                        onClick={() => {
                          setNumber(encoding.data.number);
                          decoding.clear();
                        }}
                      >
                        Usar en decodificador
                      </button>
                    </>
                  ) : (
                    <p>
                      El entero excede el límite de expansión de 12 000 bits. La factorización de
                      arriba lo representa exactamente.
                    </p>
                  )}
                </div>
              )}
            </Feedback>
          </div>
          <div>
            <label className="field-label" htmlFor="godel-number">
              Número que se decodificará
            </label>
            <textarea
              id="godel-number"
              value={number}
              maxLength={4000}
              onChange={(e) => {
                setNumber(e.target.value);
                decoding.clear();
              }}
              placeholder="Pega aquí el entero generado"
            />
            <button
              className="secondary pa-action"
              disabled={decoding.busy}
              onClick={() => decoding.run({ action: 'decode', number: number.trim() })}
            >
              Recuperar fórmula
            </button>
            <p className="syntax-note">
              Hasta 4000 cifras y 350 símbolos. Solo acepta fórmulas canónicas del convenio
              mostrado.
            </p>
            <Feedback request={decoding}>
              {decoding.data && <p className="reason math-text">{decoding.data.formula}</p>}
            </Feedback>
          </div>
        </div>
      </section>
    </LearningPageShell>
  );
}
