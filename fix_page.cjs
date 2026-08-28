const fs = require('fs');

// Fix index.css print styles
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace('.report-card-page { box-shadow: none !important; min-height: auto !important;', '.report-card-page { box-shadow: none !important; min-height: 297mm !important; max-width: none !important;');
fs.writeFileSync('src/index.css', css);

// Fix TC inline styles
let tsx = fs.readFileSync('src/components/TransferCertificatePrintView.tsx', 'utf8');
tsx = tsx.replace("maxWidth: '800px',", "maxWidth: '210mm',\n          minHeight: '297mm',");
fs.writeFileSync('src/components/TransferCertificatePrintView.tsx', tsx);

console.log('Fixed full page stretch');
