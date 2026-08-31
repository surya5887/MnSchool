const fs = require('fs');
let code = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');
code = code.replace("Droplet } from 'lucide-react';", "Droplet, Clock } from 'lucide-react';");
code = code.replace(/\\\`/g, '`');
code = code.replace(/\\\$/g, '$');
fs.writeFileSync('src/pages/StudentProfile.tsx', code, 'utf8');
console.log("Clock imported.");
