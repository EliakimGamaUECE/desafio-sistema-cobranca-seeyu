import { Router } from 'express';
import multer from 'multer';

import { PrismaDebtRepository } from '../repositories/debt.repository.prisma';
import { ImportService } from '../services/import.service';
import { BillingService } from '../services/billing.service';
import { WebhookService } from '../services/webhook.service';
import { NodemailerProvider } from '../providers/mail.provider';
import { MockBoletoProvider } from '../providers/boleto.provider';

import { importCsv } from '../controllers/import.controller';
import { runBilling } from '../controllers/billing.controller';
import { paymentWebhook } from '../controllers/webhook.controller';

const router = Router();
const upload = multer({ dest: 'tmp/' });

/* DI – instâncias deste módulo (simples e suficiente para o desafio) */
const repo = new PrismaDebtRepository();
const mail = new NodemailerProvider();
const boleto = new MockBoletoProvider();

const importSvc = new ImportService(repo);
const billingSvc = new BillingService(repo, mail, boleto);
const webhookSvc = new WebhookService(repo);

/* Rotas */
router.post('/imports', upload.single('file'), importCsv(importSvc));
router.post('/billing/run', runBilling(billingSvc));
router.post('/webhooks/payments', paymentWebhook(webhookSvc));

/* Healthcheck & debug */
router.get('/debts', async (_req, res) => res.json(await repo.findAll()));

export default router;
