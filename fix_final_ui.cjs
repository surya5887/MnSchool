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
// Find the exact line: <IndianRupee size={20} className="text-primary" /> Financial Ledger
// And the </h3> after it.
const summaryUI = `</h3>
              
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <div style={{ flex: 1, minWidth: '150px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 600, textTransform: 'uppercase' }}>Pending Balance</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>?{typeof currentDue !== 'undefined' ? currentDue.toLocaleString() : 0}</span>
                </div>
                <div style={{ flex: 1, minWidth: '150px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600, textTransform: 'uppercase' }}>Advance Paid</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>?{typeof currentAdvance !== 'undefined' ? currentAdvance.toLocaleString() : 0}</span>
                </div>
              </div>
`;

content = content.replace(
  /<IndianRupee size=\{20\} className="text-primary" \/> Financial Ledger\s*<\/h3>/m,
  `<IndianRupee size={20} className="text-primary" /> Financial Ledger` + summaryUI
);


// 5. Inject the missing Balance <td> in the mapping loop
const matchTd = /<td style=\{\{\s*color:\s*'var\(--success\)',\s*fontWeight:\s*500\s*\}\}>[\s\S]*?<\/td>\s*<td style=\{\{\s*textAlign:\s*'center'\s*\}\}>/m;

content = content.replace(matchTd, (match) => {
    return match.replace(
        `<td style={{ textAlign: 'center' }}>`,
        `<td style={{ textAlign: 'right', fontWeight: 600, color: t.runningBalance > 0 ? 'var(--danger)' : (t.runningBalance < 0 ? 'var(--success)' : 'var(--text-muted)') }}>
                            {t.runningBalance > 0 ? \`?\${t.runningBalance} Due\` : (t.runningBalance < 0 ? \`?\${Math.abs(t.runningBalance)} Adv\` : '?0')}
                          </td>
                          <td style={{ textAlign: 'center' }}>`
    );
});

fs.writeFileSync('src/pages/StudentProfile.tsx', content);
console.log("Replaced perfectly.");
