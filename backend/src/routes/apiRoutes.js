import { getVoiceConfig, synthesizeVoice } from '../controllers/voiceController.js';
import { Router } from 'express';
import { analyzeFormula } from '../controllers/analysisController.js';
import { evaluateFormula } from '../controllers/evaluationController.js';
import { listTuples } from '../controllers/tupleController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { fileURLToPath } from 'node:url';

const openApiPath = fileURLToPath(new URL('../../../docs/openapi.yaml', import.meta.url));

export const apiRouter = Router();
apiRouter.get('/health', (_request, response) => response.json({ status: 'ok' }));
apiRouter.get('/openapi.yaml', (_request, response) => response.type('yaml').sendFile(openApiPath));
apiRouter.post('/tuples', asyncHandler(listTuples));
apiRouter.post('/analyze', asyncHandler(analyzeFormula));
apiRouter.post('/evaluate', asyncHandler(evaluateFormula));

apiRouter.get('/voice/config', getVoiceConfig);
apiRouter.post('/voice/speech', asyncHandler(synthesizeVoice));
