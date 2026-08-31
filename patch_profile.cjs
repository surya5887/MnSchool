const fs = require('fs');

const filePath = 'src/pages/StudentProfile.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Update InfoBadge
const oldInfoBadge = `const InfoBadge = ({ icon, bg, label, value }: { icon: React.ReactNode, bg: string, label: string, value: string | number | undefined }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icon}
    </div>
    <div style={{ overflow: 'hidden' }}>
      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value || 'N/A'}</div>
    </div>
  </div>
);`;

const newInfoBadge = `const InfoBadge = ({ icon, bg, label, value, wrapText = false }: { icon: React.ReactNode, bg: string, label: string, value: string | number | undefined, wrapText?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icon}
    </div>
    <div style={{ overflow: 'hidden' }}>
      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 700, whiteSpace: wrapText ? 'normal' : 'nowrap', overflow: wrapText ? 'visible' : 'hidden', textOverflow: wrapText ? 'clip' : 'ellipsis', wordBreak: wrapText ? 'break-word' : 'normal' }}>{value || 'N/A'}</div>
    </div>
  </div>
);

const calculateAge = (dobString: string | undefined) => {
    if (!dobString) return '';
    const birthDate = new Date(dobString);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return \` (\${Math.abs(ageDate.getUTCFullYear() - 1970)} Yrs)\`;
};
`;

code = code.replace(oldInfoBadge, newInfoBadge);

// 2. Update DOB Age in Profile View
code = code.replace(
  `value={student.dob ? new Date(student.dob).toLocaleDateString() : ''} />`,
  `value={student.dob ? new Date(student.dob).toLocaleDateString() + calculateAge(student.dob) : ''} />`
);

// 3. Update National ID to Aadhar
code = code.replace(
  `label="National ID / Aadhar"`,
  `label="Aadhar Number"`
);

// 4. Address wrapping and Parent detailed grid
const oldParentGrid = `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              <InfoBadge icon={<User size={20} color="#2563eb" />} bg="#dbeafe" label="Father's Name" value={student.parentName} />
              <InfoBadge icon={<User size={20} color="#db2777" />} bg="#fce7f3" label="Mother's Name" value={student.motherName} />
              <InfoBadge icon={<Phone size={20} color="#16a34a" />} bg="#dcfce7" label="Primary Phone" value={student.parentPhone || student.phone} />
              <InfoBadge icon={<AlertTriangle size={20} color="#ea580c" />} bg="#ffedd5" label="Emergency Contact" value={student.emergencyContact} />
              <InfoBadge icon={<Mail size={20} color="#8b5cf6" />} bg="#ede9fe" label="Email Address" value={student.email} />
              <InfoBadge icon={<MapPin size={20} color="#0284c7" />} bg="#e0f2fe" label="Address" value={student.address} />
            </div>`;

const newParentGrid = `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              {/* Father Details */}
              <InfoBadge icon={<User size={20} color="#2563eb" />} bg="#dbeafe" label="Father's Name" value={student.parentName} />
              <InfoBadge icon={<Shield size={20} color="#2563eb" />} bg="#dbeafe" label="Father Aadhar" value={student.fatherAadhar || student.parentAadhar} />
              <InfoBadge icon={<GraduationCap size={20} color="#2563eb" />} bg="#dbeafe" label="Father Qual." value={student.fatherQualification} />
              <InfoBadge icon={<Activity size={20} color="#2563eb" />} bg="#dbeafe" label="Father Occ." value={student.fatherOccupation} />
              
              {/* Mother Details */}
              <InfoBadge icon={<User size={20} color="#db2777" />} bg="#fce7f3" label="Mother's Name" value={student.motherName} />
              <InfoBadge icon={<Shield size={20} color="#db2777" />} bg="#fce7f3" label="Mother Aadhar" value={student.motherAadhar} />
              <InfoBadge icon={<GraduationCap size={20} color="#db2777" />} bg="#fce7f3" label="Mother Qual." value={student.motherQualification} />
              <InfoBadge icon={<Activity size={20} color="#db2777" />} bg="#fce7f3" label="Mother Occ." value={student.motherOccupation} />
              
              {/* Contact Details */}
              <InfoBadge icon={<Phone size={20} color="#16a34a" />} bg="#dcfce7" label="Primary Phone" value={student.parentPhone || student.phone} />
              <InfoBadge icon={<AlertTriangle size={20} color="#ea580c" />} bg="#ffedd5" label="Emergency Contact" value={student.emergencyContact} />
              <InfoBadge icon={<Mail size={20} color="#8b5cf6" />} bg="#ede9fe" label="Email Address" value={student.email} />
              <div style={{ gridColumn: '1 / -1' }}>
                  <InfoBadge icon={<MapPin size={20} color="#0284c7" />} bg="#e0f2fe" label="Full Address" value={student.address} wrapText={true} />
              </div>
            </div>`;

