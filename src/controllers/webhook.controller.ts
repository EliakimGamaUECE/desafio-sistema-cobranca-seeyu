import { Request, Response } from 'express';
import { WebhookService } from '../services/webhook.service';

export const paymentWebhook = (svc: WebhookService) => async (req: Request, res: Response) => {
  const sig = req.header('X-Signature') ?? undefined;
  svc.verifySignature((req as any).rawBody, sig);  // usa o rawBody capturado no app.ts
  await svc.handlePayment(req.body);
  res.status(200).json({ ok: true });
};
