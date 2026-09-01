const fs = require('fs');
let code = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');

const idx = code.indexOf('<div className="glass-table-container desktop-only">');
console.log(JSON.stringify(code.substring(idx - 50, idx)));
