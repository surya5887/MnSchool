const fs = require('fs');
let code = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');

const importToast = "import toast from 'react-hot-toast';\n";

if (!code.includes("import toast from")) {
    const importMatch = code.match(/import .* from 'lucide-react';/);
    if (importMatch) {
        code = code.replace(importMatch[0], importMatch[0] + '\n' + importToast);
    } else {
        code = importToast + code;
    }
}

// Replace alert("...") with toast("...") or toast.error("...") or toast.success("...")
code = code.replace(/alert\("No phone number available for this student\."\);/g, 'toast.error("No phone number available for this student.");');
code = code.replace(/alert\("Guru ji, Serverless WhatsApp API 'localhost' par kaam nahi karti kyunki serverless functions Vercel par host hain! Kripya ise aapke LIVE URL par check karein jo apne dusre tab me khol rakha hai\."\);/g, 'toast.error("Vercel Serverless API cannot run on localhost. Please use the live URL.");');
code = code.replace(/alert\("Serverless Error \(Vercel\): Failed to parse API response. Please check Vercel Logs. Details: " \+ parseErr\);/g, 'toast.error("Failed to parse API response: " + parseErr);');
code = code.replace(/alert\("? Serverless WhatsApp sent successfully!"\);/g, 'toast.success("WhatsApp message sent successfully!");');
code = code.replace(/alert\("API Error: " \+ \(data\.error \|\| JSON\.stringify\(data\)\)\);/g, 'toast.error("API Error: " + (data.error || JSON.stringify(data)));');
code = code.replace(/alert\("Network Error: " \+ error\.message\);/g, 'toast.error("Network Error: " + error.message);');

fs.writeFileSync('src/pages/DefaultersList.tsx', code, 'utf8');
console.log("Replaced alerts with toast in DefaultersList.tsx");
