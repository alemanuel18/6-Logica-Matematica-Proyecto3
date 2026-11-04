import { post } from '../../../repositories/httpClient.js';

export const listTuples = (body, signal) => post('tuples', body, signal);
