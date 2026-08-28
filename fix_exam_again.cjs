const fs = require('fs');
let code = fs.readFileSync('src/pages/Examination.tsx', 'utf8');

code = code.replace(/<ReportCardPrintView[\s\S]*?\/>/, `<ReportCardPrintView 
        students={[selectedStudent]} 
        marks={printMarks} 
        term={examType} 
        className={classFilter || 'Unknown Class'} 
        section={sectionFilter} 
        maxMarks={maxMarks}
        onClose={() => setShowPrintView(false)} 
      />`);

code = code.replace(/<TransferCertificatePrintView[\s\S]*?\/>/, `<TransferCertificatePrintView 
        student={selectedStudent}
        className={classFilter || 'Unknown Class'}
        onClose={() => setShowTCPrintView(false)}
      />`);

fs.writeFileSync('src/pages/Examination.tsx', code);
console.log('Fixed for sure');
