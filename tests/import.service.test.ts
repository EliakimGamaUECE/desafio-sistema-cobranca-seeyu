import { ImportService } from '../src/services/import.service';
import { InMemoryDebtRepository } from '../src/repositories/debt.repository';

describe('ImportService', () => {
  it('importa linhas válidas e grava como PENDING', async () => {
    const repo = new InMemoryDebtRepository();
    const svc = new ImportService(repo);

    const rows = [{
      name: 'João',
      governmentId: '12345678901',
      email: 'joao@test.com',
      debtAmount: '100.50',
      debtDueDate: '2025-02-10',
      debtId: 'D1'
    }];

    const count = await svc.importRows(rows as any);
    expect(count).toBe(1);

    const all = await repo.findAll();
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({ debtId: 'D1', status: 'PENDING' });
  });

  it('rejeita CPF inválido', async () => {
    const repo = new InMemoryDebtRepository();
    const svc = new ImportService(repo);

    const bad = [{
      name: 'X',
      governmentId: '123',
      email: 'x@test.com',
      debtAmount: '10',
      debtDueDate: '2025-01-01',
      debtId: 'D2'
    }];

    await expect(svc.importRows(bad as any)).rejects.toBeTruthy();
    expect((await repo.findAll()).length).toBe(0);
  });
});
