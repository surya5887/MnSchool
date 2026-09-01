const fs = require('fs');
let code = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

code = code.replace(/      \}\r?\n\s*\}<\/style>/, '      }\n    `}</style>');

fs.writeFileSync('src/pages/Announcements.tsx', code, 'utf8');
console.log("Style closing fixed");
