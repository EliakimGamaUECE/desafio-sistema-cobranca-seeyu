// src/controllers/boleto.controller.ts
import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { DebtRepository } from '../repositories/debt.repository';

export const boletoPdf = (repo: DebtRepository) => async (req: Request, res: Response) => {
  const { debtId } = req.params;
  const debt = await repo.findById(debtId);

  if (!debt) {
    return res.status(404).json({ error: 'Debt not found' });
  }

  // Formatações pt-BR
  const fmtBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const dateBR = new Date(debt.debtDueDate).toLocaleDateString('pt-BR');

  res.setHeader('Content-Type', 'application/pdf');
  // inline para abrir no navegador; use attachment para baixar
  res.setHeader('Content-Disposition', `inline; filename="boleto-${debt.debtId}.pdf"`);

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.pipe(res);

  // Cabeçalho
  doc
    .fontSize(20).text('Boleto de Cobrança (FAKE)', { align: 'center' })
    .moveDown(1);

  // Dados principais
  doc.fontSize(12);
  doc.text(`Nome do pagador: ${debt.name}`);
  doc.text(`CPF/CNPJ: ${debt.governmentId}`);
  doc.text(`E-mail: ${debt.email}`);
  doc.text(`ID da dívida: ${debt.debtId}`);
  doc.text(`Valor: ${fmtBRL.format(debt.debtAmount)}`);
  doc.text(`Vencimento: ${dateBR}`);
  doc.text(`Status atual: ${debt.status}`);
  if (debt.boletoUrl) doc.text(`Link do boleto: ${debt.boletoUrl}`);
  doc.moveDown(1);

  // “Código de barras” fake (só pra visual)
  const code = `${debt.governmentId}-${debt.debtAmount.toFixed(2)}-${new Date(debt.debtDueDate).toISOString().slice(0,10)}`;
  doc.text('Linha digitável (fake):').font('Helvetica-Bold').text(code).font('Helvetica');
  doc.moveDown(1);

  // Caixa destacada
  doc
    .rect(50, doc.y, 500, 120).stroke()
    .text('Instruções (exemplo):', 60, doc.y + 10)
    .text('- Pague até o vencimento para evitar encargos.', 60, doc.y + 30)
    .text('- Boleto gerado somente para fins de demonstração.', 60, doc.y + 45);

  // Rodapé
  doc.moveDown(8);
  doc.fontSize(9).fillColor('gray').text('Documento gerado automaticamente pelo Sistema de Cobrança (Demo).', { align: 'center' });

  doc.end();
};
