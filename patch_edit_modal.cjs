const fs = require('fs');
let code = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');

// 1. Inject States
const oldStateHook = "const [deleteTxnError, setDeleteTxnError] = useState('');";
const editTxnStates = `
  const [isEditTxnModalOpen, setIsEditTxnModalOpen] = useState(false);
  const [editTxnPassword, setEditTxnPassword] = useState('');
  const [editTxnError, setEditTxnError] = useState('');
  const [editTxnData, setEditTxnData] = useState<any>(null);
`;
if(code.includes(oldStateHook) && !code.includes('isEditTxnModalOpen = useState')) {
    code = code.replace(oldStateHook, oldStateHook + editTxnStates);
}

// 2. Inject Modal JSX
const deleteModalRegex = /<Modal isOpen=\{isDeleteTxnModalOpen\}[\s\S]*?<\/Modal>/;

const editModal = `
        {/* EDIT TXN MODAL */}
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

const match = code.match(deleteModalRegex);
if(match && !code.includes('EDIT TXN MODAL')) {
    code = code.replace(match[0], match[0] + "\n" + editModal);
}

fs.writeFileSync('src/pages/StudentProfile.tsx', code, 'utf8');
console.log("Patched states and modal!");
