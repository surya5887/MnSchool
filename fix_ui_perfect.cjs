const fs = require('fs');

let content = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');

// 1. Rename Buttons
content = content.replace(/> Record Payment/g, '> Receive Payment');
content = content.replace(/> Add Charge/g, '> Add Manual Due');
content = content.replace(/title="Record Payment"/g, 'title="Receive Payment"');
content = content.replace(/>Record Payment<\/button>/g, '>Receive Payment</button>');

// 2. Add running balance logic
content = content.replace(
    'const ledgerRows = sortedTransactions;',
`let currentBal = 0;
  const ledgerRows = sortedTransactions.map(t => {
    if (t.type === 'Charge') currentBal += t.amount;
    else if (t.type === 'Income' || t.type === 'Discount') currentBal -= t.amount;
    return { ...t, runningBalance: currentBal };
  });
  
  const currentDue = currentBal > 0 ? currentBal : 0;
  const currentAdvance = currentBal < 0 ? Math.abs(currentBal) : 0;`
);

// 3. Update Table Headers
content = content.replace(
    `<th style={{ whiteSpace: 'nowrap' }}>Charge</th>`,
    `<th style={{ whiteSpace: 'nowrap' }}>Charge (Due)</th>`
);
content = content.replace(
    `<th style={{ whiteSpace: 'nowrap' }}>Paid</th>`,
    `<th style={{ whiteSpace: 'nowrap' }}>Paid (Cr)</th>`
);

// 4. Inject Summary UI specifically near the Financial Ledger section
// The section starts with: <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
const targetHeader = `<IndianRupee size={20} /> Financial Ledger\n                </h3>`;
const targetHeaderWin = `<IndianRupee size={20} /> Financial Ledger\r\n                </h3>`;

const summaryUI = `\n                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginLeft: 'auto' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600, textTransform: 'uppercase' }}>Pending</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--danger)' }}>?{typeof currentDue !== 'undefined' ? currentDue.toLocaleString() : 0}</span>
                  </div>
                  <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '8px 16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, textTransform: 'uppercase' }}>Advance</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)' }}>?{typeof currentAdvance !== 'undefined' ? currentAdvance.toLocaleString() : 0}</span>
                  </div>
                </div>`;

if (content.includes('<IndianRupee size={20} /> Financial Ledger\n')) {
    content = content.replace(targetHeader, targetHeader + summaryUI);
} else {
    content = content.replace(targetHeaderWin, targetHeaderWin + summaryUI);
}

// 5. Inject the missing Balance <td> in the mapping loop
const targetTdBlock = `{t.type === 'Income' || t.type === 'Discount' ? \`?\${t.amount}\` : '-'}
                          </td>
                          <td style={{ textAlign: 'center' }}>`;

const targetTdBlockWin = `{t.type === 'Income' || t.type === 'Discount' ? \`?\${t.amount}\` : '-'}
                          </td>\r
                          <td style={{ textAlign: 'center' }}>`;

const newTdBlock = `{t.type === 'Income' || t.type === 'Discount' ? \`?\${t.amount}\` : '-'}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: t.runningBalance > 0 ? 'var(--danger)' : (t.runningBalance < 0 ? 'var(--success)' : 'var(--text-muted)') }}>
                            {t.runningBalance > 0 ? \`?\${t.runningBalance} Due\` : (t.runningBalance < 0 ? \`?\${Math.abs(t.runningBalance)} Adv\` : '?0')}
                          </td>
                          <td style={{ textAlign: 'center' }}>`;

if (content.includes(targetTdBlock)) {
    content = content.replace(targetTdBlock, newTdBlock);
} else if (content.includes(targetTdBlockWin)) {
    content = content.replace(targetTdBlockWin, newTdBlock.replace(/\n/g, '\r\n'));
}

fs.writeFileSync('src/pages/StudentProfile.tsx', content);
console.log("Fixed!");
