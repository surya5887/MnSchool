const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

if (!content.includes('AlertTriangle')) {
  content = content.replace("ShieldAlert, FileText", "ShieldAlert, FileText, AlertTriangle");
}

if (!content.includes('to="/defaulters"')) {
  content = content.replace(
    '<NavLink to="/ledger" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><BookOpen size={20} /> Master Ledger</NavLink>',
    '<NavLink to="/ledger" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><BookOpen size={20} /> Master Ledger</NavLink>\n                <NavLink to="/defaulters" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><AlertTriangle size={20} /> Fee Defaulters</NavLink>'
  );
  fs.writeFileSync('src/components/Layout.tsx', content);
  console.log("Defaulters added to Sidebar!");
} else {
  console.log("Defaulters already exists in Sidebar.");
}
