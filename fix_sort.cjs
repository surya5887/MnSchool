const fs = require('fs');
let code = fs.readFileSync('src/pages/Attendance.tsx', 'utf8');

const target = `  const activeStudents = useMemo(() => {
    return students.filter(s => {
      const matchStatus = s.status === 'Active' || !s.status;
      const matchClass = s.classId === selectedClass;
      const matchSection = s.sectionId === selectedSection;
      const fullName = \`\${s.firstName || ''} \${s.lastName || ''}\`.toLowerCase();
      const matchSearch = fullName.includes(searchQuery.toLowerCase().trim());
      return matchStatus && matchClass && matchSection && matchSearch;
    });
  }, [students, selectedClass, selectedSection, searchQuery]);`;

const replacement = `  const activeStudents = useMemo(() => {
    return students.filter(s => {
      const matchStatus = s.status === 'Active' || !s.status;
      const matchClass = s.classId === selectedClass;
      const matchSection = s.sectionId === selectedSection;
      const fullName = \`\${s.firstName || ''} \${s.lastName || ''}\`.toLowerCase();
      const matchSearch = fullName.includes(searchQuery.toLowerCase().trim());
      return matchStatus && matchClass && matchSection && matchSearch;
    }).sort((a, b) => {
      const rollA = Number(a.rollNumber) || 0;
      const rollB = Number(b.rollNumber) || 0;
      return rollA - rollB;
    });
  }, [students, selectedClass, selectedSection, searchQuery]);`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/Attendance.tsx', code, 'utf8');
  console.log("Sorted successfully.");
} else {
  console.log("Target not found. Doing a regex replace just in case...");
  const regexTarget = /return matchStatus && matchClass && matchSection && matchSearch;\r?\n\s*\}\);\r?\n\s*\}, \[students, selectedClass, selectedSection, searchQuery\]\);/;
  const regexReplacement = `return matchStatus && matchClass && matchSection && matchSearch;
    }).sort((a, b) => {
      const rollA = Number(a.rollNumber) || 0;
      const rollB = Number(b.rollNumber) || 0;
      return rollA - rollB;
    });
  }, [students, selectedClass, selectedSection, searchQuery]);`;
  
  if (regexTarget.test(code)) {
    code = code.replace(regexTarget, regexReplacement);
    fs.writeFileSync('src/pages/Attendance.tsx', code, 'utf8');
    console.log("Regex replacement successful.");
  } else {
    console.log("Failed completely.");
  }
}
