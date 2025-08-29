// src/services/webhook.service.ts
import crypto from 'crypto';
import { DebtRepository } from '../repositories/debt.repository';
import { WebhookPaymentSchema } from '../dto/webhook.dto';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

export class WebhookService {
  constructor(private repo: DebtRepository) { }

  verifySignature(rawBody: string, signature?: string) {
    const expected = crypto.createHmac('sha256', env.webhookSecret)
      .update(rawBody ?? '')
      .digest('hex');
    console.log('[WEBHOOK] expected:', expected);
    console.log('[WEBHOOK] received:', signature);
    console.log('[WEBHOOK] rawBody:', JSON.stringify(rawBody));

    if (!signature || signature !== expected) {
      throw new AppError(401, 'Invalid signature');
    }
  }

  // <<< ESTE MÉTODO É O QUE O CONTROLLER CHAMA
  async handlePayment(payload: unknown) {
    const data = WebhookPaymentSchema.parse(payload);

    const found = await this.repo.findById(data.debtId);
    if (!found) throw new AppError(404, 'Debt not found');

    // idempotência: se já está pago, não faz nada
    if (found.status === 'PAID') return;

    await this.repo.markPaid(data.debtId, {
      paidAt: data.paidAt,
      paidAmount: data.paidAmount,
      paidBy: data.paidBy,
    });
  }
}

