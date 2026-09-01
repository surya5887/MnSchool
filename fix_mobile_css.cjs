const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// Update glass-panel padding for mobile globally
if (!css.includes('.glass-panel {\n      padding: 16px !important;\n    }')) {
    css = css.replace(
        '@media (max-width: 768px) {\n  .settings-layout .glass-panel {\n    padding: 20px !important;\n  }\n}',
        '@media (max-width: 768px) {\n  .glass-panel {\n    padding: 16px !important;\n  }\n  .settings-layout .glass-panel {\n    padding: 16px !important;\n  }\n}'
    );
}

// Ensure badge doesn't wrap
css = css.replace(
    '.badge {\n  padding: 4px 12px;\n  border-radius: 20px;\n  font-size: 0.85rem;\n  font-weight: 600;\n}',
    '.badge {\n  padding: 4px 12px;\n  border-radius: 20px;\n  font-size: 0.85rem;\n  font-weight: 600;\n  white-space: nowrap;\n}'
);

fs.writeFileSync('src/index.css', css, 'utf8');
console.log("Mobile CSS fixed");
