'use client';
import { useRef, useState } from 'react';
import { post } from '../../../repositories/httpClient.js';

export function useRequest() {
  const [state, setState] = useState({ data: null, error: '', busy: false });
  const version = useRef(0);
  const clear = () => {
    version.current++;
    setState({ data: null, error: '', busy: false });
  };
  const run = async (body) => {
    const id = ++version.current;
    setState({ data: null, error: '', busy: true });
    try {
      const data = await post('peano', body);
      if (id === version.current) setState({ data, error: '', busy: false });
    } catch (error) {
      if (id === version.current)
        setState({
          data: null,
          error: error.error || error.message || 'No se pudo conectar con la API.',
          busy: false,
        });
    }
  };
  return { ...state, run, clear };
}

export function Feedback({ request, children }) {
  return (
    <div aria-live="polite" aria-busy={request.busy}>
      {request.busy && <p className="hint">Comprobando…</p>}
      {request.error && (
        <p className="inline-error" role="alert">
          {request.error}
        </p>
      )}
      {request.data && children}
    </div>
  );
}
