const fs = require('fs');
let content = fs.readFileSync('src/services/auditService.ts', 'utf8');

// I will add a script to delete any log that has "Audit Trail Activated" in the action
const cleanupScript = `
export const removeAuditTrailActivatedLog = async () => {
  try {
    const snap = await getDocs(collection(db, AUDIT_COLLECTION));
    for (const d of snap.docs) {
      if (d.data().action && d.data().action.includes('Audit Trail Activated')) {
        await deleteDoc(doc(db, AUDIT_COLLECTION, d.id));
      }
    }
  } catch (e) {}
};
`;

if (!content.includes('removeAuditTrailActivatedLog')) {
  content += cleanupScript;
  fs.writeFileSync('src/services/auditService.ts', content);
}
console.log("Added cleanup function to auditService");
