// src/providers/mail.provider.ts
import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { log } from '../config/logger';

export interface MailProvider {
  sendChargeEmail(input: {
    to: string; name: string; amount: number; dueDate: Date; boletoUrl: string;
  }): Promise<void>;
}

export class NodemailerProvider implements MailProvider {
  private transporterPromise: Promise<nodemailer.Transporter>;

  constructor() {
    this.transporterPromise = this.buildTransporter();
  }

  private async buildTransporter() {
    // 1) Modo mock: não usa rede, imprime JSON do e-mail no console
    if (process.env.MAIL_MODE === 'mock') {
      log.info('Mail in MOCK mode (jsonTransport). No SMTP connection will be made.');
      return nodemailer.createTransport({ jsonTransport: true });
    }

    // 2) Se não tem credenciais, cria uma conta Ethereal automaticamente
    if (!env.smtp.user || !env.smtp.pass) {
      const acc = await nodemailer.createTestAccount();
      log.info('Using Ethereal test account');
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: acc.user, pass: acc.pass },
      });
    }

    // 3) Credenciais vindas do .env
    return nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
      pool: true,
      maxConnections: 1,
      maxMessages: 50,     // limite conservador
      rateDelta: 1000,     // janela de 1s
      rateLimit: 3         // até 3 msgs/seg
    });
  }

  async sendChargeEmail({ to, name, amount, dueDate, boletoUrl }: {
    to: string; name: string; amount: number; dueDate: Date; boletoUrl: string;
  }) {
    const transporter = await this.transporterPromise;
    const info = await transporter.sendMail({
      from: '"Sistema de Cobrança" <no-reply@sistemacobranca.com>',
      to,
      subject: 'Cobrança de Dívida',
      html: `<p>Olá ${name},</p>
           <p>Você tem uma dívida de <b>R$ ${amount.toFixed(2)}</b> com vencimento em <b>${dueDate.toISOString().slice(0, 10)}</b>.</p>
           <p>Boleto: <a href="${boletoUrl}">${boletoUrl}</a></p>`,
    });

    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) {
      log.info('Preview Ethereal:', preview);
    } else if (process.env.MAIL_MODE === 'mock') {
      // jsonTransport: o info.message contém o MIME, às vezes como Buffer
      const msg = (info as any).message;
      const out = Buffer.isBuffer(msg) ? msg.toString() : msg ?? JSON.stringify(info);
      log.info('Mock email payload:', out);
    } else {
      log.info('Email sent:', info.messageId);
    }
  }
}