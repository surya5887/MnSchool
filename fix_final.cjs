const fs = require('fs');

let layout = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const listener = `
  useEffect(() => {
    const handleStorage = () => {
      setAuthUser(JSON.parse(localStorage.getItem('authUser') || sessionStorage.getItem('authUser') || '{}'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
`;

layout = layout.replace(
  "useEffect(() => {\n    if (!authUser || !authUser.role) {",
  listener + "\n  useEffect(() => {\n    if (!authUser || !authUser.role) {"
);

fs.writeFileSync('src/components/Layout.tsx', layout);

let staff = fs.readFileSync('src/pages/Staff.tsx', 'utf8');
staff = staff.replace("const [selectedStaff, setSelectedStaff] = useState<string[]>([]);", "");
fs.writeFileSync('src/pages/Staff.tsx', staff);

console.log("Fixed Layout and Staff");
