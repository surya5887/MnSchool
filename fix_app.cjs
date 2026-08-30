const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

if (!c.includes('import Announcements from')) {
    c = c.replace(
        `import Classes from './pages/Classes';`,
        `import Announcements from './pages/Announcements';\nimport Classes from './pages/Classes';`
    );
}

if (!c.includes('path="announcements"')) {
    c = c.replace(
        `<Route path="classes" element={<Classes />} />`,
        `<Route path="announcements" element={<Announcements />} />\n          <Route path="classes" element={<Classes />} />`
    );
}

fs.writeFileSync('src/App.tsx', c, 'utf8');
console.log("Updated App.tsx");
