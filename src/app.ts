import express from 'express';
import multer from 'multer';
import bodyParser from 'body-parser';
import { PrismaDebtRepository } from './repositories/debt.repository.prisma';
import { ImportService } from './services/import.service';
import { BillingService } from './services/billing.service';
import { WebhookService } from './services/webhook.service';
import { NodemailerProvider } from './providers/mail.provider';
import { MockBoletoProvider } from './providers/boleto.provider';
import { importCsv } from './controllers/import.controller';
import { runBilling } from './controllers/billing.controller';
import { paymentWebhook } from './controllers/webhook.controller';
import { AppError } from './utils/errors';

const app = express();
const upload = multer({ dest: 'tmp/' });

// Para validar assinatura precisamos do rawBody:
app.use(bodyParser.json({
  verify: (req: any, _res, buf) => { req.rawBody = buf.toString(); }
}));
app.use(bodyParser.json());

/* DI – instâncias */
const repo = new PrismaDebtRepository();
const mail = new NodemailerProvider();
const boleto = new MockBoletoProvider();

const importSvc = new ImportService(repo);
const billingSvc = new BillingService(repo, mail, boleto);
const webhookSvc = new WebhookService(repo);

/* Rotas */
app.post('/imports', upload.single('file'), importCsv(importSvc));
app.post('/billing/run', runBilling(billingSvc));
app.post('/webhooks/payments', paymentWebhook(webhookSvc));

/* Healthcheck & debug */
app.get('/debts', async (_req, res) => res.json(await repo.findAll()) );

/* Error handler */
app.use((err: any, _req: any, res: any, _next: any) => {
  const status = err instanceof AppError ? err.status : 500;
  res.status(status).json({ error: err.message, details: err.details });
});

export default app;
