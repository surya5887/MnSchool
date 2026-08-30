const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');
content = content.replace(/\?\{typeof currentDue/g, '?{typeof currentDue');
content = content.replace(/\?\{typeof currentAdvance/g, '?{typeof currentAdvance');
content = content.replace(/\?\{t\.runningBalance\}/g, '?{t.runningBalance}');
content = content.replace(/\?\{Math\.abs/g, '?{Math.abs');
content = content.replace(/\?'\}/g, '?0\'}');
content = content.replace(/\?0'\}/g, '?0\'}');
fs.writeFileSync('src/pages/StudentProfile.tsx', content);
