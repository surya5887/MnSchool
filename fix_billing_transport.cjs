const fs = require('fs');
let content = fs.readFileSync('src/services/billingService.ts', 'utf8');

// We need to import getVehicles
if (!content.includes('getVehicles')) {
  content = content.replace(
    "import { getClasses } from './classService';",
    "import { getClasses } from './classService';\nimport { getVehicles } from './transportService';"
  );
}

// 1. Fetch vehicles alongside others
if (!content.includes('getVehicles()')) {
  content = content.replace(
    "getClasses(),",
    "getClasses(),\n      getVehicles(),"
  );
  content = content.replace(
    "const [students, classes, txns] = await Promise.all([",
    "const [students, classes, vehicles, txns] = await Promise.all(["
  );
}

// 2. Build transport map
const mapStr = `    const classMap = new Map();
    classes.forEach(c => {
      classMap.set(c.id, c.monthlyBaseFee || 0);
      classMap.set(c.className, c.monthlyBaseFee || 0);
    });`;

const newMapStr = `    const classMap = new Map();
    classes.forEach(c => {
      classMap.set(c.id, c.monthlyBaseFee || 0);
      classMap.set(c.className, c.monthlyBaseFee || 0);
    });

    const transportMap = new Map();
    if (typeof vehicles !== 'undefined') {
       vehicles.forEach(v => {
         const fee = parseInt(String(v.monthlyFee).replace(/\\D/g, '')) || 0;
         transportMap.set(v.route, fee);
       });
    }`;

if (content.includes(mapStr)) {
   content = content.replace(mapStr, newMapStr);
}

// 3. Add Transport logic in the loop
const oldBaseFeeLogic = `        if (baseFee > 0) {
          await addTransaction({
            type: 'Charge',
            category: 'Monthly Fee',
            amount: baseFee,
            date: today.toISOString().split('T')[0],
            description: \`\${monthName} \${currentYear} Base Fee\`,
            studentId: student.id,
            chargeType: 'Base Fee'
          });

          const updatedBilledMonths = [...billedMonths, currentMonthKey];
          await updateStudent(student.id, { billedMonths: updatedBilledMonths });
          generatedCount++;
          baseFeeGeneratedThisLoop = true;
          
          // Update live balance
          let currentBalance = studentBalances.get(student.id) || 0;
          studentBalances.set(student.id, currentBalance + baseFee);
        }`;

const newBaseFeeLogic = `        if (baseFee > 0) {
          await addTransaction({
            type: 'Charge',
            category: 'Monthly Fee',
            amount: baseFee,
            date: today.toISOString().split('T')[0],
            description: \`\${monthName} \${currentYear} Base Fee\`,
            studentId: student.id,
            chargeType: 'Base Fee'
          });

          let currentBalance = studentBalances.get(student.id) || 0;
          currentBalance += baseFee;

          // Process Transport Fee if applicable
          if (student.transportRoute && student.transportRoute !== 'Not Required' && student.transportRoute !== '') {
            const tFee = transportMap.get(student.transportRoute) || 0;
            if (tFee > 0) {
              await addTransaction({
                type: 'Charge',
                category: 'Transport Fee',
                amount: tFee,
                date: today.toISOString().split('T')[0],
                description: \`\${monthName} \${currentYear} Transport/Bus Fee\`,
                studentId: student.id,
                chargeType: 'Transport Fee'
              });
              currentBalance += tFee;
            }
          }

          const updatedBilledMonths = [...billedMonths, currentMonthKey];
          await updateStudent(student.id, { billedMonths: updatedBilledMonths });
          generatedCount++;
          baseFeeGeneratedThisLoop = true;
          
          studentBalances.set(student.id, currentBalance);
        }`;

if (content.includes('chargeType: \'Base Fee\'')) {
   content = content.replace(oldBaseFeeLogic, newBaseFeeLogic);
}

fs.writeFileSync('src/services/billingService.ts', content);
console.log("billingService.ts updated for transport");
