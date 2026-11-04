import { useEffect, useMemo, useState } from 'react';
import { listTuples } from '../repositories/tupleRepository.js';
import { aritiesFor, buildInterpretation } from '../services/interpretationService.js';

const initialFunctions = [{ id: 'c', name: 'c', arity: 0, table: { '[]': 'a' } }];
const initialPredicates = [{ id: 'P', name: 'P', arity: 1, tuples: { '["a"]': true } }];

export function useInterpretationController(domain) {
  const [functions, setFunctions] = useState(initialFunctions);
  const [predicates, setPredicates] = useState(initialPredicates);
  const [tupleOptions, setTupleOptions] = useState({});
  const tupleRequest = JSON.stringify({ domain, arities: aritiesFor(functions, predicates) });

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const { tuples } = await listTuples(JSON.parse(tupleRequest), controller.signal);
        setTupleOptions(tuples);
      } catch {
        if (!controller.signal.aborted) setTupleOptions({});
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [tupleRequest]);

  const interpretation = useMemo(
    () => buildInterpretation(domain, functions, predicates, tupleOptions),
    [domain, functions, predicates, tupleOptions],
  );
  return { functions, setFunctions, predicates, setPredicates, tupleOptions, interpretation };
}
