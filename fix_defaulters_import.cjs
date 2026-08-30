const fs = require('fs');
let content = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');

content = content.replace(
  "import { AlertCircle, IndianRupee, MessageCircle, Phone, Search } from 'lucide-react';",
  "import { AlertCircle, IndianRupee, MessageCircle, Phone, Search, CheckCircle2 } from 'lucide-react';"
);

fs.writeFileSync('src/pages/DefaultersList.tsx', content);
console.log("Fixed import");
