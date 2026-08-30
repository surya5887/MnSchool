const fs = require('fs');
let c = fs.readFileSync('src/components/Layout.tsx', 'utf8');

if (!c.includes('RefreshCw')) {
    c = c.replace('AlertCircle } from \'lucide-react\';', 'AlertCircle, RefreshCw } from \'lucide-react\';');
}

const buttonHtml = `
              <motion.button 
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  caches.keys().then((names) => {
                    names.forEach((name) => caches.delete(name));
                  });
                  window.location.reload();
                }}
                title="Hard Refresh App"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  color: 'white',
                  marginLeft: '8px'
                }}
              >
                <RefreshCw size={16} />
              </motion.button>
`;

if (!c.includes('title="Hard Refresh App"')) {
    c = c.replace(
        `<LiveClock />`,
        `<LiveClock />${buttonHtml}`
    );
}

fs.writeFileSync('src/components/Layout.tsx', c, 'utf8');
console.log("Added hard refresh button");
