const fs = require('fs');
let code = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

const standaloneFaulty = `<h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {group.name}
                              </h4>`;
const standaloneFixed = `<h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 1, minWidth: 0 }}>{group.name}</span>
                              </h4>`;

code = code.replace(standaloneFaulty, standaloneFixed);

fs.writeFileSync('src/pages/Announcements.tsx', code, 'utf8');
console.log("Standalone ellipsis fixed");
