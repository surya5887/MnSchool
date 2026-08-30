const fs = require('fs');
let content = fs.readFileSync('src/pages/NewAdmission.tsx', 'utf8');

const oldHasDataStr = `const hasData = Object.keys(formData).some(key => {
          if (['status', 'admissionType', 'gender', 'feeGroup', 'transportRoute'].includes(key)) return false;
          return Boolean(formData[key as keyof typeof formData]);
        });`;

const newHasDataStr = `const hasData = Object.keys(formData).some(key => {
          // Ignore fields that have default values
          if (['status', 'admissionType', 'gender', 'feeGroup', 'transportRoute'].includes(key)) return false;
          
          const val = formData[key as keyof typeof formData];
          
          // Ignore empty strings, 0, or boolean false
          if (!val) return false;
          
          // Specifically ignore if phone is just the country code auto-inserted
          if (key === 'parentPhone' && (val === '+' || val === '+91' || val === '91')) return false;
          
          // Ignore if the value hasn't changed from the initial state
          const initialVal = INITIAL_FORM_DATA[key as keyof typeof INITIAL_FORM_DATA];
          if (val === initialVal) return false;

          return true;
        });`;

content = content.replace(oldHasDataStr, newHasDataStr);
fs.writeFileSync('src/pages/NewAdmission.tsx', content, 'utf8');
console.log("hasData fixed!");
