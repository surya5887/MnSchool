const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ArrowLeft, Save, CheckCircle, Award, FileOutput, Printer } from 'lucide-react';
import { getStudents, type StudentData } from '../services/studentService';
import { getClasses, type ClassData } from '../services/classService';
import { saveExamMark, getAllExamMarksForTerm, type ExamMarkData } from '../services/examService';
import ReportCardPrintView from '../components/ReportCardPrintView';
import TransferCertificatePrintView from '../components/TransferCertificatePrintView';

const Examination: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  
  // Main Page Filters
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  
  const [activeSections, setActiveSections] = useState<string[]>([]);
  const [activeSubjects, setActiveSubjects] = useState<string[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  
  // Navigation State
  const [view, setView] = useState<'main' | 'report_config' | 'tc_config'>('main');
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

  // Report Config State
  const [examType, setExamType] = useState('Half Yearly Exam');
  const [maxMarks, setMaxMarks] = useState(100);
  const [marksMap, setMarksMap] = useState<Record<string, { theory: number; practical: number }>>({});
  const [saved, setSaved] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [printMarks, setPrintMarks] = useState<ExamMarkData[]>([]);

  // TC Config State
  const [showTCPrintView, setShowTCPrintView] = useState(false);

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
  }, [classFilter, classes]);

  useEffect(() => {
    if (!classFilter) {
      setFilteredStudents([]); // Don't show students if no class is selected
      return;
    }
    let filtered = students;
    const classId = classes.find(c => c.className === classFilter)?.id;
    filtered = filtered.filter(s => s.classId === classId);
    if (sectionFilter) {
      filtered = filtered.filter(s => s.sectionId === sectionFilter);
    }
    setFilteredStudents(filtered);
  }, [classFilter, sectionFilter, students, classes]);

  // Fetch marks when a student is selected for Report Card
  useEffect(() => {
    if (view === 'report_config' && selectedStudent && examType) {
      const fetchMarks = async () => {
        const marksData = await getAllExamMarksForTerm(examType);
        // Filter marks for this specific student
        const studentMarks = marksData.filter(m => m.studentId === selectedStudent.id);
        
        const newMap: Record<string, { theory: number; practical: number }> = {};
        studentMarks.forEach(m => {
          newMap[m.subject] = { theory: m.theoryMarks, practical: m.practicalMarks };
        });
        setMarksMap(newMap);
      };
      fetchMarks();
    }
  }, [view, selectedStudent, examType]);

  const handleMarkChange = (subject: string, type: 'theory' | 'practical', value: string) => {
    let numVal = parseInt(value, 10);
    if (isNaN(numVal)) numVal = 0;
    if (type === 'theory' && numVal > maxTheory) numVal = maxTheory;
    if (type === 'practical' && numVal > maxPractical) numVal = maxPractical;
    if (numVal < 0) numVal = 0;

    setMarksMap(prev => ({
      ...prev,
      [subject]: {
        ...(prev[subject] || { theory: 0, practical: 0 }),
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

  const handleSaveStudentMarks = async () => {
    if (!selectedStudent) return;
    const promises = Object.keys(marksMap).map(subject => {
      const marks = marksMap[subject];
      return saveExamMark({
        studentId: selectedStudent.id!,
        examTerm: examType,
        subject,
        theoryMarks: marks.theory || 0,
        practicalMarks: marks.practical || 0
      });
    });
    
    await Promise.all(promises);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePrintReportCard = async () => {
    // Generate for the single selected student
    const allMarks = await getAllExamMarksForTerm(examType);
    setPrintMarks(allMarks);
    setShowPrintView(true);
  };

  if (showPrintView && selectedStudent) {
    return (
      <ReportCardPrintView 
        students={[selectedStudent]} 
        marks={printMarks} 
        term={examType} 
        className={classFilter || 'Unknown Class'} 
        section={sectionFilter} 
        maxMarks={maxMarks}
        onClose={() => setShowPrintView(false)} 
      />
    );
  }

  if (showTCPrintView && selectedStudent) {
    return (
      <TransferCertificatePrintView 
        student={selectedStudent}
        className={classFilter || 'Unknown Class'}
        section={sectionFilter}
        onClose={() => setShowTCPrintView(false)}
      />
    );
  }

  // --- SUB-VIEW: REPORT CONFIG ---
  if (view === 'report_config' && selectedStudent) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button className="btn-secondary" style={{ padding: '8px 12px' }} onClick={() => setView('main')}>
            <ArrowLeft size={20} /> Back
          </button>
          <div>
            <h2 style={{ margin: 0 }}>Generate Report Card: {selectedStudent.firstName} {selectedStudent.lastName}</h2>
            <span style={{ color: 'var(--text-muted)' }}>Roll No: {selectedStudent.rollNumber} | Class: {classFilter} {sectionFilter}</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Exam Term</label>
            <select className="glass-input" value={examType} onChange={(e) => setExamType(e.target.value)}>
              <option>Half Yearly Exam</option>
              <option>Final Annual Exam</option>
              <option>Unit Test 1</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Max Marks (Total per subject)</label>
            <input type="number" className="glass-input" value={maxMarks} onChange={(e) => setMaxMarks(Number(e.target.value) || 0)} min="10" />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Enter Marks</h3>
          {activeSubjects.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', padding: '0 16px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                <div>Subject</div>
                <div>Theory (Max {maxTheory})</div>
                <div>Practical (Max {maxPractical})</div>
                <div>Total & Grade</div>
              </div>
              
              {activeSubjects.map(subj => {
                const theory = marksMap[subj]?.theory || 0;
                const prac = marksMap[subj]?.practical || 0;
                const total = theory + prac;
                const grade = calculateGrade(total);

                return (
                  <div key={subj} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ fontWeight: 600 }}>{subj}</div>
                    <div>
                      <input type="number" max={maxTheory} min="0" value={theory.toString()} onChange={e => handleMarkChange(subj, 'theory', e.target.value)} className="glass-input" style={{ width: '100px', padding: '8px' }}/>
                    </div>
                    <div>
                      <input type="number" max={maxPractical} min="0" value={prac.toString()} onChange={e => handleMarkChange(subj, 'practical', e.target.value)} className="glass-input" style={{ width: '100px', padding: '8px' }}/>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{total}</span>
                      <span className={\`badge \${(total/maxMarks*100) >= 33 ? 'success' : 'danger'}\`}>{grade}</span>
                    </div>
                  </div>
                );
              })}
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button className="btn-secondary" style={{ padding: '12px 24px' }} onClick={handleSaveStudentMarks}>
                  <Save size={18} /> Save Marks
                </button>
                <button className="btn-primary" style={{ padding: '12px 24px' }} onClick={handlePrintReportCard}>
                  <Printer size={18} /> Print Report Card
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              No subjects assigned to this class. Add subjects in Classes & Sections.
            </div>
          )}
        </div>
        
        <AnimatePresence>
          {saved && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} style={{ position: 'fixed', bottom: '40px', right: '40px', background: 'var(--success)', color: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, zIndex: 1000 }}>
              <CheckCircle size={24} /> Marks Saved Successfully!
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // --- SUB-VIEW: TC CONFIG ---
  if (view === 'tc_config' && selectedStudent) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button className="btn-secondary" style={{ padding: '8px 12px' }} onClick={() => setView('main')}>
            <ArrowLeft size={20} /> Back
          </button>
          <div>
            <h2 style={{ margin: 0 }}>Generate TC: {selectedStudent.firstName} {selectedStudent.lastName}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
            Click below to generate and print the Transfer Certificate for {selectedStudent.firstName}.
          </p>
          <button className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.2rem' }} onClick={() => setShowTCPrintView(true)}>
            <Printer size={24} /> Print Transfer Certificate
          </button>
        </div>
      </motion.div>
    );
  }

  // --- MAIN VIEW: FILTERS & STUDENT GRID ---
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title"><FileText size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Examinations & Results</h1>
          <p className="page-subtitle">Select a class to view students, then generate their Report Cards or TCs.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '32px', display: 'flex', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Class</label>
          <select className="glass-input" value={classFilter} onChange={handleClassChange}>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c.id} value={c.className}>{c.className}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Section</label>
          <select className="glass-input" value={sectionFilter} onChange={e => setSectionFilter(e.target.value)} disabled={!classFilter}>
            <option value="">All Sections</option>
            {activeSections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
          </select>
        </div>
      </div>

      {!classFilter ? (
        <div className="glass-panel" style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileText size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <h3>No Class Selected</h3>
          <p>Please select a Class from the dropdown above to view students.</p>
        </div>
      ) : (
        <>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>
            Students in {classFilter} {sectionFilter} ({filteredStudents.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {filteredStudents.map(student => (
              <motion.div key={student.id} whileHover={{ y: -5 }} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '20px', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '40px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                  {student.firstName[0]}{student.lastName ? student.lastName[0] : ''}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.2rem' }}>{student.firstName} {student.lastName}</h4>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Roll No: {student.rollNumber || '-'} | Adm: {student.admissionNo || '-'}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '8px' }}>
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }} onClick={() => { setSelectedStudent(student); setView('report_config'); }}>
                    <Award size={18} /> Report Card
                  </button>
                  <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }} onClick={() => { setSelectedStudent(student); setView('tc_config'); }}>
                    <FileOutput size={18} /> Generate TC
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          {filteredStudents.length === 0 && (
            <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No students found in this class/section.
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default Examination;
`;

fs.writeFileSync('src/pages/Examination.tsx', code);
console.log('Examination.tsx rewritten to strict request specs');
