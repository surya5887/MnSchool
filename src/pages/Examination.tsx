import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ArrowLeft, Save, CheckCircle, Award, FileOutput, Printer, Edit3, ShieldAlert, User, ChevronRight } from 'lucide-react';
import { getStudents, type StudentData } from '../services/studentService';
import { getClasses, type ClassData } from '../services/classService';
import { saveExamMark, getAllExamMarksForTerm, type ExamMarkData } from '../services/examService';
import ReportCardPrintView from '../components/ReportCardPrintView';
import TransferCertificatePrintView from '../components/TransferCertificatePrintView';
import CharacterCertificatePrintView from '../components/CharacterCertificatePrintView';
import BirthCertificatePrintView from '../components/BirthCertificatePrintView';
import Loader from '../components/Loader';

const Examination: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'marks' | 'reports' | 'certificates'>('marks');

  // Main Page Filters
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  
  const [activeSections, setActiveSections] = useState<string[]>([]);
  const [activeSubjects, setActiveSubjects] = useState<string[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  
  // Navigation State
  const [view, setView] = useState<'main' | 'marks_config' | 'report_config' | 'bulk_report_config' | 'tc_config' | 'cc_config' | 'bc_config'>('main');
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

  // Common Config State
  const [examType, setExamType] = useState('Half Yearly Exam');
  const [maxMarks, setMaxMarks] = useState(100);
  const [marksMap, setMarksMap] = useState<Record<string, { theory: number; practical: number }>>({});
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showPrintView, setShowPrintView] = useState(false);
  const [printMarks, setPrintMarks] = useState<ExamMarkData[]>([]);

  const maxTheory = Math.round(maxMarks * 0.8);
  const maxPractical = Math.round(maxMarks * 0.2);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cls, stds] = await Promise.all([getClasses(), getStudents()]);
        setClasses(cls);
        setStudents(stds);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
    // student.classId actually stores the className string
    filtered = filtered.filter(s => s.classId === classFilter);
    if (sectionFilter) {
      filtered = filtered.filter(s => s.sectionId === sectionFilter);
    }
    setFilteredStudents(filtered);
  }, [classFilter, sectionFilter, students]);

  // Fetch marks when configuring marks or report card
  useEffect(() => {
    if ((view === 'marks_config' || view === 'report_config') && selectedStudent && examType) {
      const fetchMarks = async () => {
        const marksData = await getAllExamMarksForTerm(examType);
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

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setClassFilter(e.target.value);
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
    setIsSaving(true);
    try {
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
      setView('main');
    } catch (err) {
      console.error(err);
      alert('Failed to save marks');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintReportCard = async () => {
    const allMarks = await getAllExamMarksForTerm(examType);
    setPrintMarks(allMarks);
    setShowPrintView(true);
  };

  if (showPrintView && selectedStudent && view === 'report_config') {
    return (
      <ReportCardPrintView 
        students={students}
        marks={printMarks}
        term={examType}
        className={classFilter}
        section={sectionFilter}
        maxMarks={maxMarks}
        onClose={() => setShowPrintView(false)}
      />
    );
  }

  if (showPrintView && selectedStudent && view === 'tc_config') {
    return <TransferCertificatePrintView student={selectedStudent} className={classFilter} onClose={() => {setShowPrintView(false); setView('main');}} />;
  }

  if (showPrintView && selectedStudent && view === 'cc_config') {
    return <CharacterCertificatePrintView student={selectedStudent} className={classFilter} onClose={() => {setShowPrintView(false); setView('main');}} />;
  }

  if (showPrintView && selectedStudent && view === 'bc_config') {
    return <BirthCertificatePrintView student={selectedStudent} className={classFilter} onClose={() => {setShowPrintView(false); setView('main');}} />;
  }

  // --- SUB-VIEW: MARKS CONFIG ---
  if (view === 'marks_config' && selectedStudent) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button className="btn-secondary" style={{ padding: '8px 12px' }} onClick={() => setView('main')}>
            <ArrowLeft size={20} /> Back
          </button>
          <div>
            <h2 style={{ margin: 0 }}>Enter Marks: {selectedStudent.firstName} {selectedStudent.lastName}</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Class: {classFilter} {sectionFilter}</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Exam Term</label>
              <select className="glass-input" value={examType} onChange={e => setExamType(e.target.value)}>
                <option>Unit Test 1</option>
                <option>Half Yearly Exam</option>
                <option>Unit Test 2</option>
                <option>Annual Exam</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Total Max Marks per Subject</label>
              <input type="number" value={maxMarks} onChange={e => setMaxMarks(Number(e.target.value))} className="glass-input" />
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 24px 0' }}>Subject Marks (Theory: {maxTheory} / Practical: {maxPractical})</h3>
          
          {activeSubjects.length > 0 ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', marginBottom: '16px', color: 'var(--text-muted)', fontWeight: 600, padding: '0 16px' }}>
                <div>Subject</div>
                <div>Theory</div>
                <div>Practical</div>
                <div>Total & Grade</div>
              </div>
              
              {activeSubjects.map(subj => {
                const theory = marksMap[subj]?.theory || 0;
                const prac = marksMap[subj]?.practical || 0;
                const total = theory + prac;
                const grade = calculateGrade(total);
                
                return (
                  <div key={subj} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center', background: 'var(--bg-color)', padding: '12px 16px', borderRadius: '12px', marginBottom: '12px' }}>
                    <div style={{ fontWeight: 600 }}>{subj}</div>
                    <div>
                      <input type="number" max={maxTheory} min="0" value={theory.toString()} onChange={e => handleMarkChange(subj, 'theory', e.target.value)} className="glass-input" style={{ width: '100px', padding: '8px' }}/>
                    </div>
                    <div>
                      <input type="number" max={maxPractical} min="0" value={prac.toString()} onChange={e => handleMarkChange(subj, 'practical', e.target.value)} className="glass-input" style={{ width: '100px', padding: '8px' }}/>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{total}</span>
                      <span className={`badge ${(total/maxMarks*100) >= 33 ? 'success' : 'danger'}`}>{grade}</span>
                    </div>
                  </div>
                );
              })}
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button className="btn-primary" style={{ padding: '12px 24px' }} onClick={handleSaveStudentMarks} disabled={isSaving}>
                  {isSaving ? 'Saving...' : <><Save size={18} style={{ marginRight: '8px' }} /> Save Marks</>}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
              No subjects assigned to this class. Add subjects in Classes & Sections.
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  
  // --- SUB-VIEW: BULK REPORT CONFIG ---
  if (view === 'bulk_report_config') {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button className="btn-secondary" style={{ padding: '8px 12px' }} onClick={() => setView('main')}>
            <ArrowLeft size={20} /> Back
          </button>
          <div>
            <h2 style={{ margin: 0 }}>Generate Bulk Report Cards</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Class: {classFilter} {sectionFilter} ({filteredStudents.length} students)</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
            <div style={{ flex: 1, minWidth: '200px', maxWidth: '300px', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Exam Term</label>
              <select className="glass-input" value={examType} onChange={e => setExamType(e.target.value)}>
                <option>Unit Test 1</option>
                <option>Half Yearly Exam</option>
                <option>Unit Test 2</option>
                <option>Annual Exam</option>
              </select>
            </div>
          </div>
          <button className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.2rem' }} onClick={async () => {
            const allMarks = await getAllExamMarksForTerm(examType);
            setPrintMarks(allMarks);
            setShowPrintView(true);
          }}>
            <Printer size={24} /> Preview All Report Cards
          </button>
        </div>
      </motion.div>
    );
  }

  if (showPrintView && view === 'bulk_report_config') {
    return (
      <ReportCardPrintView 
        students={filteredStudents}
        marks={printMarks}
        term={examType}
        className={classFilter}
        section={sectionFilter}
        maxMarks={maxMarks}
        onClose={() => setShowPrintView(false)}
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
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
            <div style={{ flex: 1, minWidth: '200px', maxWidth: '300px', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Exam Term</label>
              <select className="glass-input" value={examType} onChange={e => setExamType(e.target.value)}>
                <option>Unit Test 1</option>
                <option>Half Yearly Exam</option>
                <option>Unit Test 2</option>
                <option>Annual Exam</option>
              </select>
            </div>
          </div>
          <button className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.2rem' }} onClick={handlePrintReportCard}>
            <Printer size={24} /> Preview Report Card
          </button>
        </div>
      </motion.div>
    );
  }

  // --- SUB-VIEW: TC/CC/BC CONFIG ---
  if ((view === 'tc_config' || view === 'cc_config' || view === 'bc_config') && selectedStudent) {
    const certType = view === 'tc_config' ? 'Transfer Certificate' : view === 'cc_config' ? 'Character Certificate' : 'Date of Birth Certificate';
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button className="btn-secondary" style={{ padding: '8px 12px' }} onClick={() => setView('main')}>
            <ArrowLeft size={20} /> Back
          </button>
          <div>
            <h2 style={{ margin: 0 }}>Generate {certType}: {selectedStudent.firstName} {selectedStudent.lastName}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
            Click below to generate and print the {certType} for {selectedStudent.firstName}.
          </p>
          <button className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.2rem' }} onClick={() => setShowPrintView(true)}>
            <Printer size={24} /> Preview {certType}
          </button>
        </div>
      </motion.div>
    );
  }

  // --- MAIN VIEW: FILTERS & STUDENT GRID ---
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title"><FileText size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Examinations & Results</h1>
          <p className="page-subtitle">Manage marks, generate report cards, and issue certificates.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
        <button className={activeTab === 'marks' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('marks')}>
          <Edit3 size={18} /> Marks Entry
        </button>
        <button className={activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('reports')}>
          <Award size={18} /> Report Cards
        </button>
        <button className={activeTab === 'certificates' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('certificates')}>
          <ShieldAlert size={18} /> Certificates
        </button>
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
          {activeTab === 'reports' && filteredStudents.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <button className="btn-primary" style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #10b981, #059669)' }} onClick={async () => {
                // Fetch marks for the whole class
                const allMarks = await getAllExamMarksForTerm(examType);
                setPrintMarks(allMarks);
                // Set the first student as selected just to satisfy the view condition if needed, or better, we can modify the condition
                // Actually let's just create a new state variable or bypass selectedStudent for bulk print
                setView('bulk_report_config');
              }}>
                <Award size={20} style={{ marginRight: '8px' }} /> Generate Report Cards for All Students
              </button>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            <AnimatePresence>
              {loading ? (
                <Loader message="Loading students..." />
              ) : filteredStudents.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  No students found in this class/section.
                </div>
              ) : (
                filteredStudents.map(student => (
                  <motion.div key={student.id} whileHover={{ y: -5 }} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '20px', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '35px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                      {student.firstName[0]}{student.lastName ? student.lastName[0] : ''}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1.2rem' }}>{student.firstName} {student.lastName}</h4>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Roll No: {student.rollNumber || '-'}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '8px' }}>
                      {activeTab === 'marks' && (
                        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }} onClick={() => { setSelectedStudent(student); setView('marks_config'); }}>
                          <Edit3 size={18} /> Enter Marks
                        </button>
                      )}
                      
                      {activeTab === 'reports' && (
                        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', background: 'linear-gradient(135deg, #10b981, #059669)' }} onClick={() => { setSelectedStudent(student); setView('report_config'); }}>
                          <Award size={18} /> Report Card
                        </button>
                      )}

                      {activeTab === 'certificates' && (
                        <>
                          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '0.9rem' }} onClick={() => { setSelectedStudent(student); setView('tc_config'); }}>
                            <FileOutput size={16} /> Generate TC
                          </button>
                          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '0.9rem' }} onClick={() => { setSelectedStudent(student); setView('cc_config'); }}>
                            <User size={16} /> Generate CC
                          </button>
                          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '0.9rem' }} onClick={() => { setSelectedStudent(student); setView('bc_config'); }}>
                            <FileText size={16} /> Generate BC
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} style={{ position: 'fixed', bottom: '40px', right: '40px', background: 'var(--success)', color: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, zIndex: 1000 }}>
            <CheckCircle size={24} /> Marks Saved Successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Examination;
