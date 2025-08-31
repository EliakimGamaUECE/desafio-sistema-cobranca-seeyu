import { BillingService } from '../src/services/billing.service';
import { InMemoryDebtRepository } from '../src/repositories/debt.repository';

const mkRepoWithPending = () => {
  const repo = new InMemoryDebtRepository();
  (repo as any).store.set('A', {
    debtId: 'A',
    name: 'A',
    governmentId: '11111111111',
    email: 'a@test.com',
    debtAmount: 100,
    debtDueDate: new Date('2025-02-10'),
    status: 'PENDING',
  });
  return repo;
};

describe('BillingService', () => {
  it('gera boleto, envia email e marca INVOICED', async () => {
    const repo = mkRepoWithPending();
    const boleto = { generate: jest.fn(async () => ({ url: 'mock' })) };
    const mail = { sendChargeEmail: jest.fn(async () => {}) };

    process.env.MAIL_MODE = 'mock';
    const svc = new BillingService(repo as any, mail as any, boleto as any);

    const result = await svc.runOnce();
    expect(result.processedNow).toBe(1);
    expect(boleto.generate).toHaveBeenCalled();
    expect(mail.sendChargeEmail).toHaveBeenCalled();
    const all = await repo.findAll();
    expect(all[0].status).toBe('INVOICED');
  });
});
