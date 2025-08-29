import { DebtRepository } from '../repositories/debt.repository';
import { MailProvider } from '../providers/mail.provider';
import { BoletoProvider } from '../providers/boleto.provider';

export class BillingService {
  constructor(
    private repo: DebtRepository,
    private mail: MailProvider,
    private boleto: BoletoProvider,
  ) {}

  // Gera boleto (mock) e envia e-mail – idempotente por status
  async runOnce() {
    const all = await this.repo.findAll();
    for (const d of all) {
      if (d.status !== 'PENDING') continue;
      const { url } = await this.boleto.generate(d.debtAmount, d.debtDueDate, { name: d.name, doc: d.governmentId });
      await this.repo.markInvoiced(d.debtId, url);
      await this.mail.sendChargeEmail({ to: d.email, name: d.name, amount: d.debtAmount, dueDate: d.debtDueDate, boletoUrl: url });
    }
    return { processed: all.length };
  }
}
