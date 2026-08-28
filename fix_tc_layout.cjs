const fs = require('fs');

let code = fs.readFileSync('src/components/TransferCertificatePrintView.tsx', 'utf8');

// Replace the grid with flexbox
code = code.replace(
  "<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', fontSize: '14px', lineHeight: '1.6' }}>",
  "<div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px', fontSize: '15px', lineHeight: '1.8' }}>"
);

// Wrap left column and right column in flex: 1
code = code.replace(
  "<div>\n              <div style={{ display: 'flex' }}>",
  "<div style={{ flex: 1, width: '48%' }}>\n              <div style={{ display: 'flex' }}>"
);

code = code.replace(
  "<div>\n              <div style={{ display: 'flex' }}>\n                <span style={{ width: '25px' }}>10.</span>",
  "<div style={{ flex: 1, width: '48%' }}>\n              <div style={{ display: 'flex' }}>\n                <span style={{ width: '25px' }}>10.</span>"
);

// Adjust margins slightly to make it look better on A4
code = code.replace("padding: '24px 32px'", "padding: '40px 48px'");

fs.writeFileSync('src/components/TransferCertificatePrintView.tsx', code);
console.log('Fixed TC Layout');
