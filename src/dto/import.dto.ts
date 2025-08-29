import { z } from 'zod';

export const ImportCsvRowSchema = z.object({
  name: z.string().min(1),
  governmentId: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
  email: z.string().email(),
  // Converte string/number -> number e valida >= 0
  debtAmount: z.coerce.number().nonnegative(),
  // Converte string -> Date e garante data válida
  debtDueDate: z.coerce.date(),
  debtId: z.string().min(1),
});

export type ImportCsvRow = z.infer<typeof ImportCsvRowSchema>;

