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
};
