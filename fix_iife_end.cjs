const fs = require('fs');
let code = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

code = code.replace(/                  \)\r?\n                \}\)\}\r?\n                \r?\n                \{\/\* Standalone Groups \*\/\}/, '                  )\n                })\n              })()}\n              \n              {/* Standalone Groups */}');

fs.writeFileSync('src/pages/Announcements.tsx', code, 'utf8');
console.log("Fixed IIFE end");
