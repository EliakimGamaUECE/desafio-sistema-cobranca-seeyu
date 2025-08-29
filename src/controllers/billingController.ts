import { Request, Response } from 'express';
import { parseCSV } from '../utils/csvParser';  // Importa a função de parser CSV
import { sendEmail } from '../utils/nodemailer';  // Importa a função de envio de e-mails
import path from 'path';

export const processCSV = async (req: Request, res: Response) => {
  try {
    const filePath = path.resolve(__dirname, '../data/dados_cobranca_seeyu.csv'); // Caminho absoluto para o CSV
    const records = await parseCSV(filePath);

    for (let record of records) {
      const { name, email, debtAmount, debtDueDate } = record;
      await sendEmail(email, name, debtAmount, debtDueDate);
    }

    res.status(200).send('Cobranças enviadas com sucesso!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao processar o arquivo CSV.');
  }
};
