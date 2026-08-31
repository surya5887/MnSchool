const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'pages', 'ClassDetails.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const startStr = '<div className="glass-table-container">';
const startIndex = content.indexOf(startStr);

// Find the <style> block which is right after the table's enclosing divs
const styleStr = '<style>{`';
const styleIndex = content.indexOf(styleStr, startIndex);

if (startIndex !== -1 && styleIndex !== -1) {
  // We want to replace everything from <div className="glass-table-container"> up to just before <style>{`
  // But wait, there are closing </div>s. We should extract them or safely replace.
  // The layout is:
  // <div className="glass-table-container"> ... </table> </div> </div> <style>
  
  const newLayout = `<div className="students-grid" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
            {sectionStudents.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No students found in Section {activeSection}.
              </div>
            ) : sectionStudents.map((student, idx) => (
              <motion.div 
                key={student.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                onClick={() => navigate(\`/students/\${student.id}\`)}
                style={{ 
                  background: 'linear-gradient(145deg, #ffffff, #f8fafc)', 
                  borderRadius: '16px', 
                  padding: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
                }}
              >
                {/* Top Header Row: Avatar + Info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <img src={student.photoUrl || \`https://ui-avatars.com/api/?name=\${student.firstName}+\${student.lastName}&background=random\`} alt={student.firstName} style={{ width: '42px', height: '42px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#1e293b', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {student.firstName} {student.lastName}
                    </h4>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.65rem', background: '#e0e7ff', color: '#4338ca', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {student.gender || 'Unknown'}
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
                  
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={(e) => { e.stopPropagation(); navigate(\`/students/\${student.id}\`); }} style={{ width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#3b82f6', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      `;

  const cssInjection = `<style>{\`
        @media (max-width: 768px) {
          .students-grid {
            grid-template-columns: 1fr !important;
            padding: 16px !important;
          }
        }
`;
        
  let newContent = content.substring(0, startIndex) + newLayout + content.substring(styleIndex).replace('<style>{`', cssInjection);
  
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log("Class details table replaced with grid!");
} else {
  console.log("Could not find start or style index.");
}
