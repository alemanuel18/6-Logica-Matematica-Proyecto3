import { evaluate } from '../services/evaluationService.js';

export const evaluateFormula = (request, response) => response.json(evaluate(request.body));
