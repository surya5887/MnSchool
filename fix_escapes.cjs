const fs = require('fs');
let code = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');

// The JS template string injected \" and \` and \$ literally.
code = code.replace(/\\\`/g, '`');
code = code.replace(/\\\$/g, '$');

fs.writeFileSync('src/pages/StudentProfile.tsx', code, 'utf8');
console.log("Escapes fixed.");
