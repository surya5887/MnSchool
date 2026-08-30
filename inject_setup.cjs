const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

if (!content.includes('setupInitialProfiles')) {
  content = content.replace(
    "import { createDefaultAdminIfNeeded } from '../services/adminService';",
    "import { createDefaultAdminIfNeeded, setupInitialProfiles } from '../services/adminService';"
  );
  
  content = content.replace(
    "createDefaultAdminIfNeeded();",
    "createDefaultAdminIfNeeded().then(() => setupInitialProfiles());"
  );
  
  fs.writeFileSync('src/pages/Login.tsx', content);
  console.log("Injected setupInitialProfiles into Login");
}
