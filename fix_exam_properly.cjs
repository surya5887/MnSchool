const fs = require('fs');
let code = fs.readFileSync('src/pages/Examination.tsx', 'utf8');

// Put section back for ReportCard
code = code.replace("className={classFilter || 'Unknown Class'} \n           \n          maxMarks={maxMarks}", "className={classFilter || 'Unknown Class'} \n          section={sectionFilter} \n          maxMarks={maxMarks}");

// Also check TransferCertificatePrintView to ensure it DOES NOT have section
code = code.replace("<TransferCertificatePrintView \n        student={selectedStudent}\n        className={classFilter || 'Unknown Class'}\n        \n        onClose={() => setShowTCPrintView(false)}\n      />", "<TransferCertificatePrintView \n        student={selectedStudent}\n        className={classFilter || 'Unknown Class'}\n        onClose={() => setShowTCPrintView(false)}\n      />");

// The generic replace might have failed to fix TC if the new line was different.
// Let's just do a smarter regex:
code = code.replace(/<TransferCertificatePrintView\s+student=\{selectedStudent\}\s+className=\{classFilter \|\| 'Unknown Class'\}(\s+section=\{sectionFilter\})?\s+onClose=\{\(\) => setShowTCPrintView\(false\)\}\s+\/>/g, `<TransferCertificatePrintView 
        student={selectedStudent}
        className={classFilter || 'Unknown Class'}
        onClose={() => setShowTCPrintView(false)}
      />`);

fs.writeFileSync('src/pages/Examination.tsx', code);
console.log('Fixed');
