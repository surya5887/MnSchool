const fs = require('fs');
let content = fs.readFileSync('src/pages/FinancialAutomation.tsx', 'utf8');
content = content.replace(
  "import { Settings, PlayCircle, CheckCircle2, AlertTriangle, MessageSquare, IndianRupee, Clock, Zap } from 'lucide-react';",
  "import { PlayCircle, CheckCircle2, AlertTriangle, MessageSquare, Clock, Zap } from 'lucide-react';"
);
fs.writeFileSync('src/pages/FinancialAutomation.tsx', content);
