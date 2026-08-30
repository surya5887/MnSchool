const fs = require('fs');
let content = fs.readFileSync('api/send-message.ts', 'utf8');

// The frontend will send the fully cleaned number (e.g. 919876543210 or 1234567890)
// We just append @s.whatsapp.net
content = content.replace(
    /const formattedPhone = phone\.startsWith\('91'\) \? `\$\{phone\}@s\.whatsapp\.net` : `91\$\{phone\}@s\.whatsapp\.net`;/,
    "const formattedPhone = `${phone}@s.whatsapp.net`;"
);

fs.writeFileSync('api/send-message.ts', content, 'utf8');
console.log("API phone format fixed!");
