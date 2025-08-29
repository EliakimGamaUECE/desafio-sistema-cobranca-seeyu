import { Router } from 'express';
import { processCSV } from './controllers/billingController';
import { handlePaymentWebhook } from './controllers/webhookController';

const router = Router();

// Define as rotas da API
router.post('/process-csv', processCSV);
router.post('/payment-webhook', handlePaymentWebhook);

export default router;
