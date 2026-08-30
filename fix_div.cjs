const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

content = content.replace("              </div>\n              </div>\n              <div onClick", "              </div>\n              <div onClick");

fs.writeFileSync('src/components/Layout.tsx', content);
