const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');

// 1. Add runningBalance logic
const targetLedgerRows = `  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const ledgerRows = sortedTransactions;`;

const newLedgerRows = `  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let currentBal = 0;
  const ledgerRows = sortedTransactions.map(t => {
    if (t.type === 'Charge') currentBal += t.amount;
    else if (t.type === 'Income' || t.type === 'Discount') currentBal -= t.amount;
    return { ...t, runningBalance: currentBal };
  });
  
  const currentDue = currentBal > 0 ? currentBal : 0;
  const currentAdvance = currentBal < 0 ? Math.abs(currentBal) : 0;`;

if (content.includes('const ledgerRows = sortedTransactions;')) {
    content = content.replace(targetLedgerRows, newLedgerRows);
}

// 2. Fix the Table Headers and Data Rows
const oldTableHead = `                        <tr>
                          <th style={{ whiteSpace: 'nowrap' }}>Date</th>
                          <th>Description</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Charge</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Paid</th>
                            <th style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>Balance</th>
                          {['Principal', 'Manager', 'Super Admin'].includes(role) && <th style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>Actions</th>}
                        </tr>`;

const newTableHead = `                        <tr>
                          <th style={{ whiteSpace: 'nowrap' }}>Date</th>
                          <th>Description</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Charge (Due)</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Paid (Cr)</th>
                          <th style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>Balance</th>
                          {['Principal', 'Manager', 'Super Admin'].includes(role) && <th style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>Actions</th>}
                        </tr>`;

if (content.includes('<th>Description</th>')) {
    content = content.replace(oldTableHead, newTableHead);
}

const oldTableRow = `                          <td style={{ color: 'var(--success)', fontWeight: 500 }}>
                            {t.type === 'Income' || t.type === 'Discount' ? \`?\${t.amount}\` : '-'}
                          </td>
                          <td style={{ textAlign: 'center' }}>`;

const newTableRow = `                          <td style={{ color: 'var(--success)', fontWeight: 500 }}>
                            {t.type === 'Income' || t.type === 'Discount' ? \`?\${t.amount}\` : '-'}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: t.runningBalance > 0 ? 'var(--danger)' : (t.runningBalance < 0 ? 'var(--success)' : 'var(--text-muted)') }}>
                            {t.runningBalance > 0 ? \`?\${t.runningBalance} Due\` : (t.runningBalance < 0 ? \`?\${Math.abs(t.runningBalance)} Adv\` : '?0')}
                          </td>
                          <td style={{ textAlign: 'center' }}>`;

if (content.includes("<td style={{ textAlign: 'center' }}>")) {
    content = content.replace(oldTableRow, newTableRow);
}

// 3. Fix the Buttons and add the Summary UI
const oldHeaderUI = `              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IndianRupee size={20} /> Financial Ledger
                </h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {availableMonths.length > 0 && (
                    <select className="glass-input" style={{ width: 'auto', padding: '8px 16px', margin: 0 }} value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                      <option value="All">All Months</option>
                      {availableMonths.map(m => (
                        <option key={m} value={m}>{new Date(m + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</option>
                      ))}
                    </select>
                  )}
                  {['Principal', 'Manager', 'Super Admin'].includes(role) && (
                    <>
                      <button className="btn-primary" style={{ background: 'var(--success)' }} onClick={() => setIsPaymentModalOpen(true)}>
                        <Plus size={16} /> Record Payment
                      </button>
                      <button className="btn-primary" style={{ background: 'var(--danger)' }} onClick={() => setIsFineModalOpen(true)}>
                        <Plus size={16} /> Add Charge
                      </button>
                    </>
                  )}
                </div>
              </div>`;

const newHeaderUI = `              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IndianRupee size={20} /> Financial Ledger
                  </h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {availableMonths.length > 0 && (
                      <select className="glass-input" style={{ width: 'auto', padding: '8px 16px', margin: 0 }} value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                        <option value="All">All Months</option>
                        {availableMonths.map(m => (
                          <option key={m} value={m}>{new Date(m + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</option>
                        ))}
                      </select>
                    )}
                    {['Principal', 'Manager', 'Super Admin'].includes(role) && (
                      <>
                        <button className="btn-primary" style={{ background: 'var(--success)' }} onClick={() => setIsPaymentModalOpen(true)}>
                          <Plus size={16} /> Receive Payment
                        </button>
                        <button className="btn-primary" style={{ background: 'var(--danger)' }} onClick={() => setIsFineModalOpen(true)}>
                          <Plus size={16} /> Add Manual Due
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '150px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 600, textTransform: 'uppercase' }}>Pending Balance</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>?{currentDue.toLocaleString()}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: '150px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600, textTransform: 'uppercase' }}>Advance Paid</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>?{currentAdvance.toLocaleString()}</span>
                  </div>
                </div>
              </div>`;

if (content.includes("Financial Ledger")) {
    // We need to be careful with replace to not break JSX
    content = content.replace(oldHeaderUI, newHeaderUI);
}

fs.writeFileSync('src/pages/StudentProfile.tsx', content);
console.log("StudentProfile.tsx updated!");
