import express from 'express';
import bodyParser from 'body-parser';
import router from './routes';
import { AppError } from './utils/errors';
import { ZodError } from 'zod';
import multer from 'multer';

const app = express();

app.use(bodyParser.json({
  verify: (req: any, _res, buf) => { req.rawBody = buf.toString(); }
}));

app.use(router);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});


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

  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
