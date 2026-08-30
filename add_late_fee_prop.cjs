const fs = require('fs');
let content = fs.readFileSync('src/services/studentService.ts', 'utf8');

if (!content.includes('lateFeesApplied?: string[]')) {
  content = content.replace(
    "billedMonths?: string[];",
    "billedMonths?: string[];\n  lateFeesApplied?: string[];"
  );
  fs.writeFileSync('src/services/studentService.ts', content);
  console.log("Added lateFeesApplied to StudentData");
}
