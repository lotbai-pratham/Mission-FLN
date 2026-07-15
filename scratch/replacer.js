const fs = require('fs');
let content = fs.readFileSync('app/DashboardClient.tsx', 'utf8');
const replacement = fs.readFileSync('scratch/replacement.txt', 'utf8');

const startStr = '{/* Top 3 Podium Card Grid */}';
const endStr = '</table>\n                </div>\n              </div>\n            )}';

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr, startIdx) + endStr.length;

if (startIdx === -1 || content.indexOf(endStr, startIdx) === -1) {
  console.log('Could not find the block to replace');
  process.exit(1);
}

// Ensure we capture the whole block including the condition for Top 3 Podium
const realStartIdx = content.lastIndexOf('{leaderboard.length > 0 && (', startIdx);
if (realStartIdx !== -1) {
   content = content.substring(0, realStartIdx) + replacement + content.substring(endIdx);
   fs.writeFileSync('app/DashboardClient.tsx', content);
   console.log('Replaced successfully');
} else {
   console.log('Could not find the real start index');
   process.exit(1);
}
