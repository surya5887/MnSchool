const fs = require('fs');

// 1. Remove from Layout.tsx
let layoutContent = fs.readFileSync('src/components/Layout.tsx', 'utf8');
layoutContent = layoutContent.replace(
    /^\s*<NavLink to="\/automation" style=\{navLinkStyle\}.*?Billing Engine<\/NavLink>\r?\n/gm,
    ''
);
fs.writeFileSync('src/components/Layout.tsx', layoutContent);

// 2. Remove from App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(
    /^.*import FinancialAutomation.*$\r?\n/gm,
    ''
);
appContent = appContent.replace(
    /^\s*<Route path="automation" element=\{<FinancialAutomation \/>\} \/>\r?\n/gm,
    ''
);
fs.writeFileSync('src/App.tsx', appContent);

// 3. Delete FinancialAutomation.tsx
if (fs.existsSync('src/pages/FinancialAutomation.tsx')) {
    fs.unlinkSync('src/pages/FinancialAutomation.tsx');
}

console.log("UI removed!");
