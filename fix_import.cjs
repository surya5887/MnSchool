const fs = require('fs');
let layoutContent = fs.readFileSync('src/components/Layout.tsx', 'utf8');
layoutContent = layoutContent.replace(/, Zap/g, '');
fs.writeFileSync('src/components/Layout.tsx', layoutContent);
