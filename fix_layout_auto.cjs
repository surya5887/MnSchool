const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

if (!content.includes('Zap')) {
  content = content.replace("AlertTriangle, Bus", "AlertTriangle, Bus, Zap");
}

if (!content.includes('to="/automation"')) {
  content = content.replace(
    '<NavLink to="/defaulters" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><AlertTriangle size={20} /> Fee Defaulters</NavLink>',
    '<NavLink to="/defaulters" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><AlertTriangle size={20} /> Fee Defaulters</NavLink>\n                <NavLink to="/automation" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><Zap size={20} /> Billing Engine</NavLink>'
  );
  fs.writeFileSync('src/components/Layout.tsx', content);
  console.log("Layout.tsx updated");
}
