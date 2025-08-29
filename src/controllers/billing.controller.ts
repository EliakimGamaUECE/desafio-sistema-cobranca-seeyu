import { Request, Response } from 'express';
import { BillingService } from '../services/billing.service';

export const runBilling = (svc: BillingService) => async (_req: Request, res: Response) => {
  const result = await svc.runOnce();
  res.json(result);
};
