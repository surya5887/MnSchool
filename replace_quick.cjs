const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'pages', 'StudentProfile_tmp.tsx');
let code = fs.readFileSync(filePath, 'utf8');

const returnRegex = /  return \(\r?\n    <motion\.div initial=\{\{ opacity: 0 \}\} animate=\{\{ opacity: 1 \}\}>/;
const startIndexMatch = code.match(returnRegex);

if (!startIndexMatch) {
    console.log("Could not find start");
    process.exit(1);
}
const startIndex = startIndexMatch.index;

const endIndex = code.indexOf('      {/* Payment Modal */}');

if (endIndex === -1) {
    console.log("Could not find end");
    process.exit(1);
}

const newUI = fs.readFileSync('C:\\Users\\AneesChaudhary\\.gemini\\antigravity\\brain\\43ba5e23-a1e1-481b-ba6c-6ac233e02e07\\rewrite_ui.cjs', 'utf8').split('const newUI = `')[1].split('`;')[0];

const newCode = code.substring(0, startIndex) + newUI + code.substring(endIndex + "      {/* Payment Modal */}".length);
fs.writeFileSync('src/pages/StudentProfile.tsx', newCode, 'utf8');
console.log("Successfully replaced UI!");
