// src/dto/webhook.dto.ts
import { z } from 'zod';

// aceita "YYYY-MM-DD HH:mm:ss" OU ISO
const parsePaidAt = z.string().transform((s, ctx) => {
  // 1) tenta ISO direto
  const iso = new Date(s);
  if (!Number.isNaN(iso.getTime())) return iso;

  // 2) tenta "YYYY-MM-DD HH:mm:ss"
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/.exec(s);
  if (m) {
    const [, Y, M, D, h, m2, s2] = m;
    // trata como UTC; se preferir local, remova o 'Date.UTC'
    const d = new Date(Date.UTC(
      Number(Y), Number(M) - 1, Number(D),
      Number(h), Number(m2), Number(s2)
    ));
    return d;
  }

  ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'paidAt inválido' });
  return z.NEVER;
});

export const WebhookPaymentSchema = z.object({
  debtId: z.string().min(1),
  paidAt: parsePaidAt, 
  paidAmount: z.coerce.number().nonnegative(),
  paidBy: z.string().min(1),
});

export type WebhookPayment = z.infer<typeof WebhookPaymentSchema>;
