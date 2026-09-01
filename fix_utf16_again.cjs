const fs = require('fs');
let text = fs.readFileSync('src/index.css').toString('utf8');
let cleanCss = text.replace(/\0/g, '');
fs.writeFileSync('src/index.css', cleanCss, 'utf8');
console.log("Fixed encoding");
