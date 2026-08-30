import { getStudents, updateStudent } from './studentService';
import { getClasses } from './classService';
import { getVehicles } from './transportService';
import { addTransaction, getTransactions } from './financeService';


export const runAutomatedBilling = async () => {
  try {
    const [students, classes, vehicles, txns] = await Promise.all([
      getStudents(),
      getClasses(),
      getVehicles(),
      getTransactions()
    ]);
    
    const activeStudents = students.filter(s => s.status === 'Active');
    if (activeStudents.length === 0) return 0;

    const classMap = new Map();
    classes.forEach(c => {
      classMap.set(c.id, c.monthlyBaseFee || 0);
      classMap.set(c.className, c.monthlyBaseFee || 0);
    });

    const transportMap = new Map();
    if (typeof vehicles !== 'undefined') {
       vehicles.forEach(v => {
         const fee = parseInt(String(v.monthlyFee).replace(/\D/g, '')) || 0;
         transportMap.set(v.route, fee);
       });
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12
        
    const currentMonthKey = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthName = monthNames[today.getMonth()];

    // Pre-calculate balances for all students
    const studentBalances = new Map<string, number>();
    txns.forEach(t => {
      if (t.studentId) {
        let currentBalance = studentBalances.get(t.studentId) || 0;
        if (t.type === 'Charge') currentBalance += t.amount;
        else if (t.type === 'Income' || t.type === 'Discount') currentBalance -= t.amount;
        studentBalances.set(t.studentId, currentBalance);
      }
    });

    let generatedCount = 0;

    for (const student of activeStudents) {
      if (!student.id || !student.classId) continue;
      
      const billedMonths = student.billedMonths || [];
            
      // Also ensure admission date isn't in the future compared to current month
      if (student.admissionDate) {
        const adminDate = new Date(student.admissionDate);
        if (adminDate.getFullYear() > currentYear || (adminDate.getFullYear() === currentYear && adminDate.getMonth() > today.getMonth())) {
          continue; 
        }
      }

      // --- 1. BASE FEE LOGIC ---
            if (!billedMonths.includes(currentMonthKey)) {
        let baseFee = classMap.get(student.classId) || 0;
        
        // Apply discount if any
        if (baseFee > 0 && student.discountPercent && student.discountPercent > 0) {
          const discount = (baseFee * student.discountPercent) / 100;
          baseFee = Math.max(0, baseFee - discount);
        }
        
        if (baseFee > 0) {
          await addTransaction({
            type: 'Charge',
            category: 'Monthly Fee',
            amount: baseFee,
            date: today.toISOString().split('T')[0],
            description: `${monthName} ${currentYear} Base Fee`,
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
                description: `${monthName} ${currentYear} Transport/Bus Fee`,
                studentId: student.id,
                chargeType: 'Transport Fee'
              });
              currentBalance += tFee;
            }
          }

          const updatedBilledMonths = [...billedMonths, currentMonthKey];
          await updateStudent(student.id, { billedMonths: updatedBilledMonths });
          generatedCount++;
                    
          studentBalances.set(student.id, currentBalance);
        }
      }

      // --- 2. LATE FINE LOGIC REMOVED --- 
        // Late fines are disabled to prevent unexpected automatic charges.
    }

    return generatedCount;
  } catch (error) {
    console.error("Error in automated billing:", error);
    return 0;
  }
};
