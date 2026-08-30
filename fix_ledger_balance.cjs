const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');

// Replace the displayedRows logic to calculate running balance
const oldLogic = `              {(() => {
                const displayedRows = filterMonth === 'All' 
                ? ledgerRows.slice().reverse() 
                : ledgerRows.slice().reverse().filter(t => t.date.startsWith(filterMonth));`;

const newLogic = `              {(() => {
                // Calculate running balance chronologically (oldest first)
                let balance = previousPending; // start with previous pending
                const rowsWithBalance = ledgerRows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(t => {
                  if (t.type === 'Charge') balance += t.amount;
                  else if (t.type === 'Income' || t.type === 'Discount') balance -= t.amount;
                  return { ...t, runningBalance: balance };
                });

                const displayedRows = filterMonth === 'All' 
                ? rowsWithBalance.slice().reverse() 
                : rowsWithBalance.slice().reverse().filter(t => t.date.startsWith(filterMonth));`;

content = content.replace(oldLogic, newLogic);

// Add Balance column to headers
content = content.replace(
  `<th style={{ whiteSpace: 'nowrap' }}>Paid</th>`,
  `<th style={{ whiteSpace: 'nowrap' }}>Paid</th>
                          <th style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>Balance</th>`
);

// Add Balance data cell
content = content.replace(
  `<td style={{ color: 'var(--success)', fontWeight: 500 }}>
                            {t.type === 'Income' || t.type === 'Discount' ? \`,1\${t.amount}\` : '-'}
                          </td>`,
  `<td style={{ color: 'var(--success)', fontWeight: 500 }}>
                            {t.type === 'Income' || t.type === 'Discount' ? \`,1\${t.amount}\` : '-'}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: (t as any).runningBalance > 0 ? 'var(--danger)' : ((t as any).runningBalance < 0 ? 'var(--success)' : 'inherit') }}>
                            {(t as any).runningBalance > 0 ? \`,1\${(t as any).runningBalance} Due\` : ((t as any).runningBalance < 0 ? \`,1\${Math.abs((t as any).runningBalance)} Adv\` : ',10')}
                          </td>`
);

fs.writeFileSync('src/pages/StudentProfile.tsx', content);
console.log("Fixed Ledger Balance");
