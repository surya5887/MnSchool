const fs = require('fs');

let content = fs.readFileSync('src/components/FeeReceiptPrintView.tsx', 'utf8');
content = content.replace("import { StudentData }", "import type { StudentData }");
content = content.replace("import { TransactionData }", "import type { TransactionData }");
fs.writeFileSync('src/components/FeeReceiptPrintView.tsx', content);

console.log("Fixed FeeReceipt imports");
