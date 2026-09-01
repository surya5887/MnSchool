const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace(/th, td\s*\{\s*padding:\s*16px;\s*text-align:\s*left;\s*border-bottom:\s*1px solid rgba\(255, 255, 255, 0\.3\);\s*\}/g, "th, td {\n  padding: 16px;\n  text-align: left;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.3);\n  white-space: nowrap;\n}");

fs.writeFileSync('src/index.css', css, 'utf8');
console.log("Fixed table CSS 2");
