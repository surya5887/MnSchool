const fs = require('fs');

let d = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');

// The replacement was probably failing due to Windows CRLF vs LF.
// Let's do it robustly:
d = d.replace(/fetchData\(\);\s*\}, \[\]\);/, "fetchData();\n    getSchoolSettings().then(data => setSettings(data));\n  }, []);");

fs.writeFileSync('src/pages/DefaultersList.tsx', d, 'utf8');
