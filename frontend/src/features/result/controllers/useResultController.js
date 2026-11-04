import { useEffect, useRef, useState } from 'react';
import { evaluateFormula } from '../repositories/evaluationRepository.js';

export function useResultController(payload, setFreeVariables) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const requestVersion = useRef(0);

  useEffect(() => {
    requestVersion.current += 1;
    setResult(null);
    setError(null);
    setLoading(false);
  }, [payload]);

  const submit = async (event) => {
    event.preventDefault();
    const version = ++requestVersion.current;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const evaluation = await evaluateFormula(payload);
      if (version === requestVersion.current) {
        setResult(evaluation);
        setFreeVariables(evaluation.freeVariables);
      }
    } catch (requestError) {
      if (version === requestVersion.current) {
        setError(
          requestError.error
            ? requestError
            : {
                error: 'No se pudo conectar con el servidor. Comprueba que la API esté iniciada.',
              },
        );
      }
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  };
  return { result, error, loading, submit };
}
