const fs = require('fs');
let code = fs.readFileSync('src/pages/Examination.tsx', 'utf8');

code = code.replace('section={sectionFilter}', '');

fs.writeFileSync('src/pages/Examination.tsx', code);
console.log('Fixed Exam TS issue');
