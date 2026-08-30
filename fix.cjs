const fs = require('fs');
let c = fs.readFileSync('src/components/Layout.tsx', 'utf8');

c = c.replace(/\/\/ Check for Drafts[\s\S]+?type: 'warning'\r?\n\s+\}\);\r?\n\s+\}\r?\n\s+\}/, 
`// Check for Drafts
      const draftStr = localStorage.getItem('admission_drafts');
      if (draftStr && location.pathname !== '/new-admission') {
        const draftsObj = JSON.parse(draftStr);
        const draftsCount = Object.keys(draftsObj).length;
        if (draftsCount > 0) {
          const latestDraftTime = Math.max(...Object.values(draftsObj).map((d) => d.timestamp || Date.now()));
          notifs.push({
            id: 'draft',
            title: 'Draft Forms Pending',
            message: \`You have \${draftsCount} admission form(s) saved in draft. Don't forget to complete them.\`,
            time: new Date(latestDraftTime).toISOString(),
            type: 'warning'
          });
        }
      }`);

c = c.replace(/useEffect\(\(\) => \{[\s\S]+?setMobileMenuOpen\(false\);\r?\n\s+\}, \[location\.pathname\]\);/, 
`useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    setMobileMenuOpen(false);
    fetchNotifications();
  }, [location.pathname]);`);

fs.writeFileSync('src/components/Layout.tsx', c, 'utf8');
