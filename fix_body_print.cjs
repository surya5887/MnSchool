const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

code = code.replace('@media print {\n  body * {', '@media print {\n  body { margin: 0 !important; padding: 0 !important; }\n  body * {');

fs.writeFileSync('src/index.css', code);
console.log('Fixed body print');
