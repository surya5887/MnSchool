const fs = require('fs');
let code = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

code = code.replace(/import \{ getSchoolSettings, saveSchoolSettings, SchoolSettingsData \} from '\.\.\/services\/settingsService';/, "import { getSchoolSettings, saveSchoolSettings } from '../services/settingsService';\nimport type { SchoolSettingsData } from '../services/settingsService';");

fs.writeFileSync('src/pages/Announcements.tsx', code, 'utf8');
console.log("Type import fixed");
