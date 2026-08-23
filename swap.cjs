const fs = require('fs');
let code = fs.readFileSync('src/pages/NewAdmission.tsx', 'utf-8');

const genderBlock = `              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="glass-input">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>`;

const aadharBlock = `              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Student Aadhar Number</label>
                <input type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleInputChange} className="glass-input" placeholder="0000 0000 0000" />
              </div>`;

code = code.replace(genderBlock, 'PLACEHOLDER_A');
code = code.replace(aadharBlock, 'PLACEHOLDER_B');

code = code.replace('PLACEHOLDER_A', aadharBlock);
code = code.replace('PLACEHOLDER_B', genderBlock);

fs.writeFileSync('src/pages/NewAdmission.tsx', code);
