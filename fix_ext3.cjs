const fs = require('fs');
let content = fs.readFileSync('api/generate-qr.ts', 'utf8');
content = content.replace(
    /from '\.\/useFirebaseAuthState';/g,
    "from './useFirebaseAuthState.js';"
);
fs.writeFileSync('api/generate-qr.ts', content, 'utf8');
