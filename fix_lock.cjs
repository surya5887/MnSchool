const fs = require('fs');
let code = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

code = code.replace(/import \{ Megaphone, Users, Search, CheckSquare, Square, Send, Loader2, MessageSquare, AlertCircle, Settings2, Languages, ShieldCheck, Folder \} from 'lucide-react';/, "import { Megaphone, Users, Search, CheckSquare, Square, Send, Loader2, MessageSquare, AlertCircle, Settings2, Languages, ShieldCheck, Folder, Lock } from 'lucide-react';");

fs.writeFileSync('src/pages/Announcements.tsx', code, 'utf8');
console.log("Lock imported");
