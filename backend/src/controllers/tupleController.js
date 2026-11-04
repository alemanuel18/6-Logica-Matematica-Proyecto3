import { tupleOptions } from '../services/tupleService.js';

export const listTuples = (request, response) => {
  response.json({ tuples: tupleOptions(request.body?.domain, request.body?.arities) });
};
