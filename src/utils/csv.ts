import * as fs from 'fs';
import csv from 'csv-parser';

export async function readCsv(filePath: string): Promise<Record<string,string>[]> {
  return new Promise((resolve, reject) => {
    const out: Record<string,string>[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', row => out.push(row))
      .on('end', () => resolve(out))
      .on('error', reject);
  });
}
