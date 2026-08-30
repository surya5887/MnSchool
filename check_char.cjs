const fs = require('fs');
let content = fs.readFileSync('src/services/financeService.ts', 'utf8');
const lines = content.split('\n');
const line = lines.find(l => l.includes('autoLog(data.type'));
console.log(line);
for(let i=0; i<line.length; i++) {
  console.log(line[i], line.charCodeAt(i));
}
