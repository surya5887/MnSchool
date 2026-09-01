const fs = require('fs');
let code = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

code = code.replace(/\{Array\.from\(\(\) => \{/g, '{(() => {');
code = code.replace(/return map\.entries\(\);\r?\n\s*\}\)\(\)\.filter/g, 'return Array.from(map.entries()).filter');

code = code.replace(/                  \)\r?\n                \}\)\}\r?\n                \r?\n                \{\/\* Standalone Groups \*\/\}/g, '                  )\n                })\n              })()}\n              \n              {/* Standalone Groups */}');

fs.writeFileSync('src/pages/Announcements.tsx', code, 'utf8');
console.log("Regex replaced");
