const fs = require('fs');
let content = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');

const warningCode = `if (window.location.hostname === 'localhost') {
      alert("Guru ji, Serverless WhatsApp API localhost par kaam nahi karti! Kripya Vercel ke LIVE URL (mn-school.vercel.app) par check karein.");
      setSendingWa(null);
      return;
    }
    
    try {`;

content = content.replace("try {", warningCode);

fs.writeFileSync('src/pages/DefaultersList.tsx', content, 'utf8');
console.log("Warning added!");
