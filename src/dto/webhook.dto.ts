import { z } from 'zod';

const parsePaidAt = z.string().transform((s, ctx) => {
  const iso = new Date(s);
  if (!Number.isNaN(iso.getTime())) return iso;

  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/.exec(s);
  if (m) {
    const [, Y, M, D, h, m2, s2] = m;
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
