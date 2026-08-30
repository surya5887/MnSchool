const fs = require('fs');

let content = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');

// Replace running balance logic
const oldLedgerLogic = /const sortedTransactions = \[\.\.\.transactions\]\.sort\(\(a, b\) => new Date\(a\.date\)\.getTime\(\) - new Date\(b\.date\)\.getTime\(\)\);\s*const ledgerRows = sortedTransactions;/;

const newLedgerLogic = `const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let currentBal = 0;
  const ledgerRows = sortedTransactions.map(t => {
    if (t.type === 'Charge') currentBal += t.amount;
    else if (t.type === 'Income' || t.type === 'Discount') currentBal -= t.amount;
    return { ...t, runningBalance: currentBal };
  });
  
  const currentDue = currentBal > 0 ? currentBal : 0;
  const currentAdvance = currentBal < 0 ? Math.abs(currentBal) : 0;`;

content = content.replace(oldLedgerLogic, newLedgerLogic);

// Replace Summary UI
// Find the </h3> and add the summary boxes
content = content.replace(
  /<\/h3>/,
  `</h3>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginLeft: 'auto', marginRight: '20px' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600, textTransform: 'uppercase' }}>Pending</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--danger)' }}>?{typeof currentDue !== 'undefined' ? currentDue.toLocaleString() : 0}</span>
                  </div>
                  <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '8px 16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, textTransform: 'uppercase' }}>Advance</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)' }}>?{typeof currentAdvance !== 'undefined' ? currentAdvance.toLocaleString() : 0}</span>
                  </div>
                </div>`
);


// Replace the missing <td> in the map
// We want to replace the exact sequence of </td> followed by <td style={{ textAlign: 'center' }}>
const missingTdRegex = /<td style=\{\{\s*color:\s*'var\(--success\)',\s*fontWeight:\s*500\s*\}\}>[\s\S]*?<\/td>\s*<td style=\{\{\s*textAlign:\s*'center'\s*\}\}>/g;

content = content.replace(missingTdRegex, (match) => {
    return match.replace(
        `<td style={{ textAlign: 'center' }}>`,
        `<td style={{ textAlign: 'right', fontWeight: 600, color: t.runningBalance > 0 ? 'var(--danger)' : (t.runningBalance < 0 ? 'var(--success)' : 'var(--text-muted)') }}>
                            {t.runningBalance > 0 ? \`?\${t.runningBalance} Due\` : (t.runningBalance < 0 ? \`?\${Math.abs(t.runningBalance)} Adv\` : '-')}
                          </td>
                          <td style={{ textAlign: 'center' }}>`
    );
});


fs.writeFileSync('src/pages/StudentProfile.tsx', content);
console.log("Regex replace done!");
