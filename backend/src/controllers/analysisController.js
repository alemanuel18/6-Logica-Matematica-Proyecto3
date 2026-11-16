import { inspect } from '../services/analysisService.js';

export const analyzeFormula = (request, response) => {
  const { ast, freeVariables } = inspect(request.body);
  response.json({ ast, freeVariables });
};
