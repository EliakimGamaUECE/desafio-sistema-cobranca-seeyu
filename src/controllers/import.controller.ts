import { Request, Response } from 'express';
import { readCsv } from '../utils/csv';
import { ImportService } from '../services/import.service';

export const importCsv = (svc: ImportService) => async (req: Request, res: Response) => {
  const file = req.file; // via multer
  if (!file) return res.status(400).json({ error: 'CSV é obrigatório' });
  const rows = await readCsv(file.path);
  const count = await svc.importRows(rows);
  res.status(201).json({ imported: count });
};
