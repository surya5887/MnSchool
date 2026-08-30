const fs = require('fs');
let content = fs.readFileSync('src/pages/NewAdmission.tsx', 'utf8');

content = content.replace(
    /import Cropper from 'react-easy-crop';/,
    "import Cropper from 'react-easy-crop';\nimport PhoneInput from 'react-phone-input-2';\nimport 'react-phone-input-2/lib/style.css';"
);

fs.writeFileSync('src/pages/NewAdmission.tsx', content, 'utf8');
