const fs = require('fs');
let content = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');

const target = `setSendingWa(num);
          try {
        const res = await fetch('/api/send-message'`;

const replacement = `setSendingWa(num);

      if (window.location.hostname === 'localhost') {
        alert("Guru ji, Serverless WhatsApp backend 'localhost' par kaam nahi karta kyunki API Vercel par deployed hai! Kripya ise Vercel ke LIVE URL (jo dusre tab me khula hai) waha check karein.");
        setSendingWa(null);
        return;
      }
          
      try {
        const res = await fetch('/api/send-message'`;

content = content.replace(target, replacement);

fs.writeFileSync('src/pages/DefaultersList.tsx', content, 'utf8');
console.log("Warning correctly added!");
