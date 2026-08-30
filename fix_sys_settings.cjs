const fs = require('fs');
let content = fs.readFileSync('src/pages/SystemSettings.tsx', 'utf8');

// 1. Add name to editAdminData state
content = content.replace(
  "const [editAdminData, setEditAdminData] = useState({ email: '', password: '' });",
  "const [editAdminData, setEditAdminData] = useState({ name: '', email: '', password: '' });"
);

// 2. Add Name input field in the edit form
const emailInputHtml = `<div style={{ flex: 1, minWidth: '200px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Email Address</label>
                                <input 
                                  type="email"`;

const newNameInputHtml = `<div style={{ flex: 1, minWidth: '200px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Full Name</label>
                                <input 
                                  type="text" 
                                  className="glass-input" 
                                  style={{ padding: '10px 16px', borderRadius: '12px', width: '100%' }}
                                  value={editAdminData.name}
                                  onChange={e => setEditAdminData({...editAdminData, name: e.target.value})}
                                  placeholder="New Name"
                                />
                              </div>\n                              ` + emailInputHtml;
                              
content = content.replace(emailInputHtml, newNameInputHtml);

// 3. Update the function call
content = content.replace(
  "await updateAdminCredentials(admin.id, editAdminData.email, editAdminData.password);",
  "await updateAdminCredentials(admin.id, editAdminData.email, editAdminData.name, editAdminData.password);"
);

// 4. Update the initialization of edit state
content = content.replace(
  "setEditAdminData({ email: admin.email, password: '' });",
  "setEditAdminData({ name: admin.name || '', email: admin.email, password: '' });"
);

fs.writeFileSync('src/pages/SystemSettings.tsx', content);
console.log("Fixed SystemSettings");
