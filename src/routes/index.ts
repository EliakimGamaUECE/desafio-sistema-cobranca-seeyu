import { Router } from 'express';
import multer from 'multer';

import { PrismaDebtRepository } from '../repositories/debt.repository.prisma';
import { ImportService } from '../services/import.service';
import { BillingService } from '../services/billing.service';
import { WebhookService } from '../services/webhook.service';
import { NodemailerProvider } from '../providers/mail.provider';
import { MockBoletoProvider } from '../providers/boleto.provider';
import { boletoPdf } from '../controllers/boleto.controller';

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

/**
 * @swagger
 * /imports:
 *   post:
 *     tags: [Imports]
 *     summary: Importar CSV de dívidas
 *     description: Recebe um arquivo CSV via multipart e importa as dívidas como PENDING.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo CSV com colunas name, governmentId, email, debtAmount, debtDueDate, debtId
 *     responses:
 *       201:
 *         description: CSV importado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imported: { type: integer, example: 42 }
 *       400:
 *         description: Erro de validação ou upload
 */
router.post('/imports', upload.single('file'), importCsv(importSvc));

/**
 * @swagger
 * /billing/run:
 *   post:
 *     tags: [Billing]
 *     summary: Executa ciclo de cobrança (gera boletos e envia e-mails)
 *     description: Processa dívidas PENDING em lote, gera boleto, envia e-mail e marca como INVOICED.
 *     responses:
 *       200:
 *         description: Estatísticas da rodada de billing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalImported: { type: integer }
 *                 batchSize: { type: integer }
 *                 pendingBefore: { type: integer }
 *                 processedNow: { type: integer }
 *                 emailFailures: { type: integer }
 *                 boletoFailures: { type: integer }
 *                 markInvoicedFailures: { type: integer }
 *                 pendingAfter: { type: integer }
 *       401:
 *         description: Não autorizado (quando CRON_TOKEN está ativo e o header Authorization não foi enviado)
 */
router.post('/billing/run', runBilling(billingSvc));

/**
 * @swagger
 * /billing/stats:
 *   get:
 *     tags: [Billing]
 *     summary: Estatísticas de dívidas por status
 *     responses:
 *       200:
 *         description: Contagem total e por status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total: { type: integer }
 *                 PENDING: { type: integer }
 *                 INVOICED: { type: integer }
 *                 PAID: { type: integer }
 */
router.get('/billing/stats', getBillingStats(billingSvc));

/**
 * @swagger
 * /webhooks/payments:
 *   post:
 *     tags: [Webhooks]
 *     summary: Recebe notificação de pagamento do banco
 *     description: Verifica assinatura HMAC-SHA256 no header **X-Signature** e dá baixa na dívida.
 *     parameters:
 *       - in: header
 *         name: X-Signature
 *         required: true
 *         schema: { type: string }
 *         description: Assinatura HMAC-SHA256 calculada sobre o corpo bruto (rawBody) com o segredo WEBHOOK_SECRET
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [debtId, paidAt, paidAmount, paidBy]
 *             properties:
 *               debtId: { type: string, example: "8291" }
 *               paidAt: { type: string, example: "2025-02-10 12:00:00", description: "YYYY-MM-DD HH:mm:ss ou ISO" }
 *               paidAmount: { type: number, example: 1000.00 }
 *               paidBy: { type: string, example: "John Doe" }
 *     responses:
 *       200: { description: Baixa registrada (idempotente) }
 *       401: { description: Assinatura inválida }
 *       404: { description: Dívida não encontrada }
 *       400: { description: Payload inválido }
 */
router.post('/webhooks/payments', paymentWebhook(webhookSvc));

/**
 * @swagger
 * /debts:
 *   get:
 *     tags: [Debug]
 *     summary: Lista todas as dívidas (apenas para desenvolvimento)
 *     responses:
 *       200:
 *         description: Lista de dívidas
 */
router.get('/debts', async (_req, res) => res.json(await repo.findAll()));

/** 
 @swagger
 * /boletos/{debtId}.pdf:
 *   get:
 *     tags: [Debug]
 *     summary: Visualiza o boleto fake em PDF gerado on-the-fly
 *     parameters:
 *       - in: path
 *         name: debtId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PDF do boleto
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Dívida não encontrada
 */
router.get('/boletos/:debtId.pdf', boletoPdf(repo));

export default router;
