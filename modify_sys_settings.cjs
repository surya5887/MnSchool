const fs = require('fs');
let content = fs.readFileSync('src/pages/SystemSettings.tsx', 'utf8');

// 1. Fetch admins for everyone who has access to Settings
content = content.replace(
  "if (authUser.role === 'Super Admin') {\n      getAllAdmins().then(data => setAdmins(data));\n    }",
  "getAllAdmins().then(data => setAdmins(data));"
);

// 2. Change the tab condition to always be available for anyone in Settings
content = content.replace(
  "...(authUser.role === 'Super Admin' ? [{ id: 'credentials', label: 'System Credentials', desc: 'Manage email & passwords', icon: <Lock size={20} /> }] : [])",
  "{ id: 'credentials', label: authUser.role === 'Super Admin' ? 'System Credentials' : 'My Profile', desc: 'Manage profile and access', icon: <Lock size={20} /> }"
);

// 3. Change the active tab rendering logic
content = content.replace(
  "{activeTab === 'credentials' && authUser.role === 'Super Admin' && (",
  "{activeTab === 'credentials' && ("
);

// 4. Update the title inside the tab
content = content.replace(
  "<Lock size={24} color=\"var(--primary)\" /> System Credentials",
  "<Lock size={24} color=\"var(--primary)\" /> {authUser.role === 'Super Admin' ? 'System Credentials' : 'My Profile'}"
);

// 5. Filter admins mapped based on role
content = content.replace(
  "{admins.map(admin => (",
  "{admins.filter(admin => authUser.role === 'Super Admin' ? true : admin.id === authUser.id).map(admin => ("
);

// 6. Fix Layout.tsx where authUser name wasn't updating when edited.
// Actually, when they edit it, they should re-login or update localStorage. 
// I'll add localStorage update inside handleSave in SystemSettings.tsx if they edited themselves.

const saveLogic = `await updateAdminCredentials(admin.id, editAdminData.email, editAdminData.name, editAdminData.password);
                                setAdmins(await getAllAdmins());
                                if (admin.id === authUser.id) {
                                  const updatedUser = { ...authUser, name: editAdminData.name };
                                  localStorage.setItem('authUser', JSON.stringify(updatedUser));
                                  sessionStorage.setItem('authUser', JSON.stringify(updatedUser));
                                  window.dispatchEvent(new Event('storage'));
                                }
                                setEditingAdmin(null);
                                handleSave('Credentials');`;
                                
content = content.replace(
  /await updateAdminCredentials\(admin\.id, editAdminData\.email, editAdminData\.name, editAdminData\.password\);\s*setAdmins\(await getAllAdmins\(\)\);\s*setEditingAdmin\(null\);\s*handleSave\('Credentials'\);/,
  saveLogic
);

fs.writeFileSync('src/pages/SystemSettings.tsx', content);
console.log("Updated SystemSettings.tsx for My Profile");
