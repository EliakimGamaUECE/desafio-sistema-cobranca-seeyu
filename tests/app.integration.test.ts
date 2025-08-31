import path from 'path';
import request from 'supertest';
import crypto from 'crypto';
import { prisma } from '../src/infra/prisma';


process.env.MAIL_MODE = 'mock';          
process.env.CRON_TOKEN = '';             
process.env.BILLING_BATCH_SIZE = '5'; 
process.env.MAIL_RATE_DELAY_MS = '0';


import app from '../src/app';


jest.setTimeout(20_000);

beforeAll(async () => {
  await prisma.debt.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('API integration', () => {
  it('POST /imports carrega CSV válido (buffer em memória)', async () => {
    const csvBuf = Buffer.from(
      [
        'name,governmentId,email,debtAmount,debtDueDate,debtId',
        'Joao,12345678901,joao@test.com,100.50,2025-02-10,D1',
        'Maria,10987654321,maria@test.com,200,2025-03-15,D2',
      ].join('\n'),
      'utf8'
    );

    const res = await request(app)
      .post('/imports')
      .attach('file', csvBuf, { filename: 'import.csv', contentType: 'text/csv' });

    expect(res.status).toBe(201);
    expect(res.body.imported).toBeGreaterThanOrEqual(2);
  });
  it('POST /billing/run processa e responde stats', async () => {
    const res = await request(app).post('/billing/run');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('processedNow');
    expect(res.body).toHaveProperty('pendingAfter');
  });

  it('POST /webhooks/payments paga uma dívida', async () => {
    await prisma.debt.create({
      data: {
        debtId: 'TST1',
        name: 'Teste',
        governmentId: '12345678901',
        email: 't@test.com',
        debtAmount: 100,
        debtDueDate: new Date(),
        status: 'PENDING',
      },
    });

    const payload = {
      debtId: 'TST1',
      paidAt: '2025-02-10 12:00:00',
      paidAmount: 100,
      paidBy: 'John Doe',
    };
    const raw = JSON.stringify(payload);
    const sig = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET ?? 'dev-secret')
      .update(raw)
      .digest('hex');

    const res = await request(app)
      .post('/webhooks/payments')
      .set('X-Signature', sig)
      .send(payload);

    expect(res.status).toBe(200);

    const updated = await prisma.debt.findUnique({ where: { debtId: 'TST1' } });
    expect(updated?.status).toBe('PAID');
  });
});
