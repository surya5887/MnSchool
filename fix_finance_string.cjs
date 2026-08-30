const fs = require('fs');
let content = fs.readFileSync('src/services/financeService.ts', 'utf8');

content = content.replace("?${data.amount}", "?${data.amount}");
content = content.replace("?${data.amount}", "?${data.amount}");

fs.writeFileSync('src/services/financeService.ts', content);
console.log("Fixed string literal");
