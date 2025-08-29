import { z } from 'zod';

export const WebhookPaymentSchema = z.object({
  debtId: z.string().min(1),
  paidAt: z.coerce.date(),
  paidAmount: z.coerce.number().nonnegative(),
  paidBy: z.string().min(1),
});

export type WebhookPayment = z.infer<typeof WebhookPaymentSchema>;
