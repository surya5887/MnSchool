const fs = require('fs');
let code = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

// The faulty h4 lines look like:
// <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '8px' }}>
//   {group.name}
//   {group.isCommunityAnnounce && <span style={{ fontSize: '0.65rem', background: '#e0e7ff', color: '#4f46e5', padding: '3px 8px', borderRadius: '100px', fontWeight: 700, border: '1px solid #c7d2fe' }}>Announcement</span>}
// </h4>

const faultyRegex = /<h4 style=\{\{\s*margin: '0 0 6px 0',\s*fontSize: '1rem',\s*color: '#1e293b',\s*whiteSpace: 'nowrap',\s*overflow: 'hidden',\s*textOverflow: 'ellipsis',\s*display: 'flex',\s*alignItems: 'center',\s*gap: '8px'\s*\}\}>\r?\n\s*\{group\.name\}\r?\n\s*(\{group\.isCommunityAnnounce[\s\S]*?<\/span>\})?\r?\n\s*<\/h4>/g;

code = code.replace(faultyRegex, (match, announceTag) => {
    return `<h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 1, minWidth: 0 }}>{group.name}</span>
                                  ` + (announceTag ? announceTag.replace('<span style={{', '<span style={{ flexShrink: 0,') : '') + `
                                </h4>`;
});

fs.writeFileSync('src/pages/Announcements.tsx', code, 'utf8');
console.log("Ellipsis fixed");
