const fs = require('fs');
let content = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');

const targetStr = `  const openWhatsApp = (phone: string, name: string, due: number) => {
    if (!phone) return alert("No phone number available for this student.");
    const num = phone.replace(/\\D/g, '');
    const message = \`Dear Parent,\\nThis is a gentle reminder from MN Public School that Rs. \${due} is currently outstanding for your ward \${name}. Kindly clear the dues at the earliest.\\nThank you.\`;
    window.open(\`https://wa.me/91\${num}?text=\${encodeURIComponent(message)}\`, '_blank');
  };`;

const newStr = `  const [sendingWa, setSendingWa] = useState<string | null>(null);

  const openWhatsApp = async (phone: string, name: string, due: number) => {
    if (!phone) return alert("No phone number available for this student.");
    const num = phone.replace(/\\D/g, '');
    const message = \`Dear Parent,\\nThis is a gentle reminder from MN Public School that Rs. \${due} is currently outstanding for your ward \${name}. Kindly clear the dues at the earliest.\\nThank you.\`;
    
    setSendingWa(num);
    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: '91' + num, message })
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
    }
    setSendingWa(null);
  };`;

// Use simple split/join if exact match fails
if (content.includes('const openWhatsApp = (phone: string, name: string, due: number) => {')) {
    const parts = content.split('const openWhatsApp = (phone: string, name: string, due: number) => {');
    const parts2 = parts[1].split("'_blank');\n  };");
    
    if(parts2.length > 1) {
       content = parts[0] + newStr + parts2[1];
       fs.writeFileSync('src/pages/DefaultersList.tsx', content);
       console.log("Successfully replaced");
    }
}
