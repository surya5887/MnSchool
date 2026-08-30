const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');

if (!content.includes('.fee-receipt-container')) {
  content = content.replace(
    ".report-card-container, .report-card-container * {",
    ".report-card-container, .report-card-container *, .fee-receipt-container, .fee-receipt-container * {"
  );
  
  content = content.replace(
    ".report-card-container {",
    ".report-card-container, .fee-receipt-container {"
  );
  
  fs.writeFileSync('src/index.css', content);
  console.log("Added fee-receipt-container to print CSS");
}
