import express from 'express';
import cors from 'cors';
import { evaluate, inspect, tupleOptions, ValidationError } from './logic.js';

export const app = express();
app.use(cors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000' }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
app.post('/api/tuples', (request, response, next) => {
  try { response.json({ tuples: tupleOptions(request.body?.domain, request.body?.arities) }); }
  catch (error) { next(error); }
});
app.post('/api/analyze', (request, response, next) => {
  try {
    const { freeVariables } = inspect(request.body);
    response.json({ freeVariables });
  } catch (error) { next(error); }
});
app.post('/api/evaluate', (request, response, next) => {
  try { response.json(evaluate(request.body)); }
  catch (error) { next(error); }
});
app.use((error, _request, response, _next) => {
  if (error instanceof ValidationError) return response.status(422).json({ error: error.message, field: error.field, position: error.position });
  if (error instanceof SyntaxError && error.status === 400) return response.status(400).json({ error: 'JSON inválido.' });
  console.error(error);
  return response.status(500).json({ error: 'Error interno.' });
});

if (process.argv[1]?.endsWith('/server.js')) {
  const port = Number(process.env.PORT ?? 4000);
  app.listen(port, () => console.log(`API disponible en http://localhost:${port}`));
}
