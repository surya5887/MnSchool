const fs = require('fs');
let content = fs.readFileSync('src/pages/SystemSettings.tsx', 'utf8');

// 1. Add import
if (!content.includes('WhatsAppSetup')) {
    content = content.replace(
        "import { Save, Plus, Trash2, Edit } from 'lucide-react';",
        "import { Save, Plus, Trash2, Edit, MessageSquare } from 'lucide-react';\nimport WhatsAppSetup from './WhatsAppSetup';"
    );
}

// 2. Add Tab state type
if (!content.includes('WhatsApp API')) {
    content = content.replace(
        "const [activeTab, setActiveTab] = useState<'Core Setup' | 'Roles & Permissions'>('Core Setup');",
        "const [activeTab, setActiveTab] = useState<'Core Setup' | 'Roles & Permissions' | 'WhatsApp API'>('Core Setup');"
    );
    
    // 3. Find the exact string where Roles & Permissions tab button ends to inject our new tab
    const tabTargetRegex = /<\/button>\s*<\/div>\s*<\/div>\s*<div className="settings-content">/;
    
    const newTabHtml = `          </button>
          
          <button 
            className={\`tab-btn \${activeTab === 'WhatsApp API' ? 'active' : ''}\`}
            onClick={() => setActiveTab('WhatsApp API')}
            style={activeTab === 'WhatsApp API' ? { background: '#25D366', color: 'white' } : {}}
          >
            <div className="icon"><MessageSquare size={20} color={activeTab === 'WhatsApp API' ? 'white' : '#25D366'} /></div>
            <div className="text">
              <strong style={activeTab === 'WhatsApp API' ? {color: 'white'} : {}}>WhatsApp API</strong>
              <span style={activeTab === 'WhatsApp API' ? {color: 'rgba(255,255,255,0.9)'} : {}}>Serverless Automation</span>
            </div>
          </button>
        </div>
      </div>
      
      <div className="settings-content">`;
      
    content = content.replace(tabTargetRegex, newTabHtml);
    
    // 4. Inject the component renderer
    content = content.replace(
        "{activeTab === 'Roles & Permissions' && (",
        "{activeTab === 'WhatsApp API' && <WhatsAppSetup />}\n\n        {activeTab === 'Roles & Permissions' && ("
    );
    
    fs.writeFileSync('src/pages/SystemSettings.tsx', content);
    console.log("Successfully injected WhatsApp UI");
} else {
    console.log("WhatsApp UI already present");
}
