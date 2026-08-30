const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');

// Add import
content = content.replace(
    /import \{ useNavigation \} from '\.\.\/context\/NavigationContext';/,
    "import { useNavigation } from '../context/NavigationContext';\nimport PhoneInput from 'react-phone-input-2';\nimport 'react-phone-input-2/lib/style.css';"
);

const targetStr = `                  <span style={{ width: '120px', fontWeight: 500 }}>Primary Phone</span>
                  {isEditing ? 
                  <input className="glass-input" style={{flex: 1, padding: '4px 8px'}} value={editData.parentPhone || ''} onChange={e => setEditData({...editData, parentPhone: e.target.value})} placeholder="Parent Phone" /> 
                  : <span>{student.parentPhone || 'N/A'}</span>
                  }`;

const replaceStr = `                  <span style={{ width: '120px', fontWeight: 500 }}>Primary Phone</span>
                  {isEditing ? 
                  <PhoneInput
                    country={'in'}
                    value={editData.parentPhone || ''}
                    onChange={(phone) => setEditData({ ...editData, parentPhone: '+' + phone })}
                    inputClass="glass-input"
                    containerStyle={{ flex: 1 }}
                    inputStyle={{ width: '100%', background: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', paddingLeft: '48px', height: '36px', borderRadius: '8px' }}
                    buttonStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px 0 0 8px' }}
                  />
                  : <span>{student.parentPhone || 'N/A'}</span>
                  }`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/pages/StudentProfile.tsx', content, 'utf8');
console.log("PhoneInput added to StudentProfile!");
