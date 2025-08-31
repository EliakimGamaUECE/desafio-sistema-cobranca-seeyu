import { Request, Response } from 'express';
import { BillingService } from '../services/billing.service';
import { env } from '../config/env';

export const runBilling = (svc: BillingService) => async (req: Request, res: Response) => {
  if (env.cronToken) {
    const auth = req.header('authorization');
    const ok = auth?.toLowerCase().startsWith('bearer ') &&
               auth.slice(7) === env.cronToken;
    if (!ok) return res.status(401).json({ error: 'unauthorized' });
  }
  const result = await svc.runOnce();
  res.json(result);
};

export const getBillingStats = (svc: BillingService) => async (_req: Request, res: Response) => {
  const result = await svc.stats();
  res.json(result);
};