code = code.replace(oldParentGrid, newParentGrid);

// 5. Fix FULL SCREEN EDIT MODAL zIndex and Background
code = code.replace(
  `zIndex: 1000,`,
  `zIndex: 99999,`
);
code = code.replace(
  `background: 'var(--bg-color)', width: '90%'`,
  `background: '#ffffff', width: '90%'`
);

// 6. Add Parent fields to Edit Modal
const oldParentEditSection = `<div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: 'var(--primary)', borderBottom: '2px solid var(--primary)', paddingBottom: '8px', display: 'inline-block' }}>Parent & Contact Details</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    <div><label>Father's Name</label><input className="glass-input" value={editData.parentName || ''} onChange={e => setEditData({...editData, parentName: e.target.value})} /></div>
                    <div><label>Mother's Name</label><input className="glass-input" value={editData.motherName || ''} onChange={e => setEditData({...editData, motherName: e.target.value})} /></div>
                    <div><label>Primary Phone</label><input className="glass-input" value={editData.parentPhone || ''} onChange={e => setEditData({...editData, parentPhone: e.target.value})} /></div>
                    <div><label>Emergency Contact</label><input className="glass-input" value={editData.emergencyContact || ''} onChange={e => setEditData({...editData, emergencyContact: e.target.value})} /></div>
                    <div><label>Email Address</label><input type="email" className="glass-input" value={editData.email || ''} onChange={e => setEditData({...editData, email: e.target.value})} /></div>
                    <div style={{ gridColumn: '1 / -1' }}><label>Full Address</label><textarea className="glass-input" style={{ width: '100%', minHeight: '80px' }} value={editData.address || ''} onChange={e => setEditData({...editData, address: e.target.value})}></textarea></div>
                  </div>
                </div>`;

const newParentEditSection = `<div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: 'var(--primary)', borderBottom: '2px solid var(--primary)', paddingBottom: '8px', display: 'inline-block' }}>Parent & Contact Details</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div><label>Father's Name</label><input className="glass-input" value={editData.parentName || ''} onChange={e => setEditData({...editData, parentName: e.target.value})} /></div>
                    <div><label>Father Aadhar</label><input className="glass-input" value={editData.fatherAadhar || ''} onChange={e => setEditData({...editData, fatherAadhar: e.target.value})} /></div>
                    <div><label>Father Qualification</label><input className="glass-input" value={editData.fatherQualification || ''} onChange={e => setEditData({...editData, fatherQualification: e.target.value})} /></div>
                    <div><label>Father Occupation</label><input className="glass-input" value={editData.fatherOccupation || ''} onChange={e => setEditData({...editData, fatherOccupation: e.target.value})} /></div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div><label>Mother's Name</label><input className="glass-input" value={editData.motherName || ''} onChange={e => setEditData({...editData, motherName: e.target.value})} /></div>
                    <div><label>Mother Aadhar</label><input className="glass-input" value={editData.motherAadhar || ''} onChange={e => setEditData({...editData, motherAadhar: e.target.value})} /></div>
                    <div><label>Mother Qualification</label><input className="glass-input" value={editData.motherQualification || ''} onChange={e => setEditData({...editData, motherQualification: e.target.value})} /></div>
                    <div><label>Mother Occupation</label><input className="glass-input" value={editData.motherOccupation || ''} onChange={e => setEditData({...editData, motherOccupation: e.target.value})} /></div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    <div><label>Primary Phone</label><input className="glass-input" value={editData.parentPhone || ''} onChange={e => setEditData({...editData, parentPhone: e.target.value})} /></div>
                    <div><label>Emergency Contact</label><input className="glass-input" value={editData.emergencyContact || ''} onChange={e => setEditData({...editData, emergencyContact: e.target.value})} /></div>
                    <div><label>Email Address</label><input type="email" className="glass-input" value={editData.email || ''} onChange={e => setEditData({...editData, email: e.target.value})} /></div>
                    <div style={{ gridColumn: '1 / -1' }}><label>Full Address</label><textarea className="glass-input" style={{ width: '100%', minHeight: '80px' }} value={editData.address || ''} onChange={e => setEditData({...editData, address: e.target.value})}></textarea></div>
                  </div>
                </div>`;

code = code.replace(oldParentEditSection, newParentEditSection);

fs.writeFileSync(filePath, code, 'utf8');
console.log("Patched successfully!");
