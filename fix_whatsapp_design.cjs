const fs = require('fs');
let c = fs.readFileSync('src/pages/WhatsAppSetup.tsx', 'utf8');

c = c.replace(
  `gridTemplateColumns: '1fr 1fr', gap: '32px'`,
  `gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px'`
);

c = c.replace(
  `QRCodeSVG value={qrCode} size={220} level="H" />`,
  `QRCodeSVG value={qrCode} size={260} level="H" />`
);

// Make the action column a bit more spacious
c = c.replace(
  `background: 'white', padding: '32px', borderRadius: '24px'`,
  `background: 'white', padding: '48px 32px', borderRadius: '24px', minHeight: '400px'`
);

fs.writeFileSync('src/pages/WhatsAppSetup.tsx', c, 'utf8');
console.log("Updated WhatsAppSetup.tsx design for wider space");
