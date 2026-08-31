const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'pages', 'Students.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /<div className="students-grid"[\s\S]*?(?=\{\/\* Class Modal \*\/})/;

const newLayout = `<div className="students-grid" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
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
                  background: 'linear-gradient(145deg, #ffffff, #f8fafc)', 
                  borderRadius: '16px', 
                  padding: '16px',
                  boxShadow: selectedStudents.includes(student.id) ? '0 0 0 2px var(--primary), 0 8px 20px rgba(37,99,235,0.15)' : '0 4px 12px rgba(0,0,0,0.03)',
                  border: selectedStudents.includes(student.id) ? '1px solid transparent' : '1px solid rgba(226, 232, 240, 0.8)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: selectedStudents.includes(student.id) ? 'translateY(-2px)' : 'none'
                }}
              >
                {/* Top Header Row: Avatar + Info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {['Principal', 'Manager', 'Super Admin'].includes(role) && (
                    <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 2 }}>
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
                        style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                      />
                    </div>
                  )}
                  
                  <Link to={['Principal', 'Manager', 'Super Admin'].includes(role) ? \`/student/\${student.id}\` : '#'} style={{ textDecoration: 'none' }}>
                    <img src={\`https://ui-avatars.com/api/?name=\${student.firstName}+\${student.lastName}&background=random\`} alt="" style={{ width: '42px', height: '42px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                  </Link>
                  
                  <div style={{ flex: 1, paddingRight: '24px', minWidth: 0 }}>
                    <Link to={['Principal', 'Manager', 'Super Admin'].includes(role) ? \`/student/\${student.id}\` : '#'} style={{ textDecoration: 'none' }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#1e293b', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {student.firstName} {student.lastName}
                      </h4>
                    </Link>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.65rem', background: '#e0e7ff', color: '#4338ca', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {student.classId}-{student.sectionId}
                      </span>
                      <span style={{ fontSize: '0.65rem', background: student.status === 'Active' ? '#dcfce7' : '#fee2e2', color: student.status === 'Active' ? '#15803d' : '#b91c1c', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {student.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Row: Roll & Adm */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', padding: '10px 12px', borderRadius: '10px', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Roll No</div>
                      <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>{student.rollNumber || '-'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Adm No</div>
                      <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>{student.admissionNo || '-'}</div>
                    </div>
                  </div>
                  
                  {['Principal', 'Manager', 'Super Admin'].includes(role) && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Link to={\`/student/\${student.id}\`} style={{ width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#3b82f6', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <Eye size={16} />
                      </Link>
                      <button onClick={() => { if(student.id) { setStudentToDelete([student.id]); setDeleteModalOpen(true); } }} style={{ width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      `;

if (regex.test(content)) {
  let newContent = content.replace(regex, newLayout);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log("Regex replacement successful.");
} else {
  console.log("Regex did not match.");
}
