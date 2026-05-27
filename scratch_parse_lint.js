const fs = require('fs');

const content = fs.readFileSync('lint_errors_utf8.txt', 'utf8');
const lines = content.split('\n');

const ruleStats = {};
const fileStats = {};

let currentFile = null;

for (let line of lines) {
  line = line.trim();
  if (!line) continue;

  if (line.includes('fln-tracker') && (line.endsWith('.tsx') || line.endsWith('.ts') || line.endsWith('.js') || line.endsWith('.cjs') || line.endsWith('.mjs'))) {
    currentFile = line.replace('C:\\Users\\Lenovo\\OneDrive\\Desktop\\Workshop\\fln-tracker\\', '');
    fileStats[currentFile] = { errors: 0, warnings: 0, rules: {} };
    continue;
  }

  if (currentFile) {
    const cleanLine = line.replace(/\s+/g, ' ');
    const isError = cleanLine.toLowerCase().includes('error');
    const isWarning = cleanLine.toLowerCase().includes('warning');

    if (isError || isWarning) {
      // Find the rule name at the end (e.g. @typescript-eslint/no-explicit-any or react-hooks/set-state-in-effect)
      const parts = cleanLine.split(' ');
      const rule = parts[parts.length - 1];

      ruleStats[rule] = (ruleStats[rule] || 0) + 1;
      
      if (isError) fileStats[currentFile].errors++;
      if (isWarning) fileStats[currentFile].warnings++;
      fileStats[currentFile].rules[rule] = (fileStats[currentFile].rules[rule] || 0) + 1;
    }
  }
}

console.log('=== LINT RULE BREAKDOWN ===');
const sortedRules = Object.entries(ruleStats).sort((a, b) => b[1] - a[1]);
sortedRules.forEach(([rule, count]) => {
  console.log(`${rule}: ${count}`);
});

console.log('\n=== TOP AFFECTED FILES ===');
const sortedFiles = Object.entries(fileStats)
  .map(([file, data]) => ({ file, total: data.errors + data.warnings, ...data }))
  .sort((a, b) => b.total - a.total);

sortedFiles.slice(0, 15).forEach(f => {
  console.log(`${f.file}: ${f.total} issues (${f.errors} errors, ${f.warnings} warnings)`);
  console.log('  Rules violated:', f.rules);
});
