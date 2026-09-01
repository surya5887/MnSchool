const fs = require('fs');
let code = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

// 1. Add className="groups-grid" to the grid containers
code = code.replace(/<div style=\{\{ display: 'grid', gridTemplateColumns: 'repeat\(auto-fill, minmax\(320px, 1fr\)\)', gap: '16px' \}\}>/g, 
  `<div className="groups-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>`);

// 2. Add className="group-card" to the group cards
code = code.replace(/<div key=\{group\.id\} onClick=\{\(\) => toggleGroup\(group\)\}\r?\n\s*style=\{\{\r?\n\s*display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px',/g,
  `<div key={group.id} onClick={() => toggleGroup(group)} className="group-card"\n                              style={{\n                                display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px',`);

// 3. Update the media query in the style block
const cssUpdate = `        .header-title {
          font-size: 1.5rem !important;
        }
        .groups-grid {
          grid-template-columns: 1fr !important;
        }
        .group-card {
          width: 100% !important;
          box-sizing: border-box !important;
          padding: 12px 14px !important;
        }
      }
    }</style>`;

code = code.replace(/        \.header-title \{\r?\n\s*font-size: 1\.5rem !important;\r?\n\s*\}\r?\n\s*\}\r?\n\s*\`\}<\/style>/, cssUpdate);

fs.writeFileSync('src/pages/Announcements.tsx', code, 'utf8');
console.log("Grid overflow fixed");
