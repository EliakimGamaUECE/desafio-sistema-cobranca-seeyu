export type DebtStatus = 'PENDING' | 'INVOICED' | 'PAID';

export interface Debt {
  debtId: string;
  name: string;
  governmentId: string;
  email: string;
  debtAmount: number;
  debtDueDate: Date;
  status: DebtStatus;
  boletoUrl?: string;
  lastEmailAt?: Date;
  paidAt?: Date;
  paidAmount?: number;
  paidBy?: string;
}
