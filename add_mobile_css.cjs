const fs = require('fs');
let code = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

// 1. Header Card
code = code.replace(/<div style=\{\{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '28px 32px'/g, 
  `<div className="header-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '28px 32px'`);

code = code.replace(/<h1 style=\{\{ display: 'flex', alignItems: 'center', gap: '14px', margin: '0 0 8px 0', color: '#1e293b', fontSize: '1.85rem' \}\}>/g,
  `<h1 className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '0 0 8px 0', color: '#1e293b', fontSize: '1.85rem' }}>`);

code = code.replace(/\{\/\* Smart Typing Toggle \*\/\}\r?\n\s*<div style=\{\{ display: 'flex', alignItems: 'center', gap: '12px', background: hindiEnabled \? '#f0fdf4' : '#f8fafc', padding: '10px 20px'/g,
  `{/* Smart Typing Toggle */}\n        <div className="smart-typing-toggle" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: hindiEnabled ? '#f0fdf4' : '#f8fafc', padding: '10px 20px'`);

// 2. Composer Card
code = code.replace(/\{\/\* Composer Section - Full Width \*\/\}\r?\n\s*<div style=\{\{ background: 'white', padding: '32px'/g,
  `{/* Composer Section - Full Width */}\n      <div className="composer-card" style={{ background: 'white', padding: '32px'`);

code = code.replace(/<div style=\{\{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' \}\}>/g,
  `<div className="composer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>`);

code = code.replace(/<button \r?\n\s*onClick=\{sendMessage\}/g,
  `<button className="composer-btn"\n            onClick={sendMessage}`);

// 3. Recipients Card
code = code.replace(/\{\/\* Recipient Selection Section - Full Width \*\/\}\r?\n\s*<div style=\{\{ background: 'white', padding: '32px'/g,
  `{/* Recipient Selection Section - Full Width */}\n      <div className="recipients-card" style={{ background: 'white', padding: '32px'`);

code = code.replace(/<div style=\{\{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' \}\}>/g,
  `<div className="toolbar-container" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>`);

code = code.replace(/<div style=\{\{ position: 'relative' \}\}>/g,
  `<div className="search-container" style={{ position: 'relative' }}>`);

code = code.replace(/<input \r?\n\s*type="text" \r?\n\s*placeholder="Search communities\.\.\." \r?\n\s*value=\{search\}\r?\n\s*onChange=\{\(e\) => setSearch\(e\.target\.value\)\}\r?\n\s*style=\{\{ \r?\n\s*padding: '12px 16px 12px 42px'/g,
  `<input className="search-input"\n                type="text" \n                placeholder="Search communities..." \n                value={search}\n                onChange={(e) => setSearch(e.target.value)}\n                style={{ \n                  padding: '12px 16px 12px 42px'`);

// Toolbar buttons wrapper
const buttonsRegex = /<button onClick=\{fetchGroups\}([\s\S]*?)<\/button>/g;
code = code.replace(buttonsRegex, function(match) {
    if(match.includes('Refresh')) {
        return `<div className="toolbar-buttons" style={{ display: 'flex', gap: '12px' }}>\n            ` + match;
    }
    return match;
});

const selectAllRegex = /<button \r?\n\s*onClick=\{selectAll\}([\s\S]*?)Select All\r?\n\s*<\/button>/g;
code = code.replace(selectAllRegex, function(match) {
    return match + `\n            </div>`;
});


// 4. Template Card
code = code.replace(/\{\/\* Automated Fee Reminder Template \*\/\}\r?\n\s*<div style=\{\{ background: 'white', padding: '32px'/g,
  `{/* Automated Fee Reminder Template */}\n      <div className="template-card" style={{ background: 'white', padding: '32px'`);

// 5. CSS Styles
const newCSS = `      /* Mobile Responsiveness for Announcements */
      @media (max-width: 768px) {
        .header-card {
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 20px !important;
          padding: 24px 20px !important;
        }
        .smart-typing-toggle {
          width: 100% !important;
          justify-content: space-between !important;
          padding: 12px 16px !important;
          box-sizing: border-box !important;
        }
        .composer-card, .recipients-card, .template-card {
          padding: 24px 20px !important;
        }
        .composer-header {
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 16px !important;
        }
        .composer-btn {
          width: 100% !important;
          justify-content: center !important;
        }
        .toolbar-container {
          width: 100% !important;
          flex-direction: column !important;
        }
        .search-container {
          width: 100% !important;
        }
        .search-input {
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .toolbar-buttons {
          display: flex !important;
          width: 100% !important;
          gap: 12px !important;
        }
        .toolbar-buttons > button {
          flex: 1 !important;
          justify-content: center !important;
          padding: 12px !important;
          font-size: 0.9rem !important;
        }
        .header-title {
          font-size: 1.5rem !important;
        }
      }
    }</style>`;

code = code.replace(/    \}<\/style>/g, newCSS);

fs.writeFileSync('src/pages/Announcements.tsx', code, 'utf8');
console.log("Mobile CSS applied");
