import { Request, Response } from 'express';
import { readCsv } from '../utils/csv';
import { ImportService } from '../services/import.service';
import fs from 'fs/promises';

export const importCsv = (svc: ImportService) => async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'CSV é obrigatório' });

  try {
    const rows = await readCsv(file.path);
    const count = await svc.importRows(rows);
    res.status(201).json({ imported: count });
  } finally {
    if (file?.path) {
      fs.unlink(file.path).catch(() => {});
    }
  }
};