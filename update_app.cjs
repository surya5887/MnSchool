const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importStr = "import { Toaster } from 'react-hot-toast';\n";
code = importStr + code;

code = code.replace('<BrowserRouter>', '<BrowserRouter>\n      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: \'#fff\', color: \'#363636\', borderRadius: \'12px\', padding: \'16px\', boxShadow: \'0 10px 25px -5px rgba(0,0,0,0.1)\', fontWeight: 500 } }} />');

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log("Added Toaster to App.tsx");
