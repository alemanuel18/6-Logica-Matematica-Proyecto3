import { post } from '../../../repositories/httpClient.js';

export const analyzeFormula = (body, signal) => post('analyze', body, signal);
