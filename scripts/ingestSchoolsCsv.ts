// scripts/ingestSchoolsCsv.ts
import { fileURLToPath } from 'url';
import * as path from 'path';
import * as fs from 'fs';
import pkg from 'xlsx';
const { readFile, utils } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the XLSX file (relative to project root)
const xlsxPath = path.resolve(__dirname, '..', 'School & Student UID\'s', 'School with UDISE.xlsx');

// Output file that will export the schools array
const outPath = path.resolve(__dirname, '..', 'prisma', 'schoolsFromCsv.ts');

function parseXlsx(): { name: string; udise: string }[] {
  const workbook = readFile(xlsxPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  // Parse rows as raw array of arrays
  const rows = utils.sheet_to_json<any[]>(sheet, { header: 1 });
  
  const result: { name: string; udise: string }[] = [];
  
  // Skip the header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 5) continue;
    
    // Column index 1 is UDISE code (e.g. 27131003102)
    // Column index 4 is School name (e.g. 'चिंधिचक')
    const udise = String(row[1] || '').trim();
    const name = String(row[4] || '').trim();
    
    if (udise && name) {
      result.push({ name, udise });
    }
  }
  return result;
}

function generateTsFile(schools: { name: string; udise: string }[]) {
  const content = `export const schoolsFromCsv = ${JSON.stringify(schools, null, 2)} as const;\n`;
  fs.writeFileSync(outPath, content, { encoding: 'utf8' });
  console.log(`Generated ${outPath} with ${schools.length} schools`);
}

function main() {
  if (!fs.existsSync(xlsxPath)) {
    console.error('XLSX file not found at', xlsxPath);
    process.exit(1);
  }
  const schools = parseXlsx();
  generateTsFile(schools);
}

main();
