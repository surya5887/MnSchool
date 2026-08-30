const fs = require('fs');
let content = fs.readFileSync('src/services/billingService.ts', 'utf8');

const targetRegex = /\/\/ --- 2\. LATE FINE LOGIC ---[\s\S]*?\/\/ If we generated base fee in THIS EXACT LOOP[\s\S]*?\} else \{[\s\S]*?await updateStudent\(student.id, \{ lateFeesApplied: updatedLateFees \}\);[\s\S]*?\}[\s\S]*?generatedCount\+\+;[\s\S]*?\}[\s\S]*?\}/g;

content = content.replace(targetRegex, '// --- 2. LATE FINE LOGIC REMOVED --- \n        // Late fines are disabled to prevent unexpected automatic charges.');

fs.writeFileSync('src/services/billingService.ts', content, 'utf8');
console.log("Late fine logic removed!");
