const fs = require('fs');

const lines = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8').split('\n');
const out = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Inject Summary UI
    if (line.includes('<IndianRupee size={20} /> Financial Ledger')) {
        out.push(line);
        // The very next line is </h3>
        out.push(lines[i+1]);
        i++; // skip </h3>

        const summaryUI = `                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginLeft: 'auto', marginRight: '20px' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600, textTransform: 'uppercase' }}>Pending</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--danger)' }}>?{typeof currentDue !== 'undefined' ? currentDue.toLocaleString() : 0}</span>
                  </div>
                  <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '8px 16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, textTransform: 'uppercase' }}>Advance</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)' }}>?{typeof currentAdvance !== 'undefined' ? currentAdvance.toLocaleString() : 0}</span>
                  </div>
                </div>`;
        out.push(summaryUI);
        continue;
    }

    // Inject the missing Balance <td>
    if (line.includes("t.type === 'Income' || t.type === 'Discount'")) {
        out.push(line);
        out.push(lines[i+1]); // </td>
        i++; // skip </td>
        
        const newTd = `                          <td style={{ textAlign: 'right', fontWeight: 600, color: t.runningBalance > 0 ? 'var(--danger)' : (t.runningBalance < 0 ? 'var(--success)' : 'var(--text-muted)') }}>
                            {t.runningBalance > 0 ? \`?\${t.runningBalance} Due\` : (t.runningBalance < 0 ? \`?\${Math.abs(t.runningBalance)} Adv\` : '?0')}
                          </td>`;
        out.push(newTd);
        continue;
    }

    out.push(line);
}

fs.writeFileSync('src/pages/StudentProfile.tsx', out.join('\n'));
console.log("Line by line fix done!");
