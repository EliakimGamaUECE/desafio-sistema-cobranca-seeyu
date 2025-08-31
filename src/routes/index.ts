import { Router } from 'express';
import multer from 'multer';

import { PrismaDebtRepository } from '../repositories/debt.repository.prisma';
import { ImportService } from '../services/import.service';
import { BillingService } from '../services/billing.service';
import { WebhookService } from '../services/webhook.service';
import { NodemailerProvider } from '../providers/mail.provider';
import { MockBoletoProvider } from '../providers/boleto.provider';

import { importCsv } from '../controllers/import.controller';
import { runBilling, getBillingStats } from '../controllers/billing.controller';
import { paymentWebhook } from '../controllers/webhook.controller';

const router = Router();
const upload = multer({ dest: 'tmp/' });

/* DI – instâncias */
const repo = new PrismaDebtRepository();
const mail = new NodemailerProvider();
const boleto = new MockBoletoProvider();

const importSvc = new ImportService(repo);
const billingSvc = new BillingService(repo, mail, boleto);
const webhookSvc = new WebhookService(repo);

/* Rotas */
router.post('/imports', upload.single('file'), importCsv(importSvc));
router.post('/billing/run', runBilling(billingSvc));
router.get('/billing/stats', getBillingStats(billingSvc));
router.post('/webhooks/payments', paymentWebhook(webhookSvc));

router.get('/debts', async (_req, res) => res.json(await repo.findAll()));

export default router;

