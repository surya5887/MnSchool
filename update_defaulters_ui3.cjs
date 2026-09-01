const fs = require('fs');
let code = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');

const tableStart = `<div className="glass-table-container">`;
const tableEndIndex = code.indexOf('</table>');

if (code.includes(tableStart) && tableEndIndex !== -1) {
    const beforeTable = code.substring(0, code.indexOf(tableStart));
    
    // Find the closing div of glass-table-container
    const remaining = code.substring(tableEndIndex + '</table>'.length);
    const divEnd = remaining.indexOf('</div>');
    const fullEndIndex = tableEndIndex + '</table>'.length + divEnd + '</div>'.length;

    const afterTable = code.substring(fullEndIndex);
    
    // Extract the exact table code
    const originalTable = code.substring(code.indexOf(tableStart), fullEndIndex);
    
    const newTableWrapper = originalTable.replace(
        '<div className="glass-table-container">',
        '<div className="glass-table-container desktop-only">'
    );
    
    const mobileCards = `
            <div className="mobile-only">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredDefaulters.map((d) => (
                  <div key={d.student.id} style={{ 
                    background: 'rgba(255, 255, 255, 0.6)', 
                    border: '1px solid var(--glass-border)', 
                    borderRadius: '16px', 
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', fontWeight: 'bold', flexShrink: 0, fontSize: '1.2rem' }}>
                            {d.student.firstName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem' }}>{d.student.firstName} {d.student.lastName}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', color: '#475569', fontWeight: 500, marginRight: '6px' }}>{d.className}</span>
                              Roll: {d.student.rollNumber || 'N/A'}
                            </div>
                          </div>
                       </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef2f2', padding: '12px', borderRadius: '12px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b91c1c', fontWeight: 600, fontSize: '0.9rem' }}>
                          <AlertCircle size={16} /> Due Amount
                       </div>
                       <div style={{ fontWeight: 700, color: '#b91c1c', fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>
                          <IndianRupee size={16} />{d.totalDue.toLocaleString()}
                       </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <Phone size={14} /> {d.student.parentPhone || 'N/A'}
                      </div>
                      <button 
                        onClick={() => openWhatsApp(d.student.parentPhone || '', \`\${d.student.firstName} \${d.student.lastName}\`, d.totalDue)}
                        style={{ 
                          background: sendingWa === d.student.parentPhone?.replace(/\\D/g, '') ? '#e2e8f0' : '#25D366', 
                          color: sendingWa === d.student.parentPhone?.replace(/\\D/g, '') ? '#64748b' : 'white', 
                          border: 'none', padding: '10px 20px', 
                          borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', 
                          cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                          boxShadow: sendingWa === d.student.parentPhone?.replace(/\\D/g, '') ? 'none' : '0 4px 12px rgba(37, 211, 102, 0.3)'
                        }}
                      >
                        {sendingWa === d.student.parentPhone?.replace(/\\D/g, '') ? 'Sending...' : <><MessageCircle size={18} /> Send</>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>`;
    
    fs.writeFileSync('src/pages/DefaultersList.tsx', beforeTable + `\n            <>\n` + newTableWrapper + `\n` + mobileCards + `\n            </>` + afterTable, 'utf8');
    console.log("DefaultersList updated with mobile cards");
} else {
    console.log("Could not find table boundaries");
}
