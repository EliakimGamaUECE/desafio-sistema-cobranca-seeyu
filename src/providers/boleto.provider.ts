export interface BoletoProvider {
  generate(amount: number, dueDate: Date, debtor: { name: string; doc: string }): Promise<{ url: string }>;
}

export class MockBoletoProvider implements BoletoProvider {
  async generate(amount: number, dueDate: Date, debtor: { name: string; doc: string }) {
    const slug = Buffer.from(`${debtor.doc}-${amount}-${dueDate.toISOString()}`).toString('base64url');
    return { url: `https://boleto.mock/${slug}` };
  }
}
