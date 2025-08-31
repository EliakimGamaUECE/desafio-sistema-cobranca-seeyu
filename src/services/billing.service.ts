import { DebtRepository } from '../repositories/debt.repository';
import { MailProvider } from '../providers/mail.provider';
import { BoletoProvider } from '../providers/boleto.provider';
import { env } from '../config/env';

export class BillingService {
  constructor(
    private repo: DebtRepository,
    private mail: MailProvider,
    private boleto: BoletoProvider,
  ) { }


  async runOnce() {
    const all = await this.repo.findAll();
    const pending = all.filter(d => d.status === 'PENDING');

    const batchSize = Number(process.env.BILLING_BATCH_SIZE ?? 100);
    const sendDelayMs =
      process.env.MAIL_MODE === 'mock' ? 0 : Number(process.env.MAIL_RATE_DELAY_MS ?? 350);

    let processedNow = 0;
    let emailFailures = 0;
    let boletoFailures = 0;
    let markInvoicedFailures = 0;

    const toProcess = pending.slice(0, batchSize);

    for (const d of toProcess) {
      let url: string;
      try {
        // 1) (opcional) ainda chama o provider se quiser manter o contrato
        // const gen = await this.boleto.generate(d.debtAmount, d.debtDueDate, { name: d.name, doc: d.governmentId });
        // 2) mas a URL final apontará para o PDF da própria API:
        const base = process.env.APP_BASE_URL ?? `http://localhost:${env.port}`;
        url = `${base}/boletos/${encodeURIComponent(d.debtId)}.pdf`;
      } catch {
        boletoFailures++;
        continue;
      }

      const trySend = async () => {
        try {
          await this.mail.sendChargeEmail({
            to: d.email,
            name: d.name,
            amount: d.debtAmount,
            dueDate: d.debtDueDate,
            boletoUrl: url!
          });
        } catch (err: any) {
          const code = err?.response?.status ?? err?.responseCode;
          if (code === 429) {
            await new Promise(r => setTimeout(r, 1000));
            await this.mail.sendChargeEmail({
              to: d.email,
              name: d.name,
              amount: d.debtAmount,
              dueDate: d.debtDueDate,
              boletoUrl: url!
            });
          } else {
            throw err;
          }
        }
      };

      try {
        await trySend();
      } catch {
        emailFailures++;
        if (sendDelayMs > 0) await new Promise(r => setTimeout(r, sendDelayMs));
        continue;
      }

      try {
        await this.repo.markInvoiced(d.debtId, url!);
      } catch {
        markInvoicedFailures++;
      }

      processedNow++;

      if (sendDelayMs > 0) {
        await new Promise(r => setTimeout(r, sendDelayMs));
      }
    }

    const after = await this.repo.findAll();
    const pendingAfter = after.filter(d => d.status === 'PENDING').length;

    return {
      totalImported: all.length,
      batchSize: toProcess.length,
      pendingBefore: pending.length,
      processedNow,
      emailFailures,
      boletoFailures,
      markInvoicedFailures,
      pendingAfter
    };
  }
  async stats() {
    const all = await this.repo.findAll();
    let PENDING = 0, INVOICED = 0, PAID = 0;
    for (const d of all) {
      if (d.status === 'PENDING') PENDING++;
      else if (d.status === 'INVOICED') INVOICED++;
      else if (d.status === 'PAID') PAID++;
    }
    return { total: all.length, PENDING, INVOICED, PAID };
  }
}