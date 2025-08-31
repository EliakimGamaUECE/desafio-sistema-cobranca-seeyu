// src/app.ts
import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import { ZodError } from 'zod';

import router from './routes';
import { AppError } from './utils/errors';
import { setupSwagger } from './config/swagger';

const app = express();

// Captura rawBody para HMAC do webhook, ANTES do router
app.use(bodyParser.json({
  verify: (req: any, _res, buf) => { req.rawBody = buf.toString(); }
}));

// Swagger em /docs
setupSwagger(app);

// Rotas
app.use(router);

// 404 para rotas inexistentes (opcional, mas bonito)
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler central
app.use((err: any, _req: any, res: any, _next: any) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', issues: err.issues });
  }
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: 'Upload error', code: err.code });
  }
  return res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
