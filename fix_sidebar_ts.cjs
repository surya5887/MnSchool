const fs = require('fs');
let content = fs.readFileSync('src/components/ProfileSidebar.tsx', 'utf8');

// Fix Upload
content = content.replace("Camera, Upload } from 'lucide-react';", "Camera } from 'lucide-react';");

// Fix group: 'avatar'
content = content.replace("style={{ position: 'relative', cursor: 'pointer', group: 'avatar' }}", "style={{ position: 'relative', cursor: 'pointer' }}");

fs.writeFileSync('src/components/ProfileSidebar.tsx', content);
console.log("Fixed TS errors");
