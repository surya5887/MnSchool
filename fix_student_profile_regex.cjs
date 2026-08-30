const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');

const regex = /\{\['Principal', 'Manager', 'Super Admin'\]\.includes\(role\) && \(\s*<button className="icon-btn" onClick=\{\(\) => \{ setDeleteTxnId\(t\.id \|\| null\); setIsDeleteTxnModalOpen\(true\); \}\} style=\{\{ color: 'var\(--danger\)', background: 'transparent', border: 'none', cursor: 'pointer' \}\}>\s*<Trash2 size=\{16\} \/>\s*<\/button>\s*\)\}/;

const replacementStr = `{t.type === 'Income' && (
                                <button className="icon-btn" onClick={() => handlePrintReceipt(t)} style={{ color: 'var(--primary-color)', background: 'transparent', border: 'none', cursor: 'pointer' }} title="Print Receipt">
                                  <Printer size={16} />
                                </button>
                              )}
                              {['Principal', 'Manager', 'Super Admin'].includes(role) && (
                                <button className="icon-btn" onClick={() => { setDeleteTxnId(t.id || null); setIsDeleteTxnModalOpen(true); }} style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                  <Trash2 size={16} />
                                </button>
                              )}`;

if (regex.test(content)) {
    content = content.replace(regex, replacementStr);
    console.log("Successfully replaced with regex.");
} else {
    console.log("Regex still failed to match.");
}

fs.writeFileSync('src/pages/StudentProfile.tsx', content);
