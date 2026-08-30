const fs = require('fs');
let content = fs.readFileSync('src/pages/SystemSettings.tsx', 'utf8');

if (!content.includes('MessageSquare')) {
    // wait, it DOES include MessageSquare in the tabs array. We need to check if it's in the import statement.
}

content = content.replace(
  "import { Lock, Edit, Save, X as XIcon, Building2, Phone, Mail, Calendar, User, ShieldCheck, Settings as SettingsIcon } from 'lucide-react';",
  "import { Lock, Edit, Save, X as XIcon, Building2, Phone, Mail, Calendar, User, ShieldCheck, Settings as SettingsIcon, MessageSquare } from 'lucide-react';"
);

fs.writeFileSync('src/pages/SystemSettings.tsx', content);
