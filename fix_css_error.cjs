const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

// Remove everything after the first `/* --- PRINT STYLES FOR REPORT CARDS --- */`
const marker = "/* --- PRINT STYLES FOR REPORT CARDS --- */";
if (css.includes(marker)) {
  css = css.substring(0, css.indexOf(marker));
}

// Add the correct block once
css += `
/* --- PRINT STYLES FOR REPORT CARDS --- */
@media print {
  body * {
    visibility: hidden;
  }
  .sidebar-container, .top-header {
    display: none !important;
  }
  .app-container, .main-content {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    overflow: visible !important;
  }
  .report-card-container, .report-card-container * {
    visibility: visible;
  }
  .report-card-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 0;
  }
  .report-card-page {
    width: 100%;
    page-break-after: always;
    margin: 0;
    padding: 20px !important;
    box-sizing: border-box;
  }
  @page {
    margin: 1cm;
    size: A4 portrait;
  }
}
`;

fs.writeFileSync('src/index.css', css);
console.log('CSS fixed');
