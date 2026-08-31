const fs = require('fs');
let code = fs.readFileSync('src/pages/ClassDetails.tsx', 'utf8');

code = code.replace(/navigate\(\`\/students\/\$\{student\.id\}\`\)/g, "navigate(`/student/${student.id}`)");

fs.writeFileSync('src/pages/ClassDetails.tsx', code, 'utf8');
console.log("Route fixed.");
