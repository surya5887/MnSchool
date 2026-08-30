const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const regexBottom = /    <\/div>\n  \);\n\};\n\nexport default Layout;/m;

content = content.replace(regexBottom, "      <ProfileSidebar isOpen={showProfileSidebar} onClose={() => setShowProfileSidebar(false)} authUser={authUser} />\n    </div>\n  );\n};\n\nexport default Layout;");

// Let's replace the avatar block. We'll find exactly this string:
const oldAvatar = `              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="hide-on-mobile" style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{authUser.name || 'User'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{authUser.role || 'Role'}</div>
                </div>
                <img src={\`https://ui-avatars.com/api/?name=\${authUser.name || 'U'}&background=6366f1&color=fff\`} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
              </div>`;

const newAvatar = `              </div>
              <div onClick={() => setShowProfileSidebar(true)} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '4px 8px', borderRadius: '12px', transition: 'background 0.2s' }} className="hover-highlight">
                <div className="hide-on-mobile" style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{authUser.name || 'User'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{authUser.role || 'Role'}</div>
                </div>
                <img src={authUser.photoUrl || \`https://ui-avatars.com/api/?name=\${authUser.name || 'U'}&background=6366f1&color=fff\`} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              </div>`;
              
if (content.includes(oldAvatar)) {
  content = content.replace(oldAvatar, newAvatar);
} else {
  // Try regex if exact match fails due to whitespace
  const avatarRegex = /<div style=\{\{ display: 'flex', alignItems: 'center', gap: '12px' \}\}>\s*<div className="hide-on-mobile" style=\{\{ textAlign: "right" \}\}>\s*<div style=\{\{ fontWeight: 600, fontSize: '0.9rem' \}\}>\{authUser\.name \|\| 'User'\}<\/div>\s*<div style=\{\{ color: 'var\(--text-muted\)', fontSize: '0.8rem' \}\}>\{authUser\.role \|\| 'Role'\}<\/div>\s*<\/div>\s*<img src=\{`https:\/\/ui-avatars\.com\/api\/\?name=\$\{authUser\.name \|\| 'U'\}&background=6366f1&color=fff`\} alt="Profile" style=\{\{ width: '40px', height: '40px', borderRadius: '50%' \}\}\s*\/>\s*<\/div>/m;
  content = content.replace(avatarRegex, newAvatar.trim());
}

fs.writeFileSync('src/components/Layout.tsx', content);
console.log("Fixed Layout properly");
