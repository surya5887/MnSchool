const fs = require('fs');
let code = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');

// Replace using regex to ignore whitespace differences
const regex = /\{\['Super Admin', 'Manager'\]\.includes\(role\) && row && \([\s\S]*?<Trash2 size=\{14\} \/>[\s\S]*?<\/button>[\s\S]*?\)\}/;

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

if (regex.test(code)) {
    code = code.replace(regex, newActions);
    console.log("Successfully replaced via regex!");
} else {
    console.log("Regex did not match!");
}

// Fix the bad boolean logic for Receipt button
code = code.replace(/!row\.type === 'Charge'/g, "row.type !== 'Charge'");

fs.writeFileSync('src/pages/StudentProfile.tsx', code, 'utf8');
