const fs = require('fs');
let c = fs.readFileSync('src/pages/SystemSettings.tsx', 'utf8');
c = c.replace(/className="settings-layout" style=\{\{ display: 'flex', gap: '32px', alignItems: 'flex-start' \}\}/, 
  `className="settings-layout" style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'stretch' }}`);
c = c.replace(/className="settings-sidebar" style=\{\{ width: '300px', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 \}\}/, 
  `className="settings-sidebar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}`);
fs.writeFileSync('src/pages/SystemSettings.tsx', c, 'utf8');
console.log("Updated SystemSettings.tsx robustly");
