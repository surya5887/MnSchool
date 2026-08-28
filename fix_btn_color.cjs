const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/background: 'var\(--primary\)'/g, "background: 'var(--primary-gradient)'");
  fs.writeFileSync(file, code);
}

fixFile('src/components/ReportCardPrintView.tsx');
fixFile('src/components/TransferCertificatePrintView.tsx');

console.log('Button colors fixed');
