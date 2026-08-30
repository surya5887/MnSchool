const fs = require('fs');

let layout = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Use regex instead of exact string matching to bypass \r\n issues
const regex = /const \[authUser, setAuthUser\] = useState<any>\([\s\S]*?\}\);/m;

const injection = `
  useEffect(() => {
    const handleStorage = () => {
      setAuthUser(JSON.parse(localStorage.getItem('authUser') || sessionStorage.getItem('authUser') || '{}'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
`;

if (!layout.includes('window.addEventListener(\'storage\', handleStorage);')) {
  layout = layout.replace(regex, (match) => match + injection);
  fs.writeFileSync('src/components/Layout.tsx', layout);
  console.log("Injected using regex");
}
