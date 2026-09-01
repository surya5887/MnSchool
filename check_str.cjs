const fs = require('fs');
let code = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');

console.log(code.indexOf('<div className="glass-table-container desktop-only">'));
console.log(code.indexOf('<div className="mobile-only"'));
