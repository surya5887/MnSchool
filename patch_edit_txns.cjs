const fs = require('fs');
let code = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');

// 1. Rename "Add Charge" to "Add Manual Dues"
code = code.replace('<Plus size={18} /> Add Charge', '<Plus size={18} /> Add Manual Dues');

// 2. Add Edit Transaction States right after deleteTxn states
const deleteTxnStates = `const [deleteTxnId, setDeleteTxnId] = useState<string | null>(null);
  const [isDeleteTxnModalOpen, setIsDeleteTxnModalOpen] = useState(false);
  const [deleteTxnPassword, setDeleteTxnPassword] = useState('');
  const [deleteTxnError, setDeleteTxnError] = useState('');`;

const editTxnStates = `
  const [isEditTxnModalOpen, setIsEditTxnModalOpen] = useState(false);
  const [editTxnPassword, setEditTxnPassword] = useState('');
  const [editTxnError, setEditTxnError] = useState('');
  const [editTxnData, setEditTxnData] = useState<any>(null);
`;
if(code.includes(deleteTxnStates) && !code.includes('isEditTxnModalOpen')) {
    code = code.replace(deleteTxnStates, deleteTxnStates + editTxnStates);
}

// 3. Import updateTransaction if not there
if(code.includes("import { getTransactions, addTransaction, deleteTransaction") && !code.includes("updateTransaction")) {
    code = code.replace("deleteTransaction,", "deleteTransaction, updateTransaction,");
}

// 4. Add handleEditTransaction
const handleDeleteTransactionCode = `const handleDeleteTransaction = async (e: React.FormEvent) => {`;
const handleEditTransactionCode = `
  const handleEditTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editTxnPassword !== 'admin@8393') {
      setEditTxnError('Incorrect admin password.');
      return;
    }
    if (!editTxnData || !editTxnData.id) return;

    try {
      await updateTransaction(editTxnData.id, {
        amount: Number(editTxnData.amount),
        description: editTxnData.description,
        date: editTxnData.date
      });
      setIsEditTxnModalOpen(false);
      setEditTxnData(null);
      setEditTxnPassword('');
      setEditTxnError('');
      const txns = await getTransactions({ studentId: id! });
      setTransactions(txns);
    } catch (error) {
      console.error(error);
      setEditTxnError('Failed to update transaction.');
    }
  };

`;
if(code.includes(handleDeleteTransactionCode) && !code.includes('handleEditTransaction =')) {
    code = code.replace(handleDeleteTransactionCode, handleEditTransactionCode + handleDeleteTransactionCode);
}

// 5. Update Table Actions
const oldActions = `{['Super Admin', 'Manager'].includes(role) && (
                            <button onClick={() => { setDeleteTxnId(t.id || null); setIsDeleteTxnModalOpen(true); }} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          )}`;
const newActions = `{['Principal', 'Manager', 'Super Admin'].includes(role) && (
                            <>
                              <button onClick={() => { setEditTxnData(t); setIsEditTxnModalOpen(true); }} style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Edit">
                                <Edit size={14} />
                              </button>
                              <button onClick={() => { setDeleteTxnId(t.id || null); setIsDeleteTxnModalOpen(true); }} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}`;
if(code.includes(oldActions)) {
    code = code.replace(oldActions, newActions);
}

// 6. Add Edit Modal next to Delete Modal
const deleteModal = `<Modal isOpen={isDeleteTxnModalOpen} onClose={() => { setIsDeleteTxnModalOpen(false); setDeleteTxnId(null); setDeleteTxnError(''); }} title="Delete Transaction">
          <form onSubmit={handleDeleteTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="alert-warning" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
              Warning: This action cannot be undone and will affect financial reports.
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Admin Password</label>
              <input required type="password" className="glass-input" value={deleteTxnPassword} onChange={e => setDeleteTxnPassword(e.target.value)} placeholder="Enter admin password" />
              {deleteTxnError && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>{deleteTxnError}</p>}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="button" className="btn-secondary" onClick={() => setIsDeleteTxnModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ background: 'var(--danger)' }}>Delete Permanently</button>
            </div>
          </form>
        </Modal>`;

const editModal = `
        <Modal isOpen={isEditTxnModalOpen} onClose={() => { setIsEditTxnModalOpen(false); setEditTxnData(null); setEditTxnError(''); }} title="Edit Transaction">
          {editTxnData && (
            <form onSubmit={handleEditTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Amount</label>
                <input required type="number" className="glass-input" value={editTxnData.amount || ''} onChange={e => setEditTxnData({...editTxnData, amount: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Description</label>
                <input required type="text" className="glass-input" value={editTxnData.description || ''} onChange={e => setEditTxnData({...editTxnData, description: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Date</label>
                <input required type="datetime-local" className="glass-input" value={editTxnData.date ? editTxnData.date.substring(0,16) : ''} onChange={e => setEditTxnData({...editTxnData, date: e.target.value})} />
              </div>
              <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Admin Password to Save</label>
                <input required type="password" className="glass-input" value={editTxnPassword} onChange={e => setEditTxnPassword(e.target.value)} placeholder="Enter admin password" />
                {editTxnError && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>{editTxnError}</p>}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsEditTxnModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: '#d97706' }}>Save Changes</button>
              </div>
            </form>
          )}
        </Modal>
`;

if(code.includes(deleteModal) && !code.includes('isEditTxnModalOpen} onClose')) {
    code = code.replace(deleteModal, deleteModal + editModal);
}

fs.writeFileSync('src/pages/StudentProfile.tsx', code, 'utf8');
console.log('Patch complete.');
