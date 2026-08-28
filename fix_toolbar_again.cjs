const fs = require('fs');
let code = fs.readFileSync('src/components/TransferCertificatePrintView.tsx', 'utf8');

code = code.replace(/maxWidth: '210mm',\s*minHeight: '297mm',\s*margin: '0 auto 16px auto', background: 'white'/, "maxWidth: '800px', margin: '0 auto 16px auto', background: 'white'");

fs.writeFileSync('src/components/TransferCertificatePrintView.tsx', code);
console.log('Fixed toolbar');
