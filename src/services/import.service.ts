import { ImportCsvRowSchema } from '../dto/import.dto';
import { Debt } from '../domain/debt';
import { DebtRepository } from '../repositories/debt.repository';

export class ImportService {
  constructor(private repo: DebtRepository) {}

  async importRows(rows: Record<string,string>[]) {
    const debts: Debt[] = rows.map(r => {
      const v = ImportCsvRowSchema.parse(r);
      return {
        debtId: v.debtId, name: v.name, governmentId: v.governmentId,
        email: v.email, debtAmount: v.debtAmount, debtDueDate: v.debtDueDate,
        status: 'PENDING',
      };
    });
    await this.repo.upsertMany(debts);
    return debts.length;
  }
}
