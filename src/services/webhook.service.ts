import crypto from 'crypto';
import { DebtRepository } from '../repositories/debt.repository';
import { WebhookPaymentSchema } from '../dto/webhook.dto';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

export class WebhookService {
  constructor(private repo: DebtRepository) {}


  verifySignature(rawBody: string, signature?: string) {
    const expected = crypto
      .createHmac('sha256', env.webhookSecret)
      .update(rawBody ?? '')
      .digest('hex');

    if (!signature ||
        signature.length !== expected.length ||
        !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      throw new AppError(401, 'Invalid signature');
    }
  }


  async handlePayment(payload: unknown) {
    const data = WebhookPaymentSchema.parse(payload);

    const found = await this.repo.findById(data.debtId);
    if (!found) throw new AppError(404, 'Debt not found');

    if (found.status === 'PAID') return;

    await this.repo.markPaid(data.debtId, {
      paidAt: data.paidAt,
      paidAmount: data.paidAmount,
      paidBy: data.paidBy,
    });
  }
}
