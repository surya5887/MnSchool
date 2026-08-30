const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('FinancialAutomation')) {
  content = content.replace(
    "import MasterLedger from './pages/MasterLedger';",
    "import MasterLedger from './pages/MasterLedger';\nimport FinancialAutomation from './pages/FinancialAutomation';"
  );
  
  content = content.replace(
    "<Route path=\"ledger\" element={<MasterLedger />} />",
    "<Route path=\"ledger\" element={<MasterLedger />} />\n            <Route path=\"automation\" element={<FinancialAutomation />} />"
  );
  
  fs.writeFileSync('src/App.tsx', content);
  console.log("App.tsx updated");
}
