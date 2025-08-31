// src/controllers/webhook.controller.ts
import { Request, Response, NextFunction } from 'express';
import { WebhookService } from '../services/webhook.service';

export const paymentWebhook =
  (svc: WebhookService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sig = req.header('X-Signature') ?? undefined;
      svc.verifySignature((req as any).rawBody, sig); 
      await svc.handlePayment(req.body);
      res.status(200).json({ ok: true });
    } catch (err) {
      next(err); 
    }
  };
