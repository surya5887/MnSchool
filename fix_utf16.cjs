const fs = require('fs');
let css = fs.readFileSync('src/index.css');

// Since we appended UTF-16 bytes at the end, let's just strip everything after ".hide-scrollbar" section.
const text = css.toString('utf8');
// Or just read as utf8 and remove null bytes.
let cleanCss = text.replace(/\0/g, '');

fs.writeFileSync('src/index.css', cleanCss, 'utf8');
console.log("Fixed encoding");
