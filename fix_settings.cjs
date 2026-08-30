const fs = require('fs');
let content = fs.readFileSync('src/pages/SystemSettings.tsx', 'utf8');

// 1. Revert tab label and condition
content = content.replace(
  "{ id: 'credentials', label: authUser.role === 'Super Admin' ? 'System Credentials' : 'My Profile', desc: 'Manage profile and access', icon: <Lock size={20} /> }",
  "...(authUser.role === 'Super Admin' ? [{ id: 'credentials', label: 'System Credentials', desc: 'Manage email & passwords', icon: <Lock size={20} /> }] : [])"
);

// 2. Revert activeTab rendering condition
content = content.replace(
  "{activeTab === 'credentials' && (",
  "{activeTab === 'credentials' && authUser.role === 'Super Admin' && ("
);

// 3. Revert title inside the tab
content = content.replace(
  "<Lock size={24} color=\"var(--primary)\" /> {authUser.role === 'Super Admin' ? 'System Credentials' : 'My Profile'}",
  "<Lock size={24} color=\"var(--primary)\" /> System Credentials"
);

// 4. Revert admin filtering so Super Admin sees everyone
content = content.replace(
  "{admins.filter(admin => authUser.role === 'Super Admin' ? true : admin.id === authUser.id).map(admin => (",
  "{admins.map(admin => ("
);

fs.writeFileSync('src/pages/SystemSettings.tsx', content);
console.log("Reverted SystemSettings.tsx to only show for Super Admin");
