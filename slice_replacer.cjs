const fs = require('fs');
let code = fs.readFileSync('src/pages/Students.tsx', 'utf8');

code = code.replace(/minmax\(280px, 1fr\)/g, 'minmax(250px, 1fr)');
code = code.replace(/gap: '20px'/g, "gap: '16px'");
code = code.replace(/padding: '24px'/g, "padding: '20px'");

const startStr = `            ) : filteredStudents.map((student, index) => (`;
const endStr = `              </motion.div>
            ))}
          </div>
        </div>`;

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if(startIndex !== -1 && endIndex !== -1){
  const replacement = `            ) : filteredStudents.map((student, index) => (
              <motion.div 
                key={student.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
                style={{ 
                  background: 'linear-gradient(145deg, #ffffff, #f8fafc)', 
                  borderRadius: '16px', 
                  padding: '16px',
                  boxShadow: selectedStudents.includes(student.id as string) ? '0 0 0 2px var(--primary), 0 8px 20px rgba(37,99,235,0.15)' : '0 4px 12px rgba(0,0,0,0.03)',
                  border: selectedStudents.includes(student.id as string) ? '1px solid transparent' : '1px solid rgba(226, 232, 240, 0.8)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: selectedStudents.includes(student.id as string) ? 'translateY(-2px)' : 'none'
                }}
              >
                {/* Top Header Row: Avatar + Info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {['Principal', 'Manager', 'Super Admin'].includes(role) && (
                    <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 2 }}>
                      <input 
                        type="checkbox" 
                        checked={selectedStudents.includes(student.id as string)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, student.id as string]);
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
        </div>`;

  code = code.substring(0, startIndex) + replacement + code.substring(endIndex + endStr.length);
  fs.writeFileSync('src/pages/Students.tsx', code, 'utf8');
  console.log("Sliced and replaced successfully!");
} else {
  console.log("Start or end not found.", startIndex, endIndex);
  
  // if crlf is causing issues, normalize to lf and try again
  code = code.replace(/\r\n/g, '\n');
  const startIdx = code.indexOf(startStr.replace(/\r\n/g, '\n'));
  const endIdx = code.indexOf(endStr.replace(/\r\n/g, '\n'));
  console.log("With LF:", startIdx, endIdx);
  if(startIdx !== -1 && endIdx !== -1) {
     const replacementLF = `            ) : filteredStudents.map((student, index) => (
              <motion.div 
                key={student.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
                style={{ 
                  background: 'linear-gradient(145deg, #ffffff, #f8fafc)', 
                  borderRadius: '16px', 
                  padding: '16px',
                  boxShadow: selectedStudents.includes(student.id as string) ? '0 0 0 2px var(--primary), 0 8px 20px rgba(37,99,235,0.15)' : '0 4px 12px rgba(0,0,0,0.03)',
                  border: selectedStudents.includes(student.id as string) ? '1px solid transparent' : '1px solid rgba(226, 232, 240, 0.8)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: selectedStudents.includes(student.id as string) ? 'translateY(-2px)' : 'none'
                }}
              >
                {/* Top Header Row: Avatar + Info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {['Principal', 'Manager', 'Super Admin'].includes(role) && (
                    <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 2 }}>
                      <input 
                        type="checkbox" 
                        checked={selectedStudents.includes(student.id as string)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, student.id as string]);
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
        </div>`;
     code = code.substring(0, startIdx) + replacementLF + code.substring(endIdx + endStr.replace(/\r\n/g, '\n').length);
     fs.writeFileSync('src/pages/Students.tsx', code, 'utf8');
     console.log("Replaced with LF fallback!");
  }
}
