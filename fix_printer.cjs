const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');

content = content.replace(
  "import { IndianRupee, Plus, FileText, AlertTriangle, ArrowLeft, Camera, X, Edit, Save, Trash2 } from 'lucide-react';",
  "import { IndianRupee, Plus, FileText, AlertTriangle, ArrowLeft, Camera, X, Edit, Save, Trash2, Printer } from 'lucide-react';"
);

fs.writeFileSync('src/pages/StudentProfile.tsx', content);
console.log("Fixed printer import");
