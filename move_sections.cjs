const fs = require('fs');
let code = fs.readFileSync('src/pages/NewAdmission.tsx', 'utf-8');

code = code.replace('Basic Details</h3>', 'Student Details</h3>');

const aadharBlock = `              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Student Aadhar Number</label>
                <input type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleInputChange} className="glass-input" placeholder="0000 0000 0000" />
              </div>`;

const bloodBlock = `              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Blood Group</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="glass-input">
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>`;

// Remove them from Parent details
code = code.replace(aadharBlock + '\n', '');
code = code.replace(bloodBlock + '\n', '');
code = code.replace(aadharBlock, '');
code = code.replace(bloodBlock, '');

// Insert them into Student Details at the end of its div
const insertTarget = `                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="glass-input" placeholder="Complete residential address" />
              </div>`;
const replacement = insertTarget + '\n' + aadharBlock + '\n' + bloodBlock;

code = code.replace(insertTarget, replacement);

fs.writeFileSync('src/pages/NewAdmission.tsx', code);
