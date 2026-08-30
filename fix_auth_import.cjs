const fs = require('fs');
let content = fs.readFileSync('api/useFirebaseAuthState.ts', 'utf8');
content = content.replace(
    /import \{ db \} from '\.\.\/src\/lib\/firebase';.*/g,
    "import { dbNode as db } from './firebase-node';"
);
fs.writeFileSync('api/useFirebaseAuthState.ts', content, 'utf8');
