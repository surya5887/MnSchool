const fs = require('fs');
let content = fs.readFileSync('src/pages/NewAdmission.tsx', 'utf8');

const targetStr = `            // Ignore fields that have default values
            if (['status', 'admissionType', 'gender', 'feeGroup', 'transportRoute'].includes(key)) return false;`;

const replaceStr = `            // Ignore fields that have default values or are auto-populated
            if (['status', 'admissionType', 'gender', 'feeGroup', 'transportRoute', 'classId', 'sectionId'].includes(key)) return false;`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/pages/NewAdmission.tsx', content, 'utf8');
console.log("hasData ignore list fixed!");
