const fs = require('fs');
let content = fs.readFileSync('src/services/financeService.ts', 'utf8');

// Replace corrupted unicode
content = content.replace(/Generated Due\/Charge of [^$]+\$\{data\.amount\}/g, 'Generated Due/Charge of ?${data.amount}');
content = content.replace(/Processed \$\{data\.type\} of [^$]+\$\{data\.amount\}/g, 'Processed ${data.type} of ?${data.amount}');

fs.writeFileSync('src/services/financeService.ts', content, 'utf8');
console.log("Finance service fixed!");
