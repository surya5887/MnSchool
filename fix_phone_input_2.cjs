const fs = require('fs');
let content = fs.readFileSync('src/pages/NewAdmission.tsx', 'utf8');

const targetStr = `                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Contact Number</label>
                  <input type="text" name="parentPhone" value={formData.parentPhone} onChange={handleInputChange} className="glass-input" placeholder="+91 9876543210" />
                </div>`;

const replaceStr = `                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Contact Number (Country Code)</label>
                  <PhoneInput
                    country={'in'}
                    value={formData.parentPhone}
                    onChange={(phone) => setFormData({ ...formData, parentPhone: '+' + phone })}
                    inputClass="glass-input"
                    containerStyle={{ width: '100%' }}
                    inputStyle={{ width: '100%', background: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', paddingLeft: '48px', height: '42px', borderRadius: '8px' }}
                    buttonStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px 0 0 8px' }}
                  />
                </div>`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/pages/NewAdmission.tsx', content, 'utf8');
console.log("PhoneInput added!");
