import { ValidationError } from '../domain/errors.js';

export function errorHandler(error, _request, response, _next) {
  if (error instanceof ValidationError) {
    return response
      .status(422)
      .json({ error: error.message, field: error.field, position: error.position });
  }
  if (error instanceof SyntaxError && error.status === 400) {
    return response.status(400).json({ error: 'JSON inválido.' });
  }
  console.error(error);
  return response.status(500).json({ error: 'Error interno.' });
}
