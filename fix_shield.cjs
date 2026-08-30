const fs = require('fs');
let c = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');
c = c.replace(/Shield, /g, '');
fs.writeFileSync('src/pages/Announcements.tsx', c, 'utf8');
