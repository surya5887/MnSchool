const fs = require('fs');
let code = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');

// The variable in map is \`row\`. Let's replace the properties on \`row\`.
code = code.replace(/row\.description/g, 'row.description');
code = code.replace(/row\.category/g, 'row.category');
code = code.replace(/row\.isCharge/g, "row.type === 'Charge'");
code = code.replace(/!row\.isCharge/g, "row.type !== 'Charge'");
code = code.replace(/row\.original\.id/g, "row.id");
code = code.replace(/row\.original/g, "row");

fs.writeFileSync('src/pages/StudentProfile.tsx', code, 'utf8');
console.log("Replaced row accessors.");
