const fs = require('fs');

let layout = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// The reason TS says setAuthUser is never read might be because the listener didn't get injected properly, or there are multiple 'setAuthUser' declarations.
// Let's replace the whole block carefully.

layout = layout.replace(
  /const \[authUser, setAuthUser\] = useState<any>\([\s\S]*?\}\);/g,
  `const [authUser, setAuthUser] = useState<any>(JSON.parse(localStorage.getItem('authUser') || sessionStorage.getItem('authUser') || '{}'));\n  useEffect(() => {\n    const handleStorage = () => {\n      setAuthUser(JSON.parse(localStorage.getItem('authUser') || sessionStorage.getItem('authUser') || '{}'));\n    };\n    window.addEventListener('storage', handleStorage);\n    return () => window.removeEventListener('storage', handleStorage);\n  }, []);\n  useEffect(() => {\n    if (!authUser || !authUser.role) {\n      navigate('/login');\n    }\n  }, [authUser, navigate]);`
);

// We need to clean up any duplicate or messed up logic I injected earlier. Let's just find `const [authUser` and wipe till `navigate('/login'); }` and replace.
// Actually, it's safer to just do a string replace on what's there now.
