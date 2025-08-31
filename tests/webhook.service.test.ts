import crypto from 'crypto';
import { WebhookService } from '../src/services/webhook.service';
import { InMemoryDebtRepository } from '../src/repositories/debt.repository';
import { AppError } from '../src/utils/errors';

// O env.webhookSecret padrão é "dev-secret" (definido no seu env.ts).
const SECRET = 'dev-secret';
const sign = (raw: string) =>
  crypto.createHmac('sha256', SECRET).update(raw).digest('hex');

const repoWith = (status: 'PENDING' | 'PAID' = 'PENDING') => {
  const repo = new InMemoryDebtRepository();
  (repo as any).store.set('D1', {
    debtId: 'D1',
    name: 'Cliente',
    governmentId: '12345678901',
    email: 'c@test.com',
    debtAmount: 100,
    debtDueDate: new Date('2025-02-10T00:00:00Z'),
    status,
  });
  return repo;
};

describe('WebhookService', () => {
  test('verifySignature aceita HMAC correto e rejeita incorreto', () => {
    const svc = new WebhookService(new InMemoryDebtRepository() as any);
    const raw = JSON.stringify({ ex: 1 });

    // ok
    expect(() => svc.verifySignature(raw, sign(raw))).not.toThrow();

    // inválido
    expect(() => svc.verifySignature(raw, 'bad-signature'))
      .toThrow(AppError); // status 401
  });

  test('handlePayment marca a dívida como PAID quando válida', async () => {
    const repo = repoWith('PENDING');
    const svc = new WebhookService(repo as any);

    await svc.handlePayment({
      debtId: 'D1',
      paidAt: '2025-02-10 12:00:00', // formato do enunciado
      paidAmount: 100,
      paidBy: 'Banco X',
    });

    const d = await repo.findById('D1');
    expect(d?.status).toBe('PAID');
    expect(d?.paidAmount).toBe(100);
    expect(d?.paidBy).toBe('Banco X');
    expect(d?.paidAt).toBeInstanceOf(Date);
  });

  test('idempotente: se já estiver PAID, não lança erro', async () => {
    const repo = repoWith('PAID');
    const svc = new WebhookService(repo as any);

    await expect(
      svc.handlePayment({
        debtId: 'D1',
        paidAt: '2025-02-10 12:00:00',
        paidAmount: 100,
        paidBy: 'Banco X',
      })
    ).resolves.not.toThrow();

    const d = await repo.findById('D1');
    expect(d?.status).toBe('PAID'); // permanece pago
  });

  test('404 quando debtId não existe', async () => {
    const repo = new InMemoryDebtRepository();
    const svc = new WebhookService(repo as any);

    await expect(
      svc.handlePayment({
        debtId: 'NAO-EXISTE',
        paidAt: '2025-02-10 12:00:00',
        paidAmount: 10,
        paidBy: 'Bank',
      })
    ).rejects.toBeInstanceOf(AppError);
  });
});
