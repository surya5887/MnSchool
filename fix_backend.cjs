const fs = require('fs');
let code = fs.readFileSync('api/whatsapp-groups.ts', 'utf8');

// Remove the robust fallback completely.
const fallbackStart = '// 4. Robust Fallback:';
const fallbackEnd = 'iAmAdmin = true; // Assume true to unblock the UI. Server will reject if false.\n      }';
const fallbackEnd2 = 'iAmAdmin = true; // Assume true to unblock the UI. Server will reject if false.\r\n      }';

let startIndex = code.indexOf(fallbackStart);
if (startIndex !== -1) {
    let endIndex = code.indexOf(fallbackEnd);
    if (endIndex !== -1) {
        code = code.substring(0, startIndex) + code.substring(endIndex + fallbackEnd.length);
    } else {
        endIndex = code.indexOf(fallbackEnd2);
        if (endIndex !== -1) {
            code = code.substring(0, startIndex) + code.substring(endIndex + fallbackEnd2.length);
        }
    }
}

// Force readOnly to false so we never block the UI
code = code.replace(/const readOnly = isAnnounceOnly && !iAmAdmin;/g, 'const readOnly = false; // Never block UI, let WhatsApp API handle rejection');

fs.writeFileSync('api/whatsapp-groups.ts', code, 'utf8');
console.log("Removed fallback and disabled readOnly block");
