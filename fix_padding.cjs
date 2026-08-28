const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

code = code.replace('padding: 20px !important;', 'padding: 20px;');

fs.writeFileSync('src/index.css', code);
console.log('Fixed padding important');
