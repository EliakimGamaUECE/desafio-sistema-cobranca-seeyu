import request from 'supertest';


process.env.MAIL_MODE = 'mock';

const app = require('../src/app').default;

describe('Erros de API', () => {
  test('POST /webhooks/payments retorna 401 com assinatura inválida', async () => {
    const payload = {
      debtId: 'ANY',
      paidAt: '2025-02-10 12:00:00',
      paidAmount: 10,
      paidBy: 'X',
    };

    const res = await request(app)
      .post('/webhooks/payments')
      .set('X-Signature', 'assinatura-falsa')
      .send(payload);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
