import { getStudents, updateStudent } from './studentService';
import { getClasses } from './classService';
import { addTransaction } from './financeService';

export const runAutomatedBilling = async () => {
  try {
    const students = await getStudents();
    const activeStudents = students.filter(s => s.status === 'Active');
    if (activeStudents.length === 0) return 0;

    const classes = await getClasses();
    const classMap = new Map(classes.map(c => [c.id, c.monthlyBaseFee || 0]));

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12
    
    // Only check current month for simplicity
    const currentMonthKey = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthName = monthNames[today.getMonth()];

    let generatedCount = 0;

    for (const student of activeStudents) {
      if (!student.id || !student.classId) continue;
      
      const billedMonths = student.billedMonths || [];
      // Also ensure admission date isn't in the future compared to current month
      if (student.admissionDate) {
        const adminDate = new Date(student.admissionDate);
        if (adminDate.getFullYear() > currentYear || (adminDate.getFullYear() === currentYear && adminDate.getMonth() > today.getMonth())) {
          continue; // Student admitted in future month (shouldn't happen often, but safety check)
        }
      }

      if (!billedMonths.includes(currentMonthKey)) {
        // Need to bill for this month
        let baseFee = classMap.get(student.classId) || 0;
        
        // Apply discount if any
        if (baseFee > 0 && student.discountPercent && student.discountPercent > 0) {
          const discount = (baseFee * student.discountPercent) / 100;
          baseFee = Math.max(0, baseFee - discount);
        }
        
        if (baseFee > 0) {
          // Add transaction
          await addTransaction({
            type: 'Charge',
            category: 'Monthly Fee',
            amount: baseFee,
            date: today.toISOString().split('T')[0],
            description: `${monthName} ${currentYear} Base Fee`,
            studentId: student.id,
            chargeType: 'Base Fee'
          });

          // Update student
          const updatedBilledMonths = [...billedMonths, currentMonthKey];
          await updateStudent(student.id, { billedMonths: updatedBilledMonths });
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
