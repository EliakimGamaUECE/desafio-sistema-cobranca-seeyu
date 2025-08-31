import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 3000),
  smtp: {
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
  webhookSecret: process.env.WEBHOOK_SECRET ?? 'dev-secret',

  // NOVO: URL usada pelo cron para disparar o billing e token opcional
  billingRunUrl:
    process.env.BILLING_RUN_URL ??
    `http://127.0.0.1:${Number(process.env.PORT ?? 3000)}/billing/run`,
  cronToken: process.env.CRON_TOKEN, // se definido, exige Bearer no endpoint
};

