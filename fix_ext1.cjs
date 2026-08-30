const fs = require('fs');
let content = fs.readFileSync('api/send-message.ts', 'utf8');
content = content.replace(
    /from '\.\/useFirebaseAuthState';/g,
    "from './useFirebaseAuthState.js';"
);
fs.writeFileSync('api/send-message.ts', content, 'utf8');
