const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

content = content.replace(
  "const [authUser] = useState<any>(",
  "const [authUser, setAuthUser] = useState<any>("
);

// Add event listener
const listenerCode = `  useEffect(() => {
    const handleStorage = () => {
      setAuthUser(JSON.parse(localStorage.getItem('authUser') || sessionStorage.getItem('authUser') || '{}'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);\n\n  useEffect(() => {`;
  
content = content.replace("  useEffect(() => {\n    const fetchSettings", listenerCode + "    const fetchSettings");

fs.writeFileSync('src/components/Layout.tsx', content);
console.log("Updated Layout with storage listener");
