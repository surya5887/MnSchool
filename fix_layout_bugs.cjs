const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// 1. Import removeAuditTrailActivatedLog
if (!content.includes('removeAuditTrailActivatedLog')) {
  content = content.replace(
    "import { clearSpamLogs, getAuditLogs } from '../services/auditService';",
    "import { clearSpamLogs, getAuditLogs, removeAuditTrailActivatedLog } from '../services/auditService';"
  );
}

// 2. Call removeAuditTrailActivatedLog
content = content.replace(
  "clearSpamLogs().then(() => localStorage.setItem('spam_cleared', 'true'));",
  "clearSpamLogs().then(() => localStorage.setItem('spam_cleared', 'true'));\n      removeAuditTrailActivatedLog();"
);

// 3. Fix Bell icon color in Header
content = content.replace(
  "color={showNotifications ? \"var(--primary)\" : \"var(--text-main)\"}",
  "color={showNotifications ? \"var(--primary-color)\" : \"var(--text-main)\"}"
);
content = content.replace(
  "<Bell size={18} color=\"var(--primary)\"/>",
  "<Bell size={18} color=\"var(--primary-color)\"/>"
);

// 4. Fix "Mark all read" text color
content = content.replace(
  "color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setUnreadCount(0)}>Mark all read</span>",
  "color: 'var(--primary-color)', fontWeight: 600, cursor: 'pointer' }} onClick={() => { localStorage.setItem('lastReadTimestamp_' + authUser.id, Date.now().toString()); setUnreadCount(0); }}>Mark all read</span>"
);

// 5. Fix setUnreadCount logic in fetchNotifications
// Replace `setUnreadCount(notifs.length);` with logic based on timestamp.
const unreadLogic = `
        const lastRead = parseInt(localStorage.getItem('lastReadTimestamp_' + authUser.id) || '0');
        const unread = notifs.filter(n => new Date(n.time).getTime() > lastRead).length;
        setUnreadCount(unread);
`;
content = content.replace(
  "setUnreadCount(notifs.length); // simple counter for UI",
  unreadLogic
);

fs.writeFileSync('src/components/Layout.tsx', content);
console.log("Fixed Layout bugs");
