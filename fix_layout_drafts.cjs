const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

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

content = content.replace(targetEffect, newEffect);

const targetDraftLogic = `      // Check for Drafts
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

const newDraftLogic = `      // Check for Drafts
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

content = content.replace(targetDraftLogic, newDraftLogic);
fs.writeFileSync('src/components/Layout.tsx', content, 'utf8');
console.log("Layout drafts fixed!");
