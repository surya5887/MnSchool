const fs = require('fs');
let content = fs.readFileSync('src/services/billingService.ts', 'utf8');

content = content.replace(/const LATE_FINE_AMOUNT = 50; \/\/ Default flat late fine\n/, '');
content = content.replace(/const currentDay = today\.getDate\(\);\n/, '');
content = content.replace(/const lateFeesApplied = student\.lateFeesApplied \|\| \[\];\n/, '');
content = content.replace(/let baseFeeGeneratedThisLoop = false;\n/, '');
content = content.replace(/baseFeeGeneratedThisLoop = true;\n/, '');

fs.writeFileSync('src/services/billingService.ts', content, 'utf8');
