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
      // Attempt Serverless API
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: '91' + num, message })
      });
      
      const data = await res.json();
      if (data.success) {
        alert("? Serverless WhatsApp sent successfully!");
      } else {
        // Fallback
        window.open(\`https://wa.me/91\${num}?text=\${encodeURIComponent(message)}\`, '_blank');
      }
    } catch (error) {
      console.error(error);
      // Fallback
      window.open(\`https://wa.me/91\${num}?text=\${encodeURIComponent(message)}\`, '_blank');
    }
    setSendingWa(null);
  };`;

if (content.includes('const openWhatsApp')) {
    // using regex because tabs/newlines might not match exactly
    const regex = /const openWhatsApp = \(phone: string, name: string, due: number\) => \{[\s\S]*?window\.open\([^)]*\);\s*\};/;
    content = content.replace(regex, newStr);
    
    // Also update button text to show loading
    content = content.replace(
      "<MessageCircle size={16} /> Send Reminder",
      "{sendingWa === d.student.parentPhone?.replace(/\\D/g, '') ? 'Sending...' : <><MessageCircle size={16} /> Send Reminder</>}"
    );
    
    fs.writeFileSync('src/pages/DefaultersList.tsx', content);
    console.log("Updated Defaulters WA handler");
}
