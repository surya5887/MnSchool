const fs = require('fs');
let content = fs.readFileSync('src/pages/SystemSettings.tsx', 'utf8');

if (!content.includes('WhatsAppSetup')) {
  // Add import
  content = content.replace(
    "import { Save, Plus, Trash2, Edit } from 'lucide-react';",
    "import { Save, Plus, Trash2, Edit, MessageSquare } from 'lucide-react';\nimport WhatsAppSetup from './WhatsAppSetup';"
  );
  
  // Add tab state
  content = content.replace(
    "const [activeTab, setActiveTab] = useState<'Core Setup' | 'Roles & Permissions'>('Core Setup');",
    "const [activeTab, setActiveTab] = useState<'Core Setup' | 'Roles & Permissions' | 'WhatsApp API'>('Core Setup');"
  );
  
  // Add tab button
  const tabButtonStr = `          <button 
            className={\`tab-btn \${activeTab === 'Roles & Permissions' ? 'active' : ''}\`}
            onClick={() => setActiveTab('Roles & Permissions')}
          >
            <div className="icon"><Shield size={20} /></div>
            <div className="text">
              <strong>Roles & Permissions</strong>
              <span>System access & restrictions</span>
            </div>
          </button>`;
          
  const newTabButtonStr = tabButtonStr + `
          
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
          </button>`;
          
  // We need to use regex because the icon might be Shield or something else
  content = content.replace(
    /<\/div>\s*<\/button>\s*<\/div>\s*<\/div>\s*<div className="settings-content">/s,
    `</div>
          </button>
          
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
      
      <div className="settings-content">`
  );
  
  // Render component
  content = content.replace(
    "{activeTab === 'Roles & Permissions' && (",
    "{activeTab === 'WhatsApp API' && <WhatsAppSetup />}\n\n        {activeTab === 'Roles & Permissions' && ("
  );
  
  fs.writeFileSync('src/pages/SystemSettings.tsx', content);
  console.log("Updated System Settings");
}
