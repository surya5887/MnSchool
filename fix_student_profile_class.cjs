const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');

content = content.replace(
  "classNameStr={classNameMap[student.classId] || 'Unknown'}",
  "classNameStr={studentClass?.className || 'Unknown'}"
);

fs.writeFileSync('src/pages/StudentProfile.tsx', content);
console.log("Fixed classNameStr");
