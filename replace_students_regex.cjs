const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'pages', 'Students.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /<div className="glass-table-container">[\s\S]*?<\/table>\s*<\/div>\s*<\/div>/;

const newLayout = `          {/* Select All Controls for Admin */}
          {['Principal', 'Manager', 'Super Admin'].includes(role) && filteredStudents.length > 0 && (
            <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.4)' }}>
              <input 
                type="checkbox" 
                checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedStudents(filteredStudents.map(s => s.id).filter(Boolean));
                  } else {
                    setSelectedStudents([]);
                  }
                }}
                style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Select All Students</span>
              {selectedStudents.length > 0 && (
                 <span style={{ marginLeft: 'auto', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>{selectedStudents.length} selected</span>
              )}
            </div>
          )}

          <div className="students-grid" style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {loading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Loading students...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No students found matching your criteria.
              </div>
            ) : filteredStudents.map((student, index) => (
              <motion.div 
                key={student.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
                style={{ 
                  background: 'white', 
                  borderRadius: '16px', 
                  padding: '20px',
                  boxShadow: selectedStudents.includes(student.id) ? '0 0 0 2px var(--primary), 0 4px 12px rgba(37,99,235,0.1)' : '0 2px 12px rgba(0,0,0,0.04)',
                  border: '1px solid var(--glass-border)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'all 0.2s',
                  transform: selectedStudents.includes(student.id) ? 'translateY(-2px)' : 'none'
                }}
              >
                {['Principal', 'Manager', 'Super Admin'].includes(role) && (
                  <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 2 }}>
                    <input 
                      type="checkbox" 
                      checked={selectedStudents.includes(student.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents([...selectedStudents, student.id]);
                        } else {
                          setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                        }
                      }}
                      style={{ cursor: 'pointer', width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                    />
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingRight: '24px' }}>
                  <img src={\`https://ui-avatars.com/api/?name=\${student.firstName}+\${student.lastName}&background=random\`} alt="" style={{ width: '56px', height: '56px', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <div>
                    {['Principal', 'Manager', 'Super Admin'].includes(role) ? (
                      <Link to={\`/student/\${student.id}\`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.2 }}>{student.firstName} {student.lastName}</h4>
                      </Link>
                    ) : (
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.2 }}>{student.firstName} {student.lastName}</h4>
                    )}
                    <span className={\`badge \${student.status === 'Active' ? 'success' : 'danger'}\`} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '100px' }}>
                      {student.status || 'Active'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-light)', padding: '16px', borderRadius: '12px', marginTop: '4px', border: '1px solid rgba(0,0,0,0.02)' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Class</div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>{student.classId} - {student.sectionId}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Roll No</div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>{student.rollNumber || '-'}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Admission No</div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>{student.admissionNo || '-'}</div>
                  </div>
                </div>

                {['Principal', 'Manager', 'Super Admin'].includes(role) && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '8px' }}>
                    <Link to={\`/student/\${student.id}\`} className="btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '0.95rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', textDecoration: 'none', background: 'white', border: '1px solid var(--glass-border)' }}>
                      <Eye size={18} /> View Profile
                    </Link>
                    <button onClick={() => { if(student.id) { setStudentToDelete([student.id]); setDeleteModalOpen(true); } }} style={{ width: '42px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.08)', border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>`;

if (regex.test(content)) {
  let newContent = content.replace(regex, newLayout);
  const cssInjection = `      {/* Secure Delete Modal */}
      <style>{\`
        @media (max-width: 768px) {
          .students-grid {
            grid-template-columns: 1fr !important;
            padding: 16px !important;
          }
        }
      \`}</style>`;
  newContent = newContent.replace('      {/* Secure Delete Modal */}', cssInjection);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log("Regex replacement successful.");
} else {
  console.log("Regex did not match.");
}
