import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Save, CheckCircle, Award } from 'lucide-react';
import { getStudents, type StudentData } from '../services/studentService';
import { getClasses, type ClassData } from '../services/classService';
import { getExamMarks, saveExamMark, getAllExamMarksForTerm, type ExamMarkData } from '../services/examService';
import ReportCardPrintView from '../components/ReportCardPrintView';

const Examination: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [examType, setExamType] = useState('Half Yearly Exam');
  const [maxMarks, setMaxMarks] = useState(100);
  
  const [activeSections, setActiveSections] = useState<string[]>([]);
  const [activeSubjects, setActiveSubjects] = useState<string[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  
  const [marksMap, setMarksMap] = useState<Record<string, { theory: number; practical: number }>>({});
  const [saved, setSaved] = useState(false);
  
  const [showPrintView, setShowPrintView] = useState(false);
  const [printMarks, setPrintMarks] = useState<ExamMarkData[]>([]);

  const maxTheory = Math.round(maxMarks * 0.8);
  const maxPractical = Math.round(maxMarks * 0.2);

  useEffect(() => {
    getClasses().then(setClasses);
    getStudents().then(setStudents);
  }, []);

  useEffect(() => {
    if (classFilter) {
      const cls = classes.find(c => c.className === classFilter);
      if (cls) {
        setActiveSections(cls.sections || []);
        setActiveSubjects(cls.subjects || []);
      }
    } else {
      setActiveSections([]);
      setActiveSubjects([]);
    }
    setSectionFilter('');
    setSubjectFilter('');
  }, [classFilter, classes]);

  useEffect(() => {
    let filtered = students;
    if (classFilter) {
      const classId = classes.find(c => c.className === classFilter)?.id;
      filtered = filtered.filter(s => s.classId === classId);
    }
    if (sectionFilter) {
      filtered = filtered.filter(s => s.sectionId === sectionFilter);
    }
    setFilteredStudents(filtered);
  }, [classFilter, sectionFilter, students, classes]);

  useEffect(() => {
    if (examType && subjectFilter && filteredStudents.length > 0) {
      const fetchMarks = async () => {
        const marksData = await getExamMarks(examType, subjectFilter);
        const newMap: Record<string, { theory: number; practical: number }> = {};
        marksData.forEach(m => {
          newMap[m.studentId] = { theory: m.theoryMarks, practical: m.practicalMarks };
        });
        setMarksMap(newMap);
      };
      fetchMarks();
    } else {
      setMarksMap({});
    }
  }, [examType, subjectFilter, filteredStudents]);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setClassFilter(e.target.value);
  };

  const handleMarkChange = (studentId: string, type: 'theory' | 'practical', value: string) => {
    let numVal = parseInt(value, 10);
    if (isNaN(numVal)) numVal = 0;
    
    // Validation
    if (type === 'theory' && numVal > maxTheory) numVal = maxTheory;
    if (type === 'practical' && numVal > maxPractical) numVal = maxPractical;
    if (numVal < 0) numVal = 0;

    setMarksMap(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { theory: 0, practical: 0 }),
        [type]: numVal
      }
    }));
  };

  const calculateGrade = (total: number) => {
    const percent = (total / maxMarks) * 100;
    if (percent >= 91) return 'A1';
    if (percent >= 81) return 'A2';
    if (percent >= 71) return 'B1';
    if (percent >= 61) return 'B2';
    if (percent >= 51) return 'C1';
    if (percent >= 41) return 'C2';
    if (percent >= 33) return 'D';
    return 'E';
  };

  const handleSaveMarks = async () => {
    if (!subjectFilter) {
      alert("Please select a subject first.");
      return;
    }
    for (const student of filteredStudents) {
      const marks = marksMap[student.id!] || { theory: 0, practical: 0 };
      await saveExamMark({
        studentId: student.id!,
        examTerm: examType,
        subject: subjectFilter,
        theoryMarks: marks.theory || 0,
        practicalMarks: marks.practical || 0
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDownloadTemplate = () => {
    if (filteredStudents.length === 0) {
      alert("No students to export.");
      return;
    }
    // Generate CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Roll No,Student Name,Theory Marks (Max " + maxTheory + "),Practical Marks (Max " + maxPractical + ")\r\n";
    
    filteredStudents.forEach(student => {
      const theory = marksMap[student.id!]?.theory || 0;
      const prac = marksMap[student.id!]?.practical || 0;
      const row = `"${student.rollNumber || ''}","${student.firstName} ${student.lastName}",${theory},${prac}`;
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Marks_Template_${classFilter}_${sectionFilter}_${subjectFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateReportCards = async () => {
    if (filteredStudents.length === 0) {
      alert("Please select a class with students first.");
      return;
    }
    // Fetch all marks for this term
    const allMarks = await getAllExamMarksForTerm(examType);
    setPrintMarks(allMarks);
    setShowPrintView(true);
  };

  if (showPrintView) {
    return (
      <ReportCardPrintView 
        students={filteredStudents} 
        marks={printMarks} 
        term={examType} 
        className={classFilter || 'All Classes'} 
        section={sectionFilter} 
        maxMarks={maxMarks}
        onClose={() => setShowPrintView(false)} 
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title"><FileText size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Examinations & Results</h1>
          <p className="page-subtitle">Enter student marks, grade automatically, and generate beautiful PDF report cards.</p>
        </div>
        <button className="btn-primary" onClick={handleGenerateReportCards}><Award size={18} /> Generate Report Cards (PDF)</button>
      </div>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Class</label>
          <select className="glass-input" value={classFilter} onChange={handleClassChange}>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c.id} value={c.className}>{c.className}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Section</label>
          <select className="glass-input" value={sectionFilter} onChange={e => setSectionFilter(e.target.value)} disabled={!classFilter}>
            <option value="">All Sections</option>
            {activeSections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Subject</label>
          <select className="glass-input" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} disabled={!classFilter}>
             <option value="">Select Subject</option>
             {activeSubjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Exam Term</label>
          <select className="glass-input" value={examType} onChange={(e) => setExamType(e.target.value)}>
            <option>Half Yearly Exam</option>
            <option>Final Annual Exam</option>
            <option>Unit Test 1</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Max Marks</label>
          <input type="number" className="glass-input" value={maxMarks} onChange={(e) => setMaxMarks(Number(e.target.value) || 0)} min="10" />
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', background: 'rgba(99, 102, 241, 0.05)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
            Marks Entry {subjectFilter ? `: ${subjectFilter} (${examType})` : ''}
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{filteredStudents.length} Students {classFilter ? `in ${classFilter} ${sectionFilter}` : ''}</span>
        </div>
        
        <div className="glass-table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Roll No.</th>
                <th>Student Name</th>
                <th>Theory Marks ({maxTheory})</th>
                <th>Practical Marks ({maxPractical})</th>
                <th>Total & Grade (Auto)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const theory = marksMap[student.id!]?.theory || 0;
                const prac = marksMap[student.id!]?.practical || 0;
                const total = theory + prac;
                const grade = calculateGrade(total);

                return (
                  <tr key={student.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{student.rollNumber || '-'}</td>
                    <td style={{ fontWeight: 500 }}>{student.firstName} {student.lastName}</td>
                    <td><input type="number" max={maxTheory} min="0" value={theory.toString()} onChange={e => handleMarkChange(student.id!, 'theory', e.target.value)} className="glass-input" style={{ width: '80px', padding: '6px' }}/></td>
                    <td><input type="number" max={maxPractical} min="0" value={prac.toString()} onChange={e => handleMarkChange(student.id!, 'practical', e.target.value)} className="glass-input" style={{ width: '80px', padding: '6px' }}/></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{total}</span>
                        <span className={`badge ${(total/maxMarks*100) >= 33 ? 'success' : 'danger'}`}>{grade}</span>
                      </div>
                    </td>
                    <td>
                       {marksMap[student.id!] ? <button className="btn-secondary" style={{ padding: '6px 12px', border: '1px solid var(--success)', color: 'var(--success)' }}><CheckCircle size={14} /> Saved</button> : <span style={{ color: 'var(--text-muted)' }}>Pending</span>}
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No students found in this class.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button className="btn-secondary" onClick={handleDownloadTemplate}><Download size={18} /> Download Excel Template</button>
          <button className="btn-primary" style={{ padding: '10px 32px' }} onClick={handleSaveMarks}><Save size={18} /> Save All Marks</button>
        </div>
      </div>
      <AnimatePresence>
        {saved && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed', bottom: '40px', right: '40px',
              background: 'var(--success)', color: 'white',
              padding: '16px 24px', borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
              display: 'flex', alignItems: 'center', gap: '12px',
              fontWeight: 600, zIndex: 1000
            }}
          >
            <CheckCircle size={24} /> Marks Saved Successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Examination;
