const fs = require('fs');

let content = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');

// 1. Rename Buttons
content = content.replace(/Record Payment/g, 'Receive Payment');
content = content.replace(/> Add Charge/g, '> Add Manual Due');

// 2. Add running balance logic to ledgerRows
// Find:
// const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
// const ledgerRows = sortedTransactions;
const targetLedgerRows = `const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const ledgerRows = sortedTransactions;`;

const newLedgerRows = `const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let currentBal = 0;
  const ledgerRows = sortedTransactions.map(t => {
    if (t.type === 'Charge') currentBal += t.amount;
    else if (t.type === 'Income' || t.type === 'Discount') currentBal -= t.amount;
    return { ...t, runningBalance: currentBal };
  });
  
  const currentDue = currentBal > 0 ? currentBal : 0;
  const currentAdvance = currentBal < 0 ? Math.abs(currentBal) : 0;`;

content = content.replace(targetLedgerRows, newLedgerRows);

// 3. Inject Summary Cards below Financial Ledger h3
// Find:
// <IndianRupee size={20} /> Financial Ledger
// </h3>
const targetHeader = `<IndianRupee size={20} /> Financial Ledger\n                </h3>`;
const targetHeader2 = `<IndianRupee size={20} /> Financial Ledger\r\n                </h3>`;

const summaryUI = `
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginLeft: 'auto', marginRight: '20px' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600, textTransform: 'uppercase' }}>Pending</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--danger)' }}>?{typeof currentDue !== 'undefined' ? currentDue.toLocaleString() : 0}</span>
                  </div>
                  <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '8px 16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, textTransform: 'uppercase' }}>Advance</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)' }}>?{typeof currentAdvance !== 'undefined' ? currentAdvance.toLocaleString() : 0}</span>
                  </div>
                </div>`;

if (content.includes('<IndianRupee size={20} /> Financial Ledger')) {
    content = content.replace(targetHeader, targetHeader + summaryUI);
    content = content.replace(targetHeader2, targetHeader2 + summaryUI);
}

// 4. Update Table Headers
content = content.replace(
    `<th style={{ whiteSpace: 'nowrap' }}>Charge</th>`,
    `<th style={{ whiteSpace: 'nowrap' }}>Charge (Due)</th>`
);
content = content.replace(
    `<th style={{ whiteSpace: 'nowrap' }}>Paid</th>`,
    `<th style={{ whiteSpace: 'nowrap' }}>Paid (Cr)</th>`
);

// 5. Inject the missing Balance <td> in the mapping loop
// We need to find the `Paid` td and insert the Balance td after it.
// Find:
// {t.type === 'Income' || t.type === 'Discount' ? `?${t.amount}` : '-'}
// </td>
// <td style={{ textAlign: 'center' }}>
const targetTd = `{t.type === 'Income' || t.type === 'Discount' ? \`?\${t.amount}\` : '-'}
                          </td>
                          <td style={{ textAlign: 'center' }}>`;

const newTd = `{t.type === 'Income' || t.type === 'Discount' ? \`?\${t.amount}\` : '-'}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: t.runningBalance > 0 ? 'var(--danger)' : (t.runningBalance < 0 ? 'var(--success)' : 'var(--text-muted)') }}>
                            {t.runningBalance > 0 ? \`?\${t.runningBalance} Due\` : (t.runningBalance < 0 ? \`?\${Math.abs(t.runningBalance)} Adv\` : '-')}
                          </td>
                          <td style={{ textAlign: 'center' }}>`;

const targetTd2 = `{t.type === 'Income' || t.type === 'Discount' ? \`?\${t.amount}\` : '-'}
                          </td>\r
                          <td style={{ textAlign: 'center' }}>`;

const newTd2 = `{t.type === 'Income' || t.type === 'Discount' ? \`?\${t.amount}\` : '-'}
                          </td>\r
                          <td style={{ textAlign: 'right', fontWeight: 600, color: t.runningBalance > 0 ? 'var(--danger)' : (t.runningBalance < 0 ? 'var(--success)' : 'var(--text-muted)') }}>
                            {t.runningBalance > 0 ? \`?\${t.runningBalance} Due\` : (t.runningBalance < 0 ? \`?\${Math.abs(t.runningBalance)} Adv\` : '-')}
                          </td>\r
                          <td style={{ textAlign: 'center' }}>`;

content = content.replace(targetTd, newTd);
content = content.replace(targetTd2, newTd2);

fs.writeFileSync('src/pages/StudentProfile.tsx', content);
console.log("Success!");
