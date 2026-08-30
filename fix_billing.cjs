const fs = require('fs');
let content = fs.readFileSync('src/services/billingService.ts', 'utf8');

content = content.replace(
  "const classMap = new Map(classes.map(c => [c.id, c.monthlyBaseFee || 0]));",
  `const classMap = new Map();
    classes.forEach(c => {
      classMap.set(c.id, c.monthlyBaseFee || 0);
      classMap.set(c.className, c.monthlyBaseFee || 0);
    });`
);

fs.writeFileSync('src/services/billingService.ts', content);
console.log("billingService.ts updated");
