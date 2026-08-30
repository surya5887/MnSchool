const fs = require('fs');
let content = fs.readFileSync('src/pages/NewAdmission.tsx', 'utf8');

const targetStr = `onChange={(phone) => setFormData({ ...formData, parentPhone: '+' + phone })}`;
const replaceStr = `onChange={(phone) => setFormData({ ...formData, parentPhone: phone ? '+' + phone : '' })}`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/pages/NewAdmission.tsx', content, 'utf8');
console.log("onChange fixed!");
