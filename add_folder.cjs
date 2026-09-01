const fs = require('fs');
let code = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

code = code.replace(/import \{ (.*?) \} from 'lucide-react';/, "import { $1, Folder } from 'lucide-react';");

fs.writeFileSync('src/pages/Announcements.tsx', code, 'utf8');
console.log("Folder imported");
