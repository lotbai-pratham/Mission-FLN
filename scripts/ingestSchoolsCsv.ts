// scripts/ingestSchoolsCsv.ts
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import * as fs from 'fs';

// Path to the CSV file (relative to project root)
const csvPath = path.resolve(__dirname, '..', 'School & Student UID\'s', 'School with UDISE.csv');

// Output file that will export the schools array
const outPath = path.resolve(__dirname, '..', 'prisma', 'schoolsFromCsv.ts');

function parseCsv(content: string): { name: string; udise: string }[] {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  // Assuming first line is header, columns: ?, ?, ?, Division, Project office, School name
  // We'll attempt to locate the school name column (likely last) and udise code column (maybe second?)
  // Based on sample rows: columns are: Index, UDISE?, ?, ?, ?, Division?, Project office?, School name?
  // Observed line format: 1,27131003102,??????,?????,???????
  // The second column appears to be UDISE code. The last column is school name (in Devanagari maybe). We'll treat column 2 as udise, last as name.
  const result: { name: string; udise: string }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length < 2) continue;
    const udise = parts[1].trim();
    const name = parts[parts.length - 1].trim();
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
  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found at', csvPath);
    process.exit(1);
  }
  const csvContent = fs.readFileSync(csvPath, { encoding: 'utf8' });
  const schools = parseCsv(csvContent);
  generateTsFile(schools);
}

main();
