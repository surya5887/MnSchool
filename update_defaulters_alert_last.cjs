const fs = require('fs');
let code = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');

// Replace any remaining alert in DefaultersList.tsx
code = code.replace(/alert\([^)]+\);/g, 'toast.success("WhatsApp message sent successfully!");');

fs.writeFileSync('src/pages/DefaultersList.tsx', code, 'utf8');
console.log("Replaced remaining alerts");
