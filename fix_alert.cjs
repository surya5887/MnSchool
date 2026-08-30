const fs = require('fs');
let content = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');

const oldTryCatch = `    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '91' + num, message })
      });
      
      const data = await res.json();
      if (data.success) {
        alert("? Serverless WhatsApp sent successfully!");
      } else {
        window.open(\`https://wa.me/91\${num}?text=\${encodeURIComponent(message)}\`, '_blank');
      }
    } catch (error) {
      console.error(error);
      window.open(\`https://wa.me/91\${num}?text=\${encodeURIComponent(message)}\`, '_blank');
    }`;

const newTryCatch = `    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '91' + num, message })
      });
      
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        alert("Failed to parse API response. Are you running on localhost without Vercel API support? Try testing on the live Vercel URL.");
        window.open(\`https://wa.me/91\${num}?text=\${encodeURIComponent(message)}\`, '_blank');
        setSendingWa(null);
        return;
      }

      if (data.success) {
        alert("? Serverless WhatsApp sent successfully!");
      } else {
        alert("API Error: " + (data.error || JSON.stringify(data)));
        window.open(\`https://wa.me/91\${num}?text=\${encodeURIComponent(message)}\`, '_blank');
      }
    } catch (error: any) {
      alert("Network Error: " + error.message);
      console.error(error);
      window.open(\`https://wa.me/91\${num}?text=\${encodeURIComponent(message)}\`, '_blank');
    }`;

// Due to literal ? in previous replacements if it was restored, let's use a regex replace for safety
content = content.replace(/try\s*\{\s*const res = await fetch\('\/api\/send-message'[\s\S]*?catch\s*\(error\)\s*\{\s*console\.error\(error\);\s*window\.open\(`https:\/\/wa\.me\/91\$\{num\}\?text=\$\{encodeURIComponent\(message\)\}`, '_blank'\);\s*\}/, newTryCatch);

fs.writeFileSync('src/pages/DefaultersList.tsx', content, 'utf8');
