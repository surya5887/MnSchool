const fs = require('fs');

let staff = fs.readFileSync('src/pages/Staff.tsx', 'utf8');
staff = staff.replace("setSelectedStaff([]);", "");
fs.writeFileSync('src/pages/Staff.tsx', staff);

let layout = fs.readFileSync('src/components/Layout.tsx', 'utf8');
const listenerFix = `const [authUser, setAuthUser] = useState<any>(
    JSON.parse(localStorage.getItem('authUser') || sessionStorage.getItem('authUser') || '{}')
  );

  useEffect(() => {
    const handleStorage = () => {
      setAuthUser(JSON.parse(localStorage.getItem('authUser') || sessionStorage.getItem('authUser') || '{}'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);`;
  
layout = layout.replace(
  /const \[authUser, setAuthUser\] = useState<any>\([\s\S]*?\n  \);\s*useEffect\(\(\) => \{\n    const handleStorage = \(\) => \{\n      setAuthUser\(JSON\.parse\(localStorage\.getItem\('authUser'\) \|\| sessionStorage\.getItem\('authUser'\) \|\| '\{\}'\)\);\n    \};\n    window\.addEventListener\('storage', handleStorage\);\n    return \(\) => window\.removeEventListener\('storage', handleStorage\);\n  \}, \[\]\);\n\n  useEffect\(\(\) => \{\n    if \(!authUser \|\| !authUser\.role\) \{/g,
  listenerFix + "\n  useEffect(() => {\n    if (!authUser || !authUser.role) {"
);

fs.writeFileSync('src/components/Layout.tsx', layout);
console.log("Cleaned up");
