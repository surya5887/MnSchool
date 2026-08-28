const fs = require('fs');
let code = fs.readFileSync('src/components/TransferCertificatePrintView.tsx', 'utf8');

// Revert the toolbar
code = code.replace("maxWidth: '210mm',\n            minHeight: '297mm', margin: '0 auto 16px auto', background: 'white'", "maxWidth: '800px', margin: '0 auto 16px auto', background: 'white'");

// Now fix the actual report card page
code = code.replace(
  "maxWidth: '800px',\n          margin: '0 auto 24px auto',", 
  "maxWidth: '210mm',\n          minHeight: '297mm',\n          margin: '0 auto 24px auto',"
);

fs.writeFileSync('src/components/TransferCertificatePrintView.tsx', code);
console.log('Fixed toolbar and page');
