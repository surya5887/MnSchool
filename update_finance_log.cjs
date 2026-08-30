const fs = require('fs');
let content = fs.readFileSync('src/services/financeService.ts', 'utf8');

const oldLog = 'await autoLog(`Processed ${data.type === "Income" ? "Fee Collection" : "Expense"} of ?${data.amount}`);';
const newLog = 'await autoLog(data.type === "Charge" ? `Generated Due/Charge of ?${data.amount}` : `Processed ${data.type} of ?${data.amount}`);';

content = content.replace(oldLog, newLog);
content = content.replace(/\?\$|,\$|,1\$/g, '?'); // Clean up any weird symbols in financeService

fs.writeFileSync('src/services/financeService.ts', content);
console.log("Updated finance logging");
