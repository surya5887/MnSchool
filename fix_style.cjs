const fs = require('fs');
let code = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

const oldStyle = `<style>{\`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      \`}</style>`;

const newStyle = `<style>{\`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* Mobile Responsiveness for Announcements */
        @media (max-width: 768px) {
          .header-card {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 20px !important;
            padding: 24px 20px !important;
          }
          .smart-typing-toggle {
            width: 100% !important;
            justify-content: space-between !important;
            padding: 12px 16px !important;
            box-sizing: border-box !important;
          }
          .composer-card, .recipients-card, .template-card {
            padding: 24px 20px !important;
          }
          .composer-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .composer-btn {
            width: 100% !important;
            justify-content: center !important;
          }
          .toolbar-container {
            width: 100% !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .search-container {
            width: 100% !important;
          }
          .search-input {
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .toolbar-buttons {
            display: flex !important;
            width: 100% !important;
            gap: 12px !important;
          }
          .toolbar-buttons > button {
            flex: 1 !important;
            justify-content: center !important;
            padding: 12px !important;
            font-size: 0.9rem !important;
          }
          .header-title {
            font-size: 1.5rem !important;
          }
        }
      \`}</style>`;

if(code.includes(oldStyle)) {
  code = code.replace(oldStyle, newStyle);
  console.log("Style injected exactly.");
} else {
  // Try regex if exact match fails
  code = code.replace(/<style>\{`[\s\S]*?`\}<\/style>/, newStyle);
  console.log("Style injected via regex.");
}

fs.writeFileSync('src/pages/Announcements.tsx', code, 'utf8');
