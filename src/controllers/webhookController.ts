import { Request, Response } from 'express';

export const handlePaymentWebhook = (req: Request, res: Response) => {
  const { debtId, paidAt, paidAmount, paidBy } = req.body;

  // Aqui você pode atualizar o status da dívida no banco de dados ou em memória.
  console.log(`Pagamento recebido: 
    Dívida ID: ${debtId}, 
    Pagamento: R$ ${paidAmount}, 
    Pago por: ${paidBy}, 
    Data de pagamento: ${paidAt}`);

  // Retorna uma resposta de sucesso
  res.status(200).send('Pagamento processado com sucesso.');
};


