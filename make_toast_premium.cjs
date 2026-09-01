const fs = require('fs');
let code = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');

code = code.replace(
    'toast.success("WhatsApp message sent successfully!");',
    'toast.success("WhatsApp message sent successfully!", { icon: "??", style: { background: "#25D366", color: "#fff", fontWeight: "bold" } });'
);

fs.writeFileSync('src/pages/DefaultersList.tsx', code, 'utf8');
console.log("Made WhatsApp toast premium");
