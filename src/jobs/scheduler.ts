import cron from 'node-cron';
import { env } from '../config/env';

cron.schedule('* * * * *', async () => {
  try {
    await fetch(env.billingRunUrl, {
      method: 'POST',
      headers: env.cronToken ? { Authorization: `Bearer ${env.cronToken}` } : {},
    });
  } catch {
    // silencioso por enquanto; poderia logar se preferir
  }
});
