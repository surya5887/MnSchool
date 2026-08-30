const fs = require('fs');

let d = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');
if (!d.includes('const [settings, setSettings]')) {
    d = d.replace(
        `const [searchTerm, setSearchTerm] = useState('');`,
        `const [searchTerm, setSearchTerm] = useState('');\n  const [settings, setSettings] = useState<any>(null);`
    );
    d = d.replace(
        `fetchData();\n  }, []);`,
        `fetchData();\n    getSchoolSettings().then(data => setSettings(data));\n  }, []);`
    );
    fs.writeFileSync('src/pages/DefaultersList.tsx', d, 'utf8');
}

let a = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');
a = a.replace(/<b>\{\{name\}\}<\/b>/g, "<b>{`{{name}}`}</b>");
a = a.replace(/<b>\{\{due\}\}<\/b>/g, "<b>{`{{due}}`}</b>");
fs.writeFileSync('src/pages/Announcements.tsx', a, 'utf8');

console.log("Fixed JSX and injected settings");
