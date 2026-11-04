import { useEffect, useMemo, useState } from 'react';
import { analyzeFormula } from '../repositories/analysisRepository.js';

export function useEnvironmentController(interpretation, formula) {
  const [environment, setEnvironment] = useState({});
  const [freeVariables, setFreeVariables] = useState([]);
  const [analysisError, setAnalysisError] = useState('');
  const payload = useMemo(
    () => ({ ...interpretation, formula, environment }),
    [interpretation, formula, environment],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const analysis = await analyzeFormula(payload, controller.signal);
        setFreeVariables(analysis.freeVariables);
        setAnalysisError('');
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setFreeVariables([]);
        setAnalysisError(requestError.error ?? 'No se pudo conectar con el servidor.');
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [payload]);

  return { environment, setEnvironment, freeVariables, setFreeVariables, analysisError, payload };
}
