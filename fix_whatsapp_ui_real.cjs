const fs = require('fs');
let content = fs.readFileSync('src/pages/SystemSettings.tsx', 'utf8');

// 1. Add import for WhatsAppSetup and MessageSquare
if (!content.includes('WhatsAppSetup')) {
    content = content.replace(
        "import { Building2, Plus, LogOut, CheckCircle2, AlertTriangle, ShieldCheck, Lock, Edit2, KeyRound, PenTool, Hash, Trash2 } from 'lucide-react';",
        "import { Building2, Plus, LogOut, CheckCircle2, AlertTriangle, ShieldCheck, Lock, Edit2, KeyRound, PenTool, Hash, Trash2, MessageSquare } from 'lucide-react';\nimport WhatsAppSetup from './WhatsAppSetup';"
    );
}

// 2. Add to tabs array
if (!content.includes("{ id: 'whatsapp'")) {
    content = content.replace(
        "    ];\n  \n    return (",
        "      { id: 'whatsapp', label: 'WhatsApp API', desc: 'Serverless Automation', icon: <MessageSquare size={20} /> }\n    ];\n  \n    return ("
    );
}

// 3. Add component render block
if (!content.includes('activeTab === \'whatsapp\'')) {
    const renderBlock = `            {activeTab === 'whatsapp' && (
              <motion.div key="whatsapp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <WhatsAppSetup />
              </motion.div>
            )}
            
            {activeTab === 'rbac' && (`;
            
    content = content.replace(
        "{activeTab === 'rbac' && (",
        renderBlock
    );
}

fs.writeFileSync('src/pages/SystemSettings.tsx', content);
console.log("Fixed SystemSettings UI rendering");
