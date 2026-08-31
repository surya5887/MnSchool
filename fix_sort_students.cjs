const fs = require('fs');
let code = fs.readFileSync('src/pages/Students.tsx', 'utf8');

const regexTarget = /return matchRole && matchSearch && matchClass && matchSection;\r?\n\s*\}\);\r?\n\s*\}, \[students, role, authUser, searchTerm, selectedClass, selectedSection\]\);/;
const regexReplacement = `return matchRole && matchSearch && matchClass && matchSection;
    }).sort((a, b) => {
      const rollA = Number(a.rollNumber) || 0;
      const rollB = Number(b.rollNumber) || 0;
      if (rollA !== rollB) return rollA - rollB;
      // fallback to name sorting if roll numbers are same/empty
      return (a.firstName || '').localeCompare(b.firstName || '');
    });
  }, [students, role, authUser, searchTerm, selectedClass, selectedSection]);`;
  
if (regexTarget.test(code)) {
  code = code.replace(regexTarget, regexReplacement);
  fs.writeFileSync('src/pages/Students.tsx', code, 'utf8');
  console.log("Students.tsx regex replacement successful.");
} else {
  console.log("Students.tsx regex failed. Let's see what the useMemo looks like.");
}
