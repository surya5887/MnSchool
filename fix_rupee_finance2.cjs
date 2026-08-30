const fs = require('fs');
let content = fs.readFileSync('src/services/financeService.ts', 'utf8');

content = content.replace("`Generated Due/Charge of ?${data.amount}`", "`Generated Due/Charge of ?${data.amount}`");
content = content.replace("`Processed ${data.type} of ?${data.amount}`", "`Processed ${data.type} of ?${data.amount}`");

fs.writeFileSync('src/services/financeService.ts', content, 'utf8');
console.log("Replaced!");
