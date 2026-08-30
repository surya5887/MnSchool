const fs = require('fs');
let c = fs.readFileSync('src/components/Layout.tsx', 'utf8');

if (!c.includes('Megaphone,')) {
    c = c.replace('LibraryIcon, Menu, X, User } from \'lucide-react\';', 'LibraryIcon, Menu, X, User, Megaphone } from \'lucide-react\';');
}

if (!c.includes('/announcements')) {
    c = c.replace(
        `<NavLink to="/classes" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><BookOpen size={20} /> Classes & Sections</NavLink>`,
        `<NavLink to="/announcements" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><Megaphone size={20} /> Announcements</NavLink>\n              <NavLink to="/classes" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><BookOpen size={20} /> Classes & Sections</NavLink>`
    );
}

fs.writeFileSync('src/components/Layout.tsx', c, 'utf8');
console.log("Updated Layout.tsx");
