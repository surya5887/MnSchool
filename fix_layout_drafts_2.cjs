const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const targetDraftStr = `      // Check for Drafts
      const draftStr = localStorage.getItem('admission_drafts');
      if (draftStr) {
        const draftsObj = JSON.parse(draftStr);
        const draftsCount = Object.keys(draftsObj).length;
        if (draftsCount > 0) {
          notifs.push({
            id: 'draft',
            title: 'Draft Forms Pending',
            message: \`You have \${draftsCount} admission form(s) saved in draft. Don't forget to complete them.\`,
            time: new Date().toISOString(),
            type: 'warning'
          });
        }
      }`;

const newDraftStr = `      // Check for Drafts
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
      }`;

if (content.includes(targetDraftStr)) {
    content = content.replace(targetDraftStr, newDraftStr);
    console.log("Draft replaced");
} else {
    console.log("Draft target not found");
}

const targetEffect = `  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    setMobileMenuOpen(false);
  }, [location.pathname]);`;

const newEffect = `  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    setMobileMenuOpen(false);
    fetchNotifications();
  }, [location.pathname]);`;

if (content.includes(targetEffect)) {
    content = content.replace(targetEffect, newEffect);
    console.log("Effect replaced");
} else {
    console.log("Effect target not found");
}

fs.writeFileSync('src/components/Layout.tsx', content, 'utf8');
