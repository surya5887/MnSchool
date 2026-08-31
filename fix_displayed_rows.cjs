const fs = require('fs');
let code = fs.readFileSync('src/pages/StudentProfile.tsx', 'utf8');

const returnStr = '  return (\r\n    <motion.div';
const fallbackReturnStr = '  return (\n    <motion.div';

const displayedRowsCode = `  const displayedRows = filterMonth === 'All' 
    ? ledgerRows.slice().reverse() 
    : ledgerRows.slice().reverse().filter(t => t.date.startsWith(filterMonth));\n\n`;

if (code.includes(returnStr)) {
    code = code.replace(returnStr, displayedRowsCode + returnStr);
} else if (code.includes(fallbackReturnStr)) {
    code = code.replace(fallbackReturnStr, displayedRowsCode + fallbackReturnStr);
} else {
    // try generic replace
    const genericReturn = '  return (';
    code = code.replace(genericReturn, displayedRowsCode + genericReturn);
}

fs.writeFileSync('src/pages/StudentProfile.tsx', code, 'utf8');
console.log("Fixed displayedRows");
