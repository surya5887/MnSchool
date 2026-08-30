const fs = require('fs');
let content = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');
content = content.replace(
    /body: JSON\.stringify\(\{ number: '91' \+ num, message \}\)/g,
    "body: JSON.stringify({ phone: '91' + num, message })"
);
fs.writeFileSync('src/pages/DefaultersList.tsx', content, 'utf8');
