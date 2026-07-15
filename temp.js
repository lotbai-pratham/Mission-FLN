const fs = require('fs');
const file = 'app/actions.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\$\{API_BASE\}\/api([^']+)'/g, '`${API_BASE}/api$1`');
fs.writeFileSync(file, content);
