const fs = require('fs');
let content = fs.readFileSync('src/pages/SystemSettings.tsx', 'utf8');

if (!content.includes("id: 'whatsapp'")) {
    // We will find the exact string using regex
    const regex = /\];\s*return \(\s*<>/;
    content = content.replace(regex, `, { id: 'whatsapp', label: 'WhatsApp API', desc: 'Serverless Automation', icon: <MessageSquare size={20} /> }
    ];
    return (
      <>`);
      
    fs.writeFileSync('src/pages/SystemSettings.tsx', content);
    console.log("Forced tab array addition");
} else {
    console.log("whatsapp tab already exists");
}
