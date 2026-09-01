const fs = require('fs');
let code = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

// Replace the invalid JSX curly braces
code = code.replace(/<b>\{\{name\}\}<\/b>/g, "<b>{`{{name}}`}</b>");
code = code.replace(/<b>\{\{due\}\}<\/b>/g, "<b>{`{{due}}`}</b>");

fs.writeFileSync('src/pages/Announcements.tsx', code, 'utf8');
console.log("JSX curly braces fixed");
