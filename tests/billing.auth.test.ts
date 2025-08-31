// tests/billing.auth.test.ts
import request from 'supertest';

describe('Proteção do /billing/run com CRON_TOKEN', () => {
  let appWithToken: any;

  beforeAll(() => {
    process.env.MAIL_MODE = 'mock';       // 👈 evita Ethereal
    process.env.CRON_TOKEN = 'test-token';
    appWithToken = require('../src/app').default;
  });

  afterAll(() => {
    process.env.CRON_TOKEN = '';
  });

  test('sem Authorization → 401', async () => {
    const res = await request(appWithToken).post('/billing/run');
    expect(res.status).toBe(401);
  });

  test('com Authorization correto → 200', async () => {
    const res = await request(appWithToken)
      .post('/billing/run')
      .set('Authorization', 'Bearer test-token');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('processedNow');
  });
});
