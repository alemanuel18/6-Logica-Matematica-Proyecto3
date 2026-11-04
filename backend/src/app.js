import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/apiRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();
app.use(cors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000' }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', apiRouter);
app.use(errorHandler);
