const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

code = code.replace('@page {\n    margin: 1cm;', '@page {\n    margin: 0;');

fs.writeFileSync('src/index.css', code);
console.log('Fixed @page margin');
