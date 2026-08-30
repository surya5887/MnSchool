const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');

// 1. Add imports
content = content.replace(
  "import { getClasses } from '../services/classService';",
  "import { getClasses } from '../services/classService';\nimport FeeReceiptPrintView from '../components/FeeReceiptPrintView';\nimport { Printer } from 'lucide-react';"
);

// 2. Add state for receipt printing
content = content.replace(
  "const [isFineModalOpen, setIsFineModalOpen] = useState(false);",
  "const [isFineModalOpen, setIsFineModalOpen] = useState(false);\n  const [printTransaction, setPrintTransaction] = useState<any>(null);"
);

// 3. Add print function
const printFunc = `
  const handlePrintReceipt = (txn: any) => {
    setPrintTransaction(txn);
    setTimeout(() => {
      window.print();
      setPrintTransaction(null);
    }, 500);
  };
`;
content = content.replace(
  "const handleRecordPayment = async (e: React.FormEvent) => {",
  printFunc + "\n  const handleRecordPayment = async (e: React.FormEvent) => {"
);

// 4. Add the Print button in the Ledger Actions column
const actionCellOld = `<td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              {['Principal', 'Manager', 'Super Admin'].includes(role) && (
                                <button className="icon-btn" onClick={() => { setDeleteTxnId(t.id || null); setIsDeleteTxnModalOpen(true); }} style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>`;

const actionCellNew = `<td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              {t.type === 'Income' && (
                                <button className="icon-btn" onClick={() => handlePrintReceipt(t)} style={{ color: 'var(--primary-color)', background: 'transparent', border: 'none', cursor: 'pointer' }} title="Print Receipt">
                                  <Printer size={16} />
                                </button>
                              )}
                              {['Principal', 'Manager', 'Super Admin'].includes(role) && (
                                <button className="icon-btn" onClick={() => { setDeleteTxnId(t.id || null); setIsDeleteTxnModalOpen(true); }} style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer' }} title="Delete">
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>`;
content = content.replace(actionCellOld, actionCellNew);

// 5. Render the FeeReceiptPrintView conditionally at the end of the return statement
content = content.replace(
  "    </motion.div>\n  );\n};",
  `      {printTransaction && (
        <FeeReceiptPrintView 
          student={student} 
          transaction={printTransaction} 
          classNameStr={classNameMap[student.classId] || 'Unknown'} 
        />
      )}
    </motion.div>
  );
};`
);

fs.writeFileSync('src/pages/StudentProfile.tsx', content);
console.log("Updated StudentProfile for Fee Receipt");
