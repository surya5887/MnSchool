const fs = require('fs');
let code = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

if(!code.includes('feeReminderTemplate')) {
    // Add imports and state
    code = code.replace(/import \{ motion \} from 'framer-motion';/, "import { motion } from 'framer-motion';\nimport { getSchoolSettings, saveSchoolSettings, SchoolSettingsData } from '../services/settingsService';");
    
    const stateHook = `  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Settings for templates
  const [settings, setSettings] = useState<SchoolSettingsData | null>(null);
  const [feeTemplate, setFeeTemplate] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const templateRef = useRef<HTMLTextAreaElement>(null);`;
  
    code = code.replace(/  const textareaRef = useRef<HTMLTextAreaElement>\(null\);/, stateHook);

    const useEf = `useEffect(() => {
    fetchGroups();
    
    // Load Settings
    const loadSettings = async () => {
      const data = await getSchoolSettings();
      setSettings(data);
      const defaultTemplate = \`Dear Parent,\\nThis is a gentle reminder from MN Public School that Rs. {{due}} is currently outstanding for your ward {{name}}. Kindly clear the dues at the earliest.\\nThank you.\`;
      if (data.feeReminderTemplate) {
        setFeeTemplate(data.feeReminderTemplate);
      } else {
        setFeeTemplate(defaultTemplate);
      }
    };
    loadSettings();
  }, []);`;

    code = code.replace(/  useEffect\(\(\) => \{\r?\n\s*fetchGroups\(\);\r?\n\s*\}, \[\]\);/, useEf);

    const handlers = `  const saveTemplate = async () => {
    if (!settings) return;
    setIsSavingTemplate(true);
    await saveSchoolSettings({ ...settings, feeReminderTemplate: feeTemplate });
    setIsSavingTemplate(false);
    toast.success('Fee Reminder Template Saved!');
  };

  const selectableGroups`;
    code = code.replace(/  const selectableGroups/, handlers);

    const templateUI = `      </div>

      {/* Automated Fee Reminder Template */}
      <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginTop: '8px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <Settings2 size={22} color="#f59e0b" /> Automated Fee Reminder Template
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
          This exact message will be dynamically personalized and sent to parents. You can use placeholders like <b>{{name}}</b> for student name and <b>{{due}}</b> for the due amount.
        </p>
        
        <textarea 
          ref={templateRef}
          value={feeTemplate}
          onChange={(e) => setFeeTemplate(e.target.value)}
          placeholder="Dear Parent, this is a reminder that fees are due for the current month..."
          style={{ 
            width: '100%', minHeight: '120px', padding: '20px', borderRadius: '16px', 
            boxSizing: 'border-box', resize: 'vertical', fontSize: '1rem',
            border: '2px solid #e2e8f0', background: '#fafafa', outline: 'none', color: '#334155'
          }}
          onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
          onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
        />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button 
            onClick={saveTemplate} 
            disabled={isSavingTemplate || feeTemplate === settings?.feeReminderTemplate}
            style={{ 
              padding: '12px 28px', background: (isSavingTemplate || feeTemplate === settings?.feeReminderTemplate) ? '#f1f5f9' : '#0f172a',
              color: (isSavingTemplate || feeTemplate === settings?.feeReminderTemplate) ? '#94a3b8' : 'white', 
              border: 'none', borderRadius: '14px', fontWeight: 600, fontSize: '1rem',
              cursor: (isSavingTemplate || feeTemplate === settings?.feeReminderTemplate) ? 'default' : 'pointer',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            {isSavingTemplate ? <Loader2 size={18} className="spin" /> : null}
            {isSavingTemplate ? 'Saving...' : 'Save Default Template'}
          </button>
        </div>
      </div>
      
      <style>{`;
    
    code = code.replace(/      <\/div>\r?\n\s*\r?\n\s*<style>\{/, templateUI);

    fs.writeFileSync('src/pages/Announcements.tsx', code, 'utf8');
    console.log("Template restored!");
}
