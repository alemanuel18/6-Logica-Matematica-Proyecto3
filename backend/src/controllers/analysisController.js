import { inspect } from '../services/analysisService.js';

export const analyzeFormula = (request, response) => {
  const { freeVariables } = inspect(request.body);
  response.json({ freeVariables });
};
