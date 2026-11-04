import { post } from '../../../repositories/httpClient.js';

export const evaluateFormula = (body) => post('evaluate', body);
