import { prisma } from '../infra/prisma';
import { Debt as DomainDebt } from '../domain/debt';

// helpers p/ mapear Prisma <-> domínio (Decimal -> number)
const toDomain = (r: any): DomainDebt => ({
  debtId: r.debtId,
  name: r.name,
  governmentId: r.governmentId,
  email: r.email,
  debtAmount: Number(r.debtAmount),       // Decimal -> number
  debtDueDate: r.debtDueDate,
  status: r.status,
  boletoUrl: r.boletoUrl ?? undefined,
  lastEmailAt: r.lastEmailAt ?? undefined,
  paidAt: r.paidAt ?? undefined,
  paidAmount: r.paidAmount == null ? undefined : Number(r.paidAmount),
  paidBy: r.paidBy ?? undefined,
});

export class PrismaDebtRepository {
  async upsertMany(debts: DomainDebt[]): Promise<void> {
    // Prisma não tem createManyUpsert; então fazemos upserts em lote
    await prisma.$transaction(
      debts.map(d =>
        prisma.debt.upsert({
          where: { debtId: d.debtId },
          create: {
            debtId: d.debtId,
            name: d.name,
            governmentId: d.governmentId,
            email: d.email,
            debtAmount: d.debtAmount, // Prisma converte number->Decimal
            debtDueDate: d.debtDueDate,
            status: d.status as any,
          },
          update: {
            name: d.name,
            governmentId: d.governmentId,
            email: d.email,
            debtAmount: d.debtAmount,
            debtDueDate: d.debtDueDate,
            status: d.status as any,
          },
        })
      )
    );
  }

  async findAll(): Promise<DomainDebt[]> {
    const rows = await prisma.debt.findMany();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<DomainDebt | null> {
    const row = await prisma.debt.findUnique({ where: { debtId: id } });
    return row ? toDomain(row) : null;
  }

  async markInvoiced(id: string, boletoUrl: string): Promise<void> {
    await prisma.debt.update({
      where: { debtId: id },
      data: { status: 'INVOICED', boletoUrl, lastEmailAt: new Date() },
    });
  }

  async markPaid(
    id: string,
    paid: { paidAt: Date; paidAmount: number; paidBy: string }
  ): Promise<void> {
    await prisma.debt.update({
      where: { debtId: id },
      data: {
        status: 'PAID',
        paidAt: paid.paidAt,
        paidAmount: paid.paidAmount,
        paidBy: paid.paidBy,
      },
    });
  }
}
