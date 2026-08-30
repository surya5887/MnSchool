const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// Add a catch-all route inside the Layout
appContent = appContent.replace(
    /<Route path="defaulters" element=\{<DefaultersList \/>\} \/>\s*<\/Route>/,
    `<Route path="defaulters" element={<DefaultersList />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />`
);

fs.writeFileSync('src/App.tsx', appContent);
console.log("Catch-all routes added.");
