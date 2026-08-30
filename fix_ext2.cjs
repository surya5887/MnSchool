const fs = require('fs');
let content = fs.readFileSync('api/useFirebaseAuthState.ts', 'utf8');
content = content.replace(
    /from '\.\/firebase-node';/g,
    "from './firebase-node.js';"
);
fs.writeFileSync('api/useFirebaseAuthState.ts', content, 'utf8');
