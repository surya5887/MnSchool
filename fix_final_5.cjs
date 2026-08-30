const fs = require('fs');

let layout = fs.readFileSync('src/components/Layout.tsx', 'utf8');

if (!layout.includes('<ProfileSidebar')) {
  // It should be injected right before the last `    </div>\n  );\n};\n\nexport default Layout;`
  const lastIndex = layout.lastIndexOf('</div>');
  if (lastIndex !== -1) {
    layout = layout.slice(0, lastIndex) + '  <ProfileSidebar isOpen={showProfileSidebar} onClose={() => setShowProfileSidebar(false)} authUser={authUser} />\n    ' + layout.slice(lastIndex);
    fs.writeFileSync('src/components/Layout.tsx', layout);
    console.log("Injected ProfileSidebar");
  }
}
