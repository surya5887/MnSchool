const fs = require('fs');
let code = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');

const oldActions = `{['Super Admin', 'Manager'].includes(role) && row && (
                              <button onClick={() => { setDeleteTxnId(row.id || null); setIsDeleteTxnModalOpen(true); }} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                                <Trash2 size={14} />
                              </button>
                            )}`;
                            
const newActions = `{['Principal', 'Manager', 'Super Admin'].includes(role) && row && (
                              <>
                                <button onClick={() => { setEditTxnData(row); setIsEditTxnModalOpen(true); }} style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Edit">
                                  <Edit size={14} />
                                </button>
                                <button onClick={() => { setDeleteTxnId(row.id || null); setIsDeleteTxnModalOpen(true); }} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Delete">
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}`;

code = code.replace(oldActions, newActions);

// Fix the bad boolean logic for Receipt button
code = code.replace(/!row\.type === 'Charge'/g, "row.type !== 'Charge'");

fs.writeFileSync('src/pages/StudentProfile.tsx', code, 'utf8');
console.log("Patched actions!");
