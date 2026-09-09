import re

file_path = 'src/components/DateSheetPrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """    const dates = Array.from(new Set(allSchedules.flatMap(s => s.schedule.map(item => item.date)))).sort();
    const classIds = Array.from(new Set(allSchedules.map(s => s.classId))).sort((a,b) => classOrder.indexOf(a) - classOrder.indexOf(b));

    const getSubjectForClassDate = (cid: string, d: string) => {
      const classSched = allSchedules.find(s => s.classId === cid);
      if (!classSched) return null;
      return classSched.schedule.find(item => item.date === d);
    };"""

new_logic = """    let dates: string[] = [];
    let classIds: string[] = [];
    
    if (scheduleData.classId === 'MASTER') {
       if (scheduleData.schedule.length > 0) {
         try {
           const firstRow = JSON.parse(scheduleData.schedule[0].subject);
           classIds = firstRow.classes || [];
           dates = scheduleData.schedule.map(s => s.date).filter(Boolean).sort();
         } catch(e) {}
       }
    } else {
       dates = Array.from(new Set(allSchedules.flatMap(s => s.schedule.map(item => item.date)))).sort();
       classIds = Array.from(new Set(allSchedules.map(s => s.classId))).sort((a,b) => classOrder.indexOf(a) - classOrder.indexOf(b));
    }

    const getSubjectForClassDate = (cid: string, d: string) => {
      if (scheduleData.classId === 'MASTER') {
        const row = scheduleData.schedule.find(s => s.date === d);
        if (!row) return null;
        try {
           const parsed = JSON.parse(row.subject);
           return { subject: parsed.subjects[cid] || '' };
        } catch(e) { return null; }
      }
      
      const classSched = allSchedules.find(s => s.classId === cid);
      if (!classSched) return null;
      return classSched.schedule.find(item => item.date === d);
    };"""

content = content.replace(old_logic, new_logic)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated DateSheetPrintView logic")
