import { Debt } from '../domain/debt';

export interface DebtRepository {
  upsertMany(debts: Debt[]): Promise<void>;
  findAll(): Promise<Debt[]>;
  findById(id: string): Promise<Debt | null>;
  markInvoiced(id: string, boletoUrl: string): Promise<void>;
  markPaid(id: string, paid: { paidAt: Date; paidAmount: number; paidBy: string }): Promise<void>;
}

export class InMemoryDebtRepository implements DebtRepository {
  private store = new Map<string, Debt>();

  async upsertMany(debts: Debt[]) {
    debts.forEach(d => this.store.set(d.debtId, d));
  }
  async findAll() { return [...this.store.values()]; }
  async findById(id: string) { return this.store.get(id) ?? null; }
  async markInvoiced(id: string, boletoUrl: string) {
    const d = this.store.get(id); if (!d) throw new Error('Debt not found');
    d.status = 'INVOICED'; d.boletoUrl = boletoUrl;
  }
  async markPaid(id: string, paid: { paidAt: Date; paidAmount: number; paidBy: string }) {
    const d = this.store.get(id); if (!d) throw new Error('Debt not found');
    d.status = 'PAID'; d.paidAt = paid.paidAt; d.paidAmount = paid.paidAmount; d.paidBy = paid.paidBy;
  }
}
