import re

file_path = 'src/components/ReportCardPrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Faster Save using Promise.all
handle_save_old = """  const handleSaveAndPrint = async (mode: 'both' | 'front' | 'back') => {
    setPrintMode(mode);
    setSaving(true);
    try {
      for (const student of students) {
        const studentClass = classes.find(c => c.className === className);
        let subjects = studentClass?.subjects || [];
        if (subjects.length === 0) {
          subjects = ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer'];
        }
        
        for (const subj of subjects) {
          const key = `${student.id}_${subj}`;
          const m = localMarks[key];
          if (m) {
            await saveExamMark({
              studentId: student.id as string,
              examTerm: 'Half Yearly Exam',
              subject: subj,
              theoryMarks: m.halfYearlyTerm,
              practicalMarks: m.halfYearlyPeriodic
            });
            await saveExamMark({
              studentId: student.id as string,
              examTerm: 'Annual Exam',
              subject: subj,
              theoryMarks: m.annualTerm,
              practicalMarks: m.annualPeriodic
            });
          }
        }

        const mt = localMeta[student.id!];
        if (mt) {
          // If remarks were auto-generated but not saved yet, calculate them here
          let finalRemarks = mt.remarks;
          if (!finalRemarks) {
             let grandTotal = 0;
             let possibleTotal = 0;
             subjects.forEach(subj => {
                const k = `${student.id}_${subj}`;
                const mk = localMarks[k];
                if(mk) {
                  grandTotal += mk.halfYearlyPeriodic + mk.halfYearlyTerm + mk.annualPeriodic + mk.annualTerm;
                  possibleTotal += 200;
                }
             });
             const isPass = possibleTotal > 0 && ((grandTotal/possibleTotal)*100) >= 33;
             finalRemarks = isPass ? 'EXCELLENT' : 'NEEDS IMPROVEMENT';
          }

          await saveReportCardMeta({
            studentId: student.id as string,
            session,
            workEducation: mt.work,
            artEducation: mt.art,
            healthEducation: mt.health,
            teacherRemarks: finalRemarks,
            issueDate: mt.date,
            attendance: mt.attendance
          });
        }
      }
      
      // Delay slightly so save completes visually before print dialog blocks thread
      setTimeout(() => {
        window.print();
      }, 500);

    } catch (err) {
      console.error(err);
      alert('Error saving data.');
    } finally {
      setSaving(false);
    }
  };"""

handle_save_new = """  const handleSaveAndPrint = async (mode: 'both' | 'front' | 'back') => {
    setPrintMode(mode);
    setSaving(true);
    try {
      const promises: Promise<any>[] = [];
      for (const student of students) {
        const studentClass = classes.find(c => c.className === className);
        let subjects = studentClass?.subjects || [];
        if (subjects.length === 0) {
          subjects = ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer'];
        }
        
        for (const subj of subjects) {
          const key = `${student.id}_${subj}`;
          const m = localMarks[key];
          if (m) {
            promises.push(saveExamMark({
              studentId: student.id as string,
              examTerm: 'Half Yearly Exam',
              subject: subj,
              theoryMarks: m.halfYearlyTerm,
              practicalMarks: m.halfYearlyPeriodic
            }));
            promises.push(saveExamMark({
              studentId: student.id as string,
              examTerm: 'Annual Exam',
              subject: subj,
              theoryMarks: m.annualTerm,
              practicalMarks: m.annualPeriodic
            }));
          }
        }

        const mt = localMeta[student.id!];
        if (mt) {
          let finalRemarks = mt.remarks;
          if (!finalRemarks) {
             let grandTotal = 0;
             let possibleTotal = 0;
             subjects.forEach(subj => {
                const k = `${student.id}_${subj}`;
                const mk = localMarks[k];
                if(mk) {
                  grandTotal += mk.halfYearlyPeriodic + mk.halfYearlyTerm + mk.annualPeriodic + mk.annualTerm;
                  possibleTotal += 200;
                }
             });
             const isPass = possibleTotal > 0 && ((grandTotal/possibleTotal)*100) >= 33;
             finalRemarks = isPass ? 'EXCELLENT' : 'NEEDS IMPROVEMENT';
          }
          promises.push(saveReportCardMeta({
            studentId: student.id as string,
            session,
            workEducation: mt.work,
            artEducation: mt.art,
            healthEducation: mt.health,
            teacherRemarks: finalRemarks,
            issueDate: mt.date,
            attendance: mt.attendance
          }));
        }
      }
      
      await Promise.all(promises);
      
      // Extremely short timeout just to allow React state to commit printMode class
      setTimeout(() => {
        window.print();
        setSaving(false);
      }, 50);

    } catch (err) {
      console.error(err);
      alert('Error saving data.');
      setSaving(false);
    }
  };"""
content = content.replace(handle_save_old, handle_save_new)

# 2. Fix the Date input line
date_old = """<span style={{ fontWeight: 'bold' }}>Date:</span> 
                        <input type="text" className="editable-cell" style={{width: '150px', marginLeft: '10px', textAlign: 'center', borderBottom: '1px solid #000', background: 'transparent'}} value={metaData.date} onChange={e => setLocalMeta({...localMeta, [student.id!]: {...metaData, date: e.target.value}})} />"""
date_new = """<span style={{ fontWeight: 'bold', fontSize: '15px' }}>Date:</span> 
                        <div style={{ width: '150px', marginLeft: '10px', borderBottom: '1px solid #000' }}>
                          <input type="text" className="editable-cell" style={{width: '100%', textAlign: 'center', background: 'transparent', border: 'none', outline: 'none', fontSize: '15px'}} value={metaData.date} onChange={e => setLocalMeta({...localMeta, [student.id!]: {...metaData, date: e.target.value}})} />
                        </div>"""
content = content.replace(date_old, date_new)

# Move signatures to the left by removing padding
content = content.replace("padding: 0 20px;", "padding: 0;")

# 3. Increase font size and weight for editable cell in print CSS
content = content.replace("min-width: 0 !important; width: 100% !important; font-size: 12px !important;", "min-width: 0 !important; width: 100% !important; font-size: 13px !important; font-weight: bold !important; color: #000 !important;")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Applied fixes.")
