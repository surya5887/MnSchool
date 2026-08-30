const fs = require('fs');
let content = fs.readFileSync('src/pages/NewAdmission.tsx', 'utf8');

// Replace the import
content = content.replace(
    /import PhoneInput from 'react-phone-input-2';/,
    "import PhoneInputModule from 'react-phone-input-2';\nconst PhoneInput = (PhoneInputModule as any).default || PhoneInputModule;"
);

fs.writeFileSync('src/pages/NewAdmission.tsx', content, 'utf8');
console.log("PhoneInput Vite default export fixed!");
