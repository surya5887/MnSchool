const fs = require('fs');
let content = fs.readFileSync('src/services/adminService.ts', 'utf8');

// 1. Add name to updateAdminCredentials
if (!content.includes('updateAdminCredentials = async (id: string, email: string, name: string')) {
  content = content.replace(
    "export const updateAdminCredentials = async (id: string, email: string, password?: string) => {",
    "export const updateAdminCredentials = async (id: string, email: string, name: string, password?: string) => {"
  );
  content = content.replace(
    "const updateData: any = { email };",
    "const updateData: any = { email, name };"
  );
}

// 2. Add an init function to rename them
const renameScript = `
export const setupInitialProfiles = async () => {
  if (localStorage.getItem('profiles_setup')) return;
  const snap = await getDocs(collection(db, 'admins'));
  for (const d of snap.docs) {
    const data = d.data();
    if (data.role === 'Principal' && data.name === 'Principal / Admin') {
      await updateDoc(doc(db, 'admins', d.id), { name: 'Mohd Arif' });
    } else if (data.role === 'Manager' && data.name === 'Manager') {
      await updateDoc(doc(db, 'admins', d.id), { name: 'Mufti Shariq' });
    }
  }
  localStorage.setItem('profiles_setup', 'true');
};
`;

if (!content.includes('setupInitialProfiles')) {
  content += renameScript;
}

fs.writeFileSync('src/services/adminService.ts', content);
console.log("Updated adminService.ts");
