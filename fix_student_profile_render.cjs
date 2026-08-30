const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');

const targetStr = `{['Principal', 'Manager', 'Super Admin'].includes(role) && (
                                <button className="icon-btn" onClick={() => { setDeleteTxnId(t.id || null); setIsDeleteTxnModalOpen(true); }} style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                  <Trash2 size={16} />
                                </button>
                              )}`;

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

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    console.log("Successfully replaced action buttons.");
} else {
    console.log("Could not find targetStr");
}

// Now check if FeeReceiptPrintView was rendered at the bottom
const renderTarget = `</motion.div>
  );
};`;
const renderReplacement = `  {printTransaction && (
        <FeeReceiptPrintView 
          student={student} 
          transaction={printTransaction} 
          classNameStr={classNameMap[student.classId] || 'Unknown'} 
        />
      )}
    </motion.div>
  );
};`;

if (!content.includes('<FeeReceiptPrintView')) {
    content = content.replace(renderTarget, renderReplacement);
    console.log("Rendered FeeReceiptPrintView");
}

fs.writeFileSync('src/pages/StudentProfile.tsx', content);
