const fs = require('fs');
let content = fs.readFileSync('src/pages/SystemSettings.tsx', 'utf8');

if (!content.includes('import WhatsAppSetup')) {
    content = "import WhatsAppSetup from './WhatsAppSetup';\nimport { MessageSquare } from 'lucide-react';\n" + content;
    fs.writeFileSync('src/pages/SystemSettings.tsx', content);
    console.log("Forced import");
}
