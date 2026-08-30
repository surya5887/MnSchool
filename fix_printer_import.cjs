const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');

// Also printTransaction is never read because I failed to render the <FeeReceiptPrintView /> at the bottom.
// Wait, my node script output "Rendered FeeReceiptPrintView" - so it did replace it?
// Let's check why `printTransaction` is "never read".
if (!content.includes('<FeeReceiptPrintView')) {
    const renderTarget = `</motion.div>\r\n  );\r\n};`;
    const renderReplacement = `      {printTransaction && (\r\n        <FeeReceiptPrintView \r\n          student={student} \r\n          transaction={printTransaction} \r\n          classNameStr={classNameMap[student.classId] || 'Unknown'} \r\n        />\r\n      )}\r\n    </motion.div>\r\n  );\r\n};`;
    
    // try replacing with regex to ignore newline differences
    const renderRegex = /<\/motion\.div>\s*\);\s*\};/;
    content = content.replace(renderRegex, renderReplacement);
}

if (!content.includes('Printer')) {
    content = content.replace(
        "import { IndianRupee, Plus, FileText, AlertTriangle, ArrowLeft, Camera, X, Edit, Save, Trash2 } from 'lucide-react';",
        "import { IndianRupee, Plus, FileText, AlertTriangle, ArrowLeft, Camera, X, Edit, Save, Trash2, Printer } from 'lucide-react';"
    );
}
// Add FeeReceiptPrintView import
if (!content.includes('import FeeReceiptPrintView')) {
    content = content.replace(
        "import { uploadImageToCloudinary } from '../lib/cloudinary';",
        "import { uploadImageToCloudinary } from '../lib/cloudinary';\nimport FeeReceiptPrintView from '../components/FeeReceiptPrintView';"
    );
}

fs.writeFileSync('src/pages/StudentProfile.tsx', content);
