const fs = require('fs');
let content = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');

const targetStr = `      const num = phone.replace(/\\D/g, '');
      const message = \`Dear Parent,\\nThis is a gentle reminder from MN Public School that Rs. \${due} is currently outstanding for your ward \${name}. Kindly clear the dues at the earliest.\\nThank you.\`;
      
      setSendingWa(num);
          try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '91' + num, message })
      });`;

const replaceStr = `      // Handle country code safely
      let cleanPhone = phone.replace(/[^\\d+]/g, '');
      if (cleanPhone.startsWith('+')) {
        cleanPhone = cleanPhone.substring(1);
      } else if (cleanPhone.length === 10) {
        cleanPhone = '91' + cleanPhone; // Default to India if only 10 digits
      }
      
      const message = \`Dear Parent,\\nThis is a gentle reminder from MN Public School that Rs. \${due} is currently outstanding for your ward \${name}. Kindly clear the dues at the earliest.\\nThank you.\`;
      
      setSendingWa(cleanPhone);
      try {
        const res = await fetch('/api/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone, message })
        });`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/pages/DefaultersList.tsx', content, 'utf8');
console.log("DefaultersList fixed!");
