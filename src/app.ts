import express from 'express';
import bodyParser from 'body-parser';
import router from './routes';
import { AppError } from './utils/errors';

const app = express();

/* Precisamos do rawBody para verificar a assinatura do webhook */
app.use(bodyParser.json({
  verify: (req: any, _res, buf) => { req.rawBody = buf.toString(); }
}));

/* Monta as rotas */
app.use(router);

/* Error handler (central) */
app.use((err: any, _req: any, res: any, _next: any) => {
  const status = err instanceof AppError ? err.status : 500;
  res.status(status).json({ error: err.message, details: err.details });
});

export default app;
