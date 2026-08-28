const fs = require('fs');

let code = fs.readFileSync('src/pages/Examination.tsx', 'utf8');

const replacement = `  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setClassFilter(e.target.value);
  };

  const calculateGrade = (total: number) => {`;

code = code.replace('  const calculateGrade = (total: number) => {', replacement);

fs.writeFileSync('src/pages/Examination.tsx', code);
console.log('Fixed handleClassChange');
