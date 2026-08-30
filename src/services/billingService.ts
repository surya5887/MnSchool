import { getStudents, updateStudent } from './studentService';
import { getClasses } from './classService';
import { addTransaction, getTransactions } from './financeService';

const LATE_FINE_AMOUNT = 50; // Default flat late fine

export const runAutomatedBilling = async () => {
  try {
    const [students, classes, txns] = await Promise.all([
      getStudents(),
      getClasses(),
      getTransactions()
    ]);
    
    const activeStudents = students.filter(s => s.status === 'Active');
    if (activeStudents.length === 0) return 0;

    const classMap = new Map();
    classes.forEach(c => {
      classMap.set(c.id, c.monthlyBaseFee || 0);
      classMap.set(c.className, c.monthlyBaseFee || 0);
    });

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentDay = today.getDate();
    
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
      const lateFeesApplied = student.lateFeesApplied || [];
      
      // Also ensure admission date isn't in the future compared to current month
      if (student.admissionDate) {
        const adminDate = new Date(student.admissionDate);
        if (adminDate.getFullYear() > currentYear || (adminDate.getFullYear() === currentYear && adminDate.getMonth() > today.getMonth())) {
          continue; 
        }
      }

      // --- 1. BASE FEE LOGIC ---
      let baseFeeGeneratedThisLoop = false;
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

          const updatedBilledMonths = [...billedMonths, currentMonthKey];
          await updateStudent(student.id, { billedMonths: updatedBilledMonths });
          generatedCount++;
          baseFeeGeneratedThisLoop = true;
          
          // Update live balance
          let currentBalance = studentBalances.get(student.id) || 0;
          studentBalances.set(student.id, currentBalance + baseFee);
        }
      }

      // --- 2. LATE FINE LOGIC ---
      // If today is 11th or later, check if they have dues > 0
      if (currentDay >= 11 && !lateFeesApplied.includes(currentMonthKey)) {
        const currentBalance = studentBalances.get(student.id) || 0;
        
        // If balance is > 0, they are a defaulter, apply late fine
        if (currentBalance > 0) {
          await addTransaction({
            type: 'Charge',
            category: 'Late Fine',
            amount: LATE_FINE_AMOUNT,
            date: today.toISOString().split('T')[0],
            description: `Late Fine for ${monthName} ${currentYear}`,
            studentId: student.id,
            chargeType: 'Late Fine'
          });

          // Fetch fresh student data to avoid overwriting billedMonths if it was just updated
          // Actually, we can just push to our local array and update
          const updatedLateFees = [...lateFeesApplied, currentMonthKey];
          
          // If we generated base fee in THIS EXACT LOOP, we need to merge the updates
          if (baseFeeGeneratedThisLoop) {
             const updatedBilledMonths = [...billedMonths, currentMonthKey];
             await updateStudent(student.id, { billedMonths: updatedBilledMonths, lateFeesApplied: updatedLateFees });
          } else {
             await updateStudent(student.id, { lateFeesApplied: updatedLateFees });
          }
          
          generatedCount++;
        }
      }
    }

    return generatedCount;
  } catch (error) {
    console.error("Error in automated billing:", error);
    return 0;
  }
};
