import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ArrowLeft, Save, CheckCircle, Award, FileOutput, Printer, Edit3, ShieldAlert, User, ChevronRight, Calendar, FileSignature, Plus, Trash2, Bold, Italic, Underline } from 'lucide-react';
import { getStudents, type StudentData } from '../services/studentService';
import { getClasses, type ClassData } from '../services/classService';
import { saveExamMark, getAllExamMarksForTerm, type ExamMarkData, saveExamSchedule, getExamSchedulesByClass, saveQuestionPaper, getQuestionPapersByClass, type ExamScheduleData, type QuestionPaperData } from '../services/examService';
import ReportCardPrintView from '../components/ReportCardPrintView';
import TransferCertificatePrintView from '../components/TransferCertificatePrintView';
import CharacterCertificatePrintView from '../components/CharacterCertificatePrintView';
import BirthCertificatePrintView from '../components/BirthCertificatePrintView';
import DateSheetPrintView from '../components/DateSheetPrintView';
import QuestionPaperPrintView from '../components/QuestionPaperPrintView';
import Loader from '../components/Loader';
import RichTextEditor from '../components/RichTextEditor';

const Examination: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'marks' | 'reports' | 'certificates' | 'schedules' | 'papers'>('marks');

  // Main Page Filters
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  
  const [activeSections, setActiveSections] = useState<string[]>([]);
  const [activeSubjects, setActiveSubjects] = useState<string[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  
  // Navigation State
  const [view, setView] = useState<'main' | 'marks_config' | 'report_config' | 'bulk_report_config' | 'tc_config' | 'cc_config' | 'bc_config' | 'schedule_config' | 'paper_config'>('main');
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

  // Common Config State
  const [examType, setExamType] = useState('Half Yearly Exam');
  const [maxMarks, setMaxMarks] = useState(100);
  const [marksMap, setMarksMap] = useState<Record<string, { theory: number; practical: number }>>({});
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showPrintView, setShowPrintView] = useState(false);
  const [printMarks, setPrintMarks] = useState<ExamMarkData[]>([]);

  // Advanced States
  const [scheduleData, setScheduleData] = useState<ExamScheduleData | null>(null);
  const [paperData, setPaperData] = useState<QuestionPaperData | null>(null);

  
  
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
      setFilteredStudents([]); 
      return;
    }
    let filtered = students.filter(s => s.classId === classFilter);
    if (sectionFilter) {
      filtered = filtered.filter(s => s.sectionId === sectionFilter);
    }
    setFilteredStudents(filtered);
  }, [classFilter, sectionFilter, students]);

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

  // --- PRINT VIEWS ---
  if (showPrintView) {
    if (view === 'report_config' && selectedStudent) {
      return <ReportCardPrintView students={students} marks={printMarks} term={examType} className={classFilter} section={sectionFilter} maxMarks={maxMarks} onClose={() => setShowPrintView(false)} />;
    }
    if (view === 'bulk_report_config') {
      return <ReportCardPrintView students={filteredStudents} marks={printMarks} term={examType} className={classFilter} section={sectionFilter} maxMarks={maxMarks} onClose={() => setShowPrintView(false)} />;
    }
    if (view === 'tc_config' && selectedStudent) return <TransferCertificatePrintView student={selectedStudent} className={classFilter} onClose={() => {setShowPrintView(false); setView('main');}} />;
    if (view === 'cc_config' && selectedStudent) return <CharacterCertificatePrintView student={selectedStudent} className={classFilter} onClose={() => {setShowPrintView(false); setView('main');}} />;
    if (view === 'bc_config' && selectedStudent) return <BirthCertificatePrintView student={selectedStudent} className={classFilter} onClose={() => {setShowPrintView(false); setView('main');}} />;
    if (view === 'schedule_config' && scheduleData) return <DateSheetPrintView scheduleData={scheduleData} onClose={() => setShowPrintView(false)} />;
    if (view === 'paper_config' && paperData) return <QuestionPaperPrintView paperData={paperData} onClose={() => setShowPrintView(false)} />;
  }

  // --- SUB-VIEWS ---
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
                    <div><input type="number" max={maxTheory} min="0" value={theory.toString()} onChange={e => handleMarkChange(subj, 'theory', e.target.value)} className="glass-input" style={{ width: '100px', padding: '8px' }}/></div>
                    <div><input type="number" max={maxPractical} min="0" value={prac.toString()} onChange={e => handleMarkChange(subj, 'practical', e.target.value)} className="glass-input" style={{ width: '100px', padding: '8px' }}/></div>
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
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No subjects assigned to this class. Add subjects in Classes & Sections.</div>
          )}
        </div>
      </motion.div>
    );
  }

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
          <button className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.2rem' }} onClick={handlePrintReportCard}>
            <Printer size={24} /> Preview All Report Cards
          </button>
        </div>
      </motion.div>
    );
  }

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

  if ((view === 'tc_config' || view === 'cc_config' || view === 'bc_config') && selectedStudent) {
    const certType = view === 'tc_config' ? 'Transfer Certificate' : view === 'cc_config' ? 'Character Certificate' : 'Date of Birth Certificate';
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button className="btn-secondary" style={{ padding: '8px 12px' }} onClick={() => setView('main')}><ArrowLeft size={20} /> Back</button>
          <div><h2 style={{ margin: 0 }}>Generate {certType}: {selectedStudent.firstName} {selectedStudent.lastName}</h2></div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <button className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.2rem' }} onClick={() => setShowPrintView(true)}>
            <Printer size={24} /> Preview {certType}
          </button>
        </div>
      </motion.div>
    );
  }

  // --- SCHEDULE CONFIG VIEW ---
  if (view === 'schedule_config') {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button className="btn-secondary" style={{ padding: '8px 12px' }} onClick={() => setView('main')}><ArrowLeft size={20} /> Back</button>
          <div><h2 style={{ margin: 0 }}>Create Exam Schedule</h2><p style={{ margin: 0, color: 'var(--text-muted)' }}>Class: {classFilter}</p></div>
        </div>
        
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Exam Term</label>
              <select className="glass-input" value={scheduleData?.examTerm || examType} onChange={e => setScheduleData(prev => prev ? {...prev, examTerm: e.target.value} : null)}>
                <option>Unit Test 1</option>
                <option>Half Yearly Exam</option>
                <option>Unit Test 2</option>
                <option>Annual Exam</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Date Sheet</h3>
              <button className="btn-secondary" onClick={() => {
                if(scheduleData) setScheduleData({...scheduleData, schedule: [...scheduleData.schedule, {subject: '', date: '', startTime: '09:00 AM', endTime: '12:00 PM'}]});
              }}><Plus size={18} /> Add Subject</button>
            </div>

            {scheduleData?.schedule.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px', background: 'var(--bg-color)', padding: '12px', borderRadius: '12px' }}>
                <input type="date" value={item.date} onChange={e => {
                  const newSched = [...scheduleData.schedule];
                  newSched[idx].date = e.target.value;
                  setScheduleData({...scheduleData, schedule: newSched});
                }} className="glass-input" style={{ flex: 1 }} />
                
                <select value={item.subject} onChange={e => {
                  const newSched = [...scheduleData.schedule];
                  newSched[idx].subject = e.target.value;
                  setScheduleData({...scheduleData, schedule: newSched});
                }} className="glass-input" style={{ flex: 1 }}>
                  <option value="">Select Subject</option>
                  {activeSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <input type="text" placeholder="Start Time" value={item.startTime} onChange={e => {
                  const newSched = [...scheduleData.schedule];
                  newSched[idx].startTime = e.target.value;
                  setScheduleData({...scheduleData, schedule: newSched});
                }} className="glass-input" style={{ width: '120px' }} />
                
                <input type="text" placeholder="End Time" value={item.endTime} onChange={e => {
                  const newSched = [...scheduleData.schedule];
                  newSched[idx].endTime = e.target.value;
                  setScheduleData({...scheduleData, schedule: newSched});
                }} className="glass-input" style={{ width: '120px' }} />

                <button className="btn-secondary" style={{ padding: '8px', color: 'var(--danger)' }} onClick={() => {
                  const newSched = [...scheduleData.schedule];
                  newSched.splice(idx, 1);
                  setScheduleData({...scheduleData, schedule: newSched});
                }}><Trash2 size={18} /></button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
             <button className="btn-primary" onClick={async () => {
               if(scheduleData) {
                 setIsSaving(true);
                 await saveExamSchedule(scheduleData);
                 setIsSaving(false);
                 setSaved(true);
                 setTimeout(() => setSaved(false), 3000);
               }
             }} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Schedule'}</button>
             <button className="btn-secondary" onClick={() => setShowPrintView(true)}><Printer size={18} style={{ marginRight: '8px' }} /> Preview Date Sheet</button>
          </div>
        </div>
      </motion.div>
    );
  }

  // --- PAPER CONFIG VIEW ---
  if (view === 'paper_config') {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button className="btn-secondary" style={{ padding: '8px 12px' }} onClick={() => setView('main')}><ArrowLeft size={20} /> Back</button>
          <div><h2 style={{ margin: 0 }}>Question Paper Generator</h2><p style={{ margin: 0, color: 'var(--text-muted)' }}>Class: {classFilter} {sectionFilter}</p></div>
        </div>
        
        <div className="glass-panel" style={{ padding: '24px' }}>
          {/* Header Info */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Exam Term</label>
              <select className="glass-input" value={paperData?.examTerm || examType} onChange={e => setPaperData(prev => prev ? {...prev, examTerm: e.target.value} : null)}>
                <option>Unit Test 1</option><option>Half Yearly Exam</option><option>Unit Test 2</option><option>Annual Exam</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Subject</label>
              <select className="glass-input" value={paperData?.subject || ''} onChange={e => setPaperData(prev => prev ? {...prev, subject: e.target.value} : null)}>
                <option value="">Select Subject</option>
                {activeSubjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ width: '150px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Time Allowed</label>
              <input type="text" className="glass-input" value={paperData?.timeAllowed || '3 Hours'} onChange={e => setPaperData(prev => prev ? {...prev, timeAllowed: e.target.value} : null)} />
            </div>
            <div style={{ width: '120px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Max Marks</label>
              <input type="number" className="glass-input" value={paperData?.maxMarks || 100} onChange={e => setPaperData(prev => prev ? {...prev, maxMarks: Number(e.target.value)} : null)} />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 'bold' }}>General Instructions (One per line)</label>
            <textarea className="glass-input" rows={3} style={{ width: '100%', resize: 'vertical' }} value={paperData?.generalInstructions.join('\n') || ''} onChange={e => setPaperData(prev => prev ? {...prev, generalInstructions: e.target.value.split('\n')} : null)} placeholder="E.g. All questions are compulsory."></textarea>
          </div>

          {/* Sections Builder */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Questions</h3>
              <button className="btn-secondary" onClick={() => {
                if(paperData) setPaperData({...paperData, sections: [...paperData.sections, { sectionTitle: 'New Section', questions: [{ text: '', marks: 1 }] }]});
              }}><Plus size={18} /> Add Section</button>
            </div>

            {paperData?.sections.map((section, sIdx) => (
              <div key={sIdx} style={{ background: 'var(--bg-color)', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <input type="text" className="glass-input" style={{ flex: 1, fontWeight: 'bold' }} value={section.sectionTitle} onChange={e => {
                    const newSecs = [...paperData.sections];
                    newSecs[sIdx].sectionTitle = e.target.value;
                    setPaperData({...paperData, sections: newSecs});
                  }} placeholder="Section Title (e.g. SECTION A: OBJECTIVE)" />
                  <button className="btn-secondary" style={{ color: 'var(--danger)' }} onClick={() => {
                    const newSecs = [...paperData.sections];
                    newSecs.splice(sIdx, 1);
                    setPaperData({...paperData, sections: newSecs});
                  }}><Trash2 size={18} /></button>
                </div>

                {section.questions.map((q, qIdx) => (
                  <div key={qIdx} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', paddingLeft: '24px', borderLeft: '3px solid var(--primary-color)', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{ paddingTop: '8px', fontWeight: 'bold' }}>{q.type === 'instruction' ? 'Info:' : `Q${qIdx+1}.`}</span>
                      
                      <RichTextEditor 
                        value={q.text} 
                        onChange={val => {
                          const newSecs = [...paperData.sections];
                          newSecs[sIdx].questions[qIdx].text = val;
                          setPaperData({...paperData, sections: newSecs});
                        }}
                        placeholder={q.type === 'instruction' ? "Type instruction here (e.g. Attempt any 5 questions)" : "Type question here..."}
                      />

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <select className="glass-input" value={q.type || 'subjective'} onChange={e => {
                          const newSecs = [...paperData.sections];
                          newSecs[sIdx].questions[qIdx].type = e.target.value as any;
                          if (e.target.value === 'objective' && !newSecs[sIdx].questions[qIdx].options) {
                            newSecs[sIdx].questions[qIdx].options = ['', '', '', ''];
                          }
                          setPaperData({...paperData, sections: newSecs});
                        }}>
                          <option value="subjective">Subjective</option>
                          <option value="objective">Objective (MCQ)</option>
                          <option value="instruction">Instruction Text</option>
                        </select>
                        
                        {q.type !== 'instruction' && (
                          <>
                            <input type="number" className="glass-input" style={{ width: '70px' }} value={q.marks} onChange={e => {
                              const newSecs = [...paperData.sections];
                              newSecs[sIdx].questions[qIdx].marks = Number(e.target.value);
                              setPaperData({...paperData, sections: newSecs});
                            }} />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>marks</span>
                          </>
                        )}
                        <button className="btn-secondary" style={{ padding: '6px', color: 'var(--danger)' }} onClick={() => {
                          const newSecs = [...paperData.sections];
                          newSecs[sIdx].questions.splice(qIdx, 1);
                          setPaperData({...paperData, sections: newSecs});
                        }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                    {q.type === 'objective' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingLeft: '32px' }}>
                        {['A', 'B', 'C', 'D'].map((optLabel, optIdx) => (
                          <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 'bold' }}>{optLabel}.</span>
                            <input type="text" className="glass-input" style={{ flex: 1, padding: '6px 12px' }} value={q.options?.[optIdx] || ''} onChange={e => {
                              const newSecs = [...paperData.sections];
                              const opts = newSecs[sIdx].questions[qIdx].options || ['', '', '', ''];
                              opts[optIdx] = e.target.value;
                              newSecs[sIdx].questions[qIdx].options = opts;
                              setPaperData({...paperData, sections: newSecs});
                            }} placeholder={`Option ${optLabel}`} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                <button className="btn-secondary" style={{ marginTop: '8px', marginLeft: '24px', fontSize: '0.9rem', padding: '6px 12px' }} onClick={() => {
                  const newSecs = [...paperData.sections];
                  newSecs[sIdx].questions.push({ text: '', marks: 1 });
                  setPaperData({...paperData, sections: newSecs});
                }}><Plus size={16} /> Add Question</button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '32px' }}>
             <button className="btn-primary" onClick={async () => {
               if(paperData) {
                 setIsSaving(true);
                 await saveQuestionPaper(paperData);
                 setIsSaving(false);
                 setSaved(true);
                 setTimeout(() => setSaved(false), 3000);
               }
             }} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save to Server'}</button>
             <button className="btn-secondary" onClick={() => setShowPrintView(true)}><Printer size={18} style={{ marginRight: '8px' }} /> Preview & Print Paper</button>
          </div>
        </div>
      </motion.div>
    );
  }

  // --- MAIN VIEW: TABS & GRID ---
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title"><FileText size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Examinations & Results</h1>
          <p className="page-subtitle">Manage marks, schedules, papers, and certificates.</p>
        </div>
      </div>

      <div className="hide-scrollbar" style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', overflowX: 'auto' }}>
        <button className={activeTab === 'marks' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('marks')}><Edit3 size={18} style={{whiteSpace:'nowrap'}}/> Marks Entry</button>
        <button className={activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('reports')}><Award size={18} style={{whiteSpace:'nowrap'}}/> Report Cards</button>
        <button className={activeTab === 'schedules' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('schedules')}><Calendar size={18} style={{whiteSpace:'nowrap'}}/> Schedules</button>
        <button className={activeTab === 'papers' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('papers')}><FileSignature size={18} style={{whiteSpace:'nowrap'}}/> Paper Builder</button>
        <button className={activeTab === 'certificates' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('certificates')}><ShieldAlert size={18} style={{whiteSpace:'nowrap'}}/> Certificates</button>
      </div>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '32px', display: 'flex', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Class</label>
          <select className="glass-input" value={classFilter} onChange={handleClassChange}>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c.id} value={c.className}>{c.className}</option>)}
          </select>
        </div>
        {true && (
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Section</label>
            <select className="glass-input" value={sectionFilter} onChange={e => setSectionFilter(e.target.value)} disabled={!classFilter}>
              <option value="">All Sections</option>
              {activeSections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
            </select>
          </div>
        )}
      </div>

      {!classFilter ? (
        <div className="glass-panel" style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileText size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <h3>No Class Selected</h3>
          <p>Please select a Class from the dropdown above to continue.</p>
        </div>
      ) : (
        <>
          {/* Schedules Tab */}
          {activeTab === 'schedules' && (
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
              <Calendar size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <h3>Manage Exam Schedules for {classFilter}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Create and print date sheets for upcoming examinations.</p>
              <button className="btn-primary" onClick={async () => {
                const existing = await getExamSchedulesByClass(classFilter);
                // If there's an existing schedule for the current term, load it, otherwise create empty
                const termSched = existing.find(s => s.examTerm === examType);
                if(termSched) {
                  setScheduleData(termSched);
                } else {
                  setScheduleData({ classId: classFilter, examTerm: examType, schedule: activeSubjects.map(s => ({ subject: s, date: '', startTime: '09:00 AM', endTime: '12:00 PM' })) });
                }
                setView('schedule_config');
              }}>
                <Calendar size={20} style={{ marginRight: '8px' }} /> Configure Date Sheet
              </button>
            </div>
          )}

          {/* Papers Tab */}
          {activeTab === 'papers' && (
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
              <FileSignature size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <h3>Question Paper Builder for {classFilter}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Design premium CBSE-style question papers dynamically.</p>
              <button className="btn-primary" onClick={async () => {
                const existing = await getQuestionPapersByClass(classFilter);
                const sectionPapers = existing.filter(p => (p.sectionId || '') === sectionFilter);
                if(sectionPapers.length > 0) {
                   setPaperData(sectionPapers[0]); // Load first one for now, ideally user selects from a list
                } else {
                   setPaperData({ classId: classFilter, sectionId: sectionFilter, subject: activeSubjects[0] || 'English', examTerm: examType, timeAllowed: '3 Hours', maxMarks: 100, generalInstructions: ['All questions are compulsory.', 'Read the questions carefully before answering.'], sections: [{ sectionTitle: 'SECTION A', questions: [{ text: 'Sample Question', marks: 5 }] }], createdAt: new Date().toISOString() });
                }
                setView('paper_config');
              }}>
                <FileSignature size={20} style={{ marginRight: '8px' }} /> Open Paper Builder
              </button>
            </div>
          )}

          {/* Marks, Reports, Certificates use Grid */}
          {(activeTab === 'marks' || activeTab === 'reports' || activeTab === 'certificates') && (
            <>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>
                Students in {classFilter} {sectionFilter} ({filteredStudents.length})
              </h3>
              {activeTab === 'reports' && filteredStudents.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <button className="btn-primary" style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #10b981, #059669)' }} onClick={async () => {
                    const allMarks = await getAllExamMarksForTerm(examType);
                    setPrintMarks(allMarks);
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
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No students found in this class/section.</div>
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
                          {activeTab === 'marks' && <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }} onClick={() => { setSelectedStudent(student); setView('marks_config'); }}><Edit3 size={18} /> Enter Marks</button>}
                          {activeTab === 'reports' && <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', background: 'linear-gradient(135deg, #10b981, #059669)' }} onClick={() => { setSelectedStudent(student); setView('report_config'); }}><Award size={18} /> Report Card</button>}
                          {activeTab === 'certificates' && (
                            <>
                              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '0.9rem' }} onClick={() => { setSelectedStudent(student); setView('tc_config'); }}><FileOutput size={16} /> Generate TC</button>
                              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '0.9rem' }} onClick={() => { setSelectedStudent(student); setView('cc_config'); }}><User size={16} /> Generate CC</button>
                              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '0.9rem' }} onClick={() => { setSelectedStudent(student); setView('bc_config'); }}><FileText size={16} /> Generate BC</button>
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
        </>
      )}

      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} style={{ position: 'fixed', bottom: '40px', right: '40px', background: 'var(--success)', color: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, zIndex: 1000 }}>
            <CheckCircle size={24} /> Data Saved Successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Examination;
