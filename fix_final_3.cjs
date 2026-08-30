const fs = require('fs');

let layout = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// We will literally just append it right after the declaration.
const target = `  const [authUser, setAuthUser] = useState<any>(
    JSON.parse(localStorage.getItem('authUser') || sessionStorage.getItem('authUser') || '{}')
  );`;
  
const injection = `
  useEffect(() => {
    const handleStorage = () => {
      setAuthUser(JSON.parse(localStorage.getItem('authUser') || sessionStorage.getItem('authUser') || '{}'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
`;

// Make sure it doesn't already exist to prevent duplicates
if (layout.includes(target) && !layout.includes('window.addEventListener(\'storage\', handleStorage);')) {
  layout = layout.replace(target, target + injection);
  fs.writeFileSync('src/components/Layout.tsx', layout);
  console.log("Injected listener perfectly");
} else {
  console.log("Could not inject listener or it already exists");
}
