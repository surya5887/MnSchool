const fs = require('fs');

// Fix Announcements.tsx
let a = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');
const defaultTemplate = "Dear Parent,\\nThis is a gentle reminder from MN Public School that Rs. {{due}} is currently outstanding for your ward {{name}}. Kindly clear the dues at the earliest.\\nThank you.";
if (!a.includes('const defaultTemplate = `')) {
    a = a.replace(
        `if (data.feeReminderTemplate) setFeeTemplate(data.feeReminderTemplate);`,
        `const defaultTemplate = \`${defaultTemplate}\`;\n      if (data.feeReminderTemplate) {\n        setFeeTemplate(data.feeReminderTemplate);\n      } else {\n        setFeeTemplate(defaultTemplate);\n      }`
    );
    // Add info about placeholders in Announcements.tsx UI
    a = a.replace(
        `This exact message will be dynamically personalized and sent to parents when you generate an automated fee reminder from the Ledger.`,
        `This exact message will be dynamically personalized and sent to parents. You can use placeholders like <b>{{name}}</b> for student name and <b>{{due}}</b> for the due amount.`
    );
    fs.writeFileSync('src/pages/Announcements.tsx', a, 'utf8');
}

// Fix DefaultersList.tsx
let d = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');
if (!d.includes('getSchoolSettings')) {
    d = d.replace(
        `import type { StudentData } from '../services/studentService';`,
        `import type { StudentData } from '../services/studentService';\nimport { getSchoolSettings } from '../services/settingsService';`
    );
    d = d.replace(
        `const [search, setSearch] = useState('');`,
        `const [search, setSearch] = useState('');\n  const [settings, setSettings] = useState<any>(null);`
    );
    d = d.replace(
        `fetchData();\n  }, []);`,
        `fetchData();\n    getSchoolSettings().then(data => setSettings(data));\n  }, []);`
    );
    
    // Fix message generation logic
    const oldMsgLogic = 'const message = `Dear Parent,\\nThis is a gentle reminder from MN Public School that Rs. ${due} is currently outstanding for your ward ${name}. Kindly clear the dues at the earliest.\\nThank you.`;';
    const newMsgLogic = `const defaultTemplate = \`${defaultTemplate}\`;\n      const templateStr = settings?.feeReminderTemplate || defaultTemplate;\n      const message = templateStr.replace(/\\{\\{name\\}\\}/g, name).replace(/\\{\\{due\\}\\}/g, String(due));`;
    
    d = d.replace(oldMsgLogic, newMsgLogic);
    
    fs.writeFileSync('src/pages/DefaultersList.tsx', d, 'utf8');
}

console.log("Updated both files");
