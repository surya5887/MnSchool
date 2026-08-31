const fs = require('fs');
let code = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');

const oldMap = `displayedRows.map(row => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ whiteSpace: 'nowrap', padding: '16px' }}>{new Date(row.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td style={{ padding: '16px', fontWeight: 500 }}>{row.description || row.category}</td>
                      <td style={{ color: '#ef4444', fontWeight: row.isCharge ? 700 : 400, padding: '16px' }}>{row.isCharge ? \`?\${row.amount}\` : '-'}</td>
                      <td style={{ color: '#10b981', fontWeight: !row.isCharge ? 700 : 400, padding: '16px' }}>{!row.isCharge ? \`?\${row.amount}\` : '-'}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {!row.isCharge && (
                            <button onClick={() => handlePrintReceipt(row.original)} style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                              <Printer size={14} /> Receipt
                            </button>
                          )}
                          {['Super Admin', 'Manager'].includes(role) && row.original && (
                            <button onClick={() => { setDeleteTxnId(row.original.id || null); setIsDeleteTxnModalOpen(true); }} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))`;

const newMap = `displayedRows.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ whiteSpace: 'nowrap', padding: '16px' }}>{new Date(t.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td style={{ padding: '16px', fontWeight: 500 }}>
                        {t.description || t.category}
                        {t.type === 'Discount' && <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', marginLeft: '8px', fontWeight: 700 }}>Discount</span>}
                      </td>
                      <td style={{ color: '#ef4444', fontWeight: t.type === 'Charge' ? 700 : 400, padding: '16px' }}>{t.type === 'Charge' ? \`?\${t.amount}\` : '-'}</td>
                      <td style={{ color: '#10b981', fontWeight: t.type !== 'Charge' ? 700 : 400, padding: '16px' }}>{t.type !== 'Charge' ? \`?\${t.amount}\` : '-'}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {t.type !== 'Charge' && (
                            <button onClick={() => handlePrintReceipt(t)} style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                              <Printer size={14} /> Receipt
                            </button>
                          )}
                          {['Super Admin', 'Manager'].includes(role) && (
                            <button onClick={() => { setDeleteTxnId(t.id || null); setIsDeleteTxnModalOpen(true); }} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))`;

if (code.includes(oldMap)) {
    code = code.replace(oldMap, newMap);
    fs.writeFileSync('src/pages/StudentProfile.tsx', code, 'utf8');
    console.log("Table mapping fixed.");
} else {
    console.log("Old map not found! Wait, maybe escapes?");
}
