import nodemailer from 'nodemailer';

export const sendEmail = async (email: string, name: string, debtAmount: string, dueDate: string) => {
  // Cria uma conta de teste no Ethereal
  const testAccount = await nodemailer.createTestAccount();

  // Configura o transportador usando o SMTP do Ethereal
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  // Cria o e-mail
  const info = await transporter.sendMail({
    from: '"Sistema de Cobrança" <no-reply@sistemacobranca.com>',
    to: email,
    subject: 'Cobrança de Dívida',
    text: `Olá ${name},\n\nVocê tem uma dívida no valor de R$ ${debtAmount} com vencimento em ${dueDate}. Por favor, efetue o pagamento.`,
  });

  // Mostra no console o link para visualizar o e-mail no Ethereal
  console.log('Mensagem enviada: %s', info.messageId);
  console.log('Visualize o e-mail em: %s', nodemailer.getTestMessageUrl(info));
};
