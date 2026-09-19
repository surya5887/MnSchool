import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ArrowLeft, Save, CheckCircle, Award, FileOutput, Printer, Edit3, ShieldAlert, User, ChevronRight, Calendar, FileSignature, Plus, Trash2, Bold, Italic, Underline, Search, Image as ImageIcon, Square, Lightbulb, Settings, AlignLeft, AlignCenter, AlignRight, Circle, Triangle, Hexagon, Octagon, Star, Diamond, Minus, RotateCw, FlipHorizontal, FlipVertical, Shapes } from 'lucide-react';
import { getStudents, type StudentData } from '../services/studentService';
import { getClasses, type ClassData } from '../services/classService';
import { saveExamMark, getAllExamMarksForTerm, type ExamMarkData, saveExamSchedule, getExamSchedulesByClass, saveQuestionPaper, getQuestionPapersByClass, type ExamScheduleData, type QuestionPaperData } from '../services/examService';
import ReportCardPrintView from '../components/ReportCardPrintView';
import DocumentBuilder from '../components/DocumentBuilder';
import TransferCertificatePrintView from '../components/TransferCertificatePrintView';
import CharacterCertificatePrintView from '../components/CharacterCertificatePrintView';
import BirthCertificatePrintView from '../components/BirthCertificatePrintView';
import DateSheetPrintView from '../components/DateSheetPrintView';
import MasterScheduleConfig from '../components/MasterScheduleConfig';
import QuestionPaperPrintView from '../components/QuestionPaperPrintView';
import Loader from '../components/Loader';
import RichTextEditor from '../components/RichTextEditor';
import BlockCanvas from '../components/BlockCanvas/BlockCanvas';
import KidsBlockCanvas from '../components/BlockCanvas/KidsBlockCanvas';

const renderShape = (shape: any) => {
  let Icon = Circle;
  switch (shape.type) {
    case 'circle': Icon = Circle; break;
    case 'square': Icon = Square; break;
    case 'triangle': Icon = Triangle; break;
    case 'hexagon': Icon = Hexagon; break;
    case 'octagon': Icon = Octagon; break;
    case 'star': Icon = Star; break;
    case 'diamond': Icon = Diamond; break;
    case 'line': Icon = Minus; break;
    default: Icon = Circle; break;
  }
  
  return (
    <Icon 
      style={{ 
        width: '100%', 
        height: '100%', 
        color: shape.color, 
        fill: shape.type !== 'line' ? shape.color : 'none', 
        transform: `rotate(${shape.rotation}deg) scaleX(${shape.flipX ? -1 : 1}) scaleY(${shape.flipY ? -1 : 1})`,
        display: 'block'
      }} 
      strokeWidth={1}
    />
  );
};

const Examination: React.FC = () => {
  const authUser = JSON.parse(sessionStorage.getItem('authUser') || localStorage.getItem('authUser') || '{}');
  const role = authUser.role || '';
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'reports' | 'certificates' | 'schedules' | 'papers' | 'doc_builder'>('reports');

  // Main Page Filters
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  
  const [activeSections, setActiveSections] = useState<string[]>([]);
  const [activeSubjects, setActiveSubjects] = useState<string[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  
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
  const [scheduleMode, setScheduleMode] = useState<'class_wise' | 'combined'>('class_wise');
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

  // Deduplicate classes for the dropdown
  const uniqueClasses = useMemo(() => {
    const unique = new Map<string, ClassData>();
    classes.forEach(c => {
      if (!unique.has(c.className)) unique.set(c.className, c);
    });
    return Array.from(unique.values());
  }, [classes]);

  useEffect(() => {
    if (classFilter) {
      const matchingClasses = classes.filter(c => c.className === classFilter);
      if (matchingClasses.length > 0) {
        const allSections = new Set<string>();
        const allSubjects = new Set<string>();
        matchingClasses.forEach(cls => {
          const secs = Array.isArray(cls.sections) ? cls.sections : (typeof cls.sections === 'string' ? [cls.sections] : []);
          const subs = Array.isArray(cls.subjects) ? cls.subjects : (typeof cls.subjects === 'string' ? [cls.subjects] : []);
          secs.forEach(s => allSections.add(s));
          subs.forEach(s => allSubjects.add(s));
        });
        setActiveSections(Array.from(allSections));
        setActiveSubjects(Array.from(allSubjects));
      }
    } else {
      setActiveSections([]);
      setActiveSubjects([]);
    }
    setSectionFilter('');
  }, [classFilter, classes]);

  useEffect(() => {
    if (!classFilter && !studentSearch.trim()) {
      setFilteredStudents([]); 
      return;
    }
    let filtered = students;
    if (classFilter) {
      filtered = filtered.filter(s => (() => { const matchingIds = classes.filter(c => c.className === classFilter).map(c => c.id); return matchingIds.includes(s.classId) || (s.classId && s.classId.trim().toLowerCase() === classFilter.trim().toLowerCase()); })());
    }
    if (sectionFilter) {
      filtered = filtered.filter(s => s.sectionId === sectionFilter);
    }
    if (studentSearch.trim()) {
      const searchLower = studentSearch.toLowerCase();
      filtered = filtered.filter(s => 
        (s.firstName?.toLowerCase().includes(searchLower)) || 
        (s.lastName?.toLowerCase().includes(searchLower)) || 
        (s.admissionNo?.toLowerCase().includes(searchLower)) ||
        (String(s.rollNumber || '').toLowerCase().includes(searchLower))
      );
    }
    setFilteredStudents(filtered);
  }, [classFilter, sectionFilter, studentSearch, students]);

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
    }, [view, selectedStudent, examType, showPrintView]);

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
      return <ReportCardPrintView students={[selectedStudent]} classes={classes} className={classFilter} maxMarks={maxMarks} onClose={() => setShowPrintView(false)} />;
    }
    if (view === 'bulk_report_config') {
      return <ReportCardPrintView students={filteredStudents} classes={classes} className={classFilter} maxMarks={maxMarks} onClose={() => setShowPrintView(false)} />;
    }
    if (view === 'tc_config' && selectedStudent) return <TransferCertificatePrintView student={selectedStudent} className={classFilter} onClose={() => {setShowPrintView(false); setView('main');}} />;
    if (view === 'cc_config' && selectedStudent) return <CharacterCertificatePrintView student={selectedStudent} className={classFilter} onClose={() => {setShowPrintView(false); setView('main');}} />;
    if (view === 'bc_config' && selectedStudent) return <BirthCertificatePrintView student={selectedStudent} className={classFilter} onClose={() => {setShowPrintView(false); setView('main');}} />;
    if ((view === 'schedule_config' || view === 'master_schedule_config') && scheduleData) return <DateSheetPrintView scheduleData={scheduleData} onClose={() => setShowPrintView(false)} />;
    if (view === 'paper_config' && paperData) return <QuestionPaperPrintView paperData={paperData} onClose={() => setShowPrintView(false)} />;
  }

  // --- SUB-VIEWS ---
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
          {role !== 'Teacher' && (
            <button className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.2rem' }} onClick={handlePrintReportCard}>
              <Printer size={24} /> Preview All Report Cards
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  if (view === 'report_config' && selectedStudent) {
    const displaySubjects = activeSubjects.length > 0 ? activeSubjects : ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer'];
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button className="btn-secondary" style={{ padding: '8px 12px' }} onClick={() => setView('main')}>
            <ArrowLeft size={20} /> Back
          </button>
          <div>
            <h2 style={{ margin: 0 }}>Generate Report Card: {selectedStudent.firstName} {selectedStudent.lastName}</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Class: {classFilter} {sectionFilter}</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '200px', maxWidth: '300px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Select Term for Marks Entry</label>
              <select className="glass-input" value={examType} onChange={e => setExamType(e.target.value)}>
                <option value="Half Yearly Exam">Half Yearly Exam</option>
                <option value="Annual Exam">Annual Exam</option>
              </select>
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
              {role !== 'Teacher' && (
                <button className="btn-primary" style={{ padding: '12px 32px', fontSize: '1.1rem' }} onClick={handlePrintReportCard}>
                  <Printer size={20} style={{ marginRight: '8px' }} /> Preview Full Report Card
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 24px 0' }}>Enter Marks for {examType}</h3>
          
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', marginBottom: '16px', color: 'var(--text-muted)', fontWeight: 600, padding: '0 16px' }}>
              <div>Subject</div>
              <div>Periodic Test (Max 20)</div>
              <div>Term Marks (Max 80)</div>
              <div>Total & Grade</div>
            </div>
            {displaySubjects.map(subj => {
              const theory = marksMap[subj]?.theory || 0;
              const prac = marksMap[subj]?.practical || 0;
              const total = theory + prac;
              const grade = calculateGrade(total);
              return (
                <div key={subj} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center', background: 'var(--bg-color)', padding: '12px 16px', borderRadius: '12px', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 600 }}>{subj}</div>
                  <div><input type="number" max={20} min="0" value={prac.toString()} onChange={e => handleMarkChange(subj, 'practical', e.target.value)} className="glass-input marks-input" /></div>
                  <div><input type="number" max={80} min="0" value={theory.toString()} onChange={e => handleMarkChange(subj, 'theory', e.target.value)} className="glass-input marks-input" /></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{total}</span>
                    <span className={`badge ${(total/100*100) >= 33 ? 'success' : 'danger'}`}>{grade}</span>
                  </div>
                </div>
              );
            })}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn-primary" style={{ padding: '12px 24px', background: '#10b981' }} onClick={handleSaveStudentMarks} disabled={isSaving}>
                {isSaving ? 'Saving...' : <><Save size={18} style={{ marginRight: '8px' }} /> Save {examType} Marks</>}
              </button>
            </div>
          </div>
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
            <div style={{ flex: "1 1 120px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "var(--text-muted)" }}>Exam Term</label>
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
                }} className="glass-input schedule-input" />
                
                <select value={item.subject} onChange={e => {
                  const newSched = [...scheduleData.schedule];
                  newSched[idx].subject = e.target.value;
                  setScheduleData({...scheduleData, schedule: newSched});
                }} className="glass-input schedule-input">
                  <option value="">Select Subject</option>
                  {activeSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <input type="text" placeholder="Start Time" value={item.startTime} onChange={e => {
                  const newSched = [...scheduleData.schedule];
                  newSched[idx].startTime = e.target.value;
                  setScheduleData({...scheduleData, schedule: newSched});
                }} className="glass-input schedule-input" />
                
                <input type="text" placeholder="End Time" value={item.endTime} onChange={e => {
                  const newSched = [...scheduleData.schedule];
                  newSched[idx].endTime = e.target.value;
                  setScheduleData({...scheduleData, schedule: newSched});
                }} className="glass-input schedule-input" />

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
  if (view === 'master_schedule_config') {
    return <MasterScheduleConfig 
      examTerm={examType} 
      allClasses={classes} 
      onBack={() => setView('main')} 
      onPreview={(data) => {
        setScheduleData(data);
        setShowPrintView(true);
      }} 
    />;
  }

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
            <div style={{ flex: "1 1 120px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "var(--text-muted)" }}>Exam Term</label>
              <select className="glass-input" value={paperData?.examTerm || examType} onChange={e => setPaperData(prev => prev ? {...prev, examTerm: e.target.value} : null)}>
                <option>Unit Test 1</option><option>Half Yearly Exam</option><option>Unit Test 2</option><option>Annual Exam</option>
              </select>
            </div>
            <div style={{ flex: "1 1 120px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "var(--text-muted)" }}>Subject</label>
              <select className="glass-input" value={paperData?.subject || ''} onChange={e => setPaperData(prev => prev ? {...prev, subject: e.target.value} : null)}>
                <option value="">Select Subject</option>
                {activeSubjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ flex: "1 1 120px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "var(--text-muted)" }}>Time Allowed</label>
              <input type="text" className="glass-input" value={paperData?.timeAllowed || '3 Hours'} onChange={e => setPaperData(prev => prev ? {...prev, timeAllowed: e.target.value} : null)} />
            </div>
            <div style={{ flex: "1 1 120px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "var(--text-muted)" }}>Max Marks</label>
              <input type="number" className="glass-input" value={paperData?.maxMarks || 100} onChange={e => setPaperData(prev => prev ? {...prev, maxMarks: Number(e.target.value)} : null)} />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 'bold' }}>General Instructions (One per line)</label>
            <textarea className="glass-input" rows={3} style={{ width: '100%', resize: 'vertical' }} value={paperData?.generalInstructions.join('\n') || ''} onChange={e => setPaperData(prev => prev ? {...prev, generalInstructions: e.target.value.split('\n')} : null)} placeholder="E.g. All questions are compulsory."></textarea>
          </div>

          <div style={{ marginBottom: '32px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <input type="checkbox" checked={paperData?.includeOMR || false} onChange={e => setPaperData(prev => prev ? {...prev, includeOMR: e.target.checked} : null)} />
              Attach OMR Sheet at the end
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <input type="checkbox" checked={paperData?.hideStandardHeader || false} onChange={e => setPaperData(prev => prev ? {...prev, hideStandardHeader: e.target.checked} : null)} />
              Hide Standard School Header
            </label>
          </div>

          <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button 
              className={`btn-${!paperData?.blocks ? 'primary' : 'secondary'}`} 
              onClick={() => {
                const newData = {...paperData} as any;
                delete newData.blocks;
                setPaperData(newData);
              }}
            >
              Use Legacy Form Builder
            </button>
            <button 
              className={`btn-${paperData?.blocks && !paperData.blocks.some(b => b.type === 'kids_activity') ? 'primary' : 'secondary'}`} 
              onClick={() => {
                const newData = {...paperData, blocks: (paperData?.blocks || []).filter(b => b.type !== 'kids_activity')} as any;
                setPaperData(newData);
              }}
            >
              Use Block Canvas (6th-12th)
            </button>
            <button 
              className={`btn-${paperData?.blocks && paperData.blocks.some(b => b.type === 'kids_activity') ? 'primary' : 'secondary'}`} 
              onClick={() => {
                const newData = {...paperData, blocks: [...(paperData?.blocks || []).filter(b => b.type === 'kids_activity'), { id: Math.random().toString(), type: 'kids_activity', category: 'VISUAL_DISCRIMINATION', subType: 'Odd One Out', instruction: 'Circle the odd one out', layoutType: 'grid', items: [], config: { columns: 4 } }]} as any;
                setPaperData(newData);
              }}
            >
              Kids Worksheet Engine (Play-5th)
            </button>
          </div>

          {paperData?.blocks && paperData.blocks.some(b => b.type === 'kids_activity') ? (
            <KidsBlockCanvas 
              blocks={paperData.blocks} 
              onChange={(newBlocks) => setPaperData(prev => prev ? {...prev, blocks: newBlocks} : null)} 
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Advanced Blocks (Optional)</h3>
                <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748b' }}>Add complex elements like images, tables, matching columns, or split sections.</p>
                <BlockCanvas 
                  blocks={paperData?.blocks || []} 
                  onChange={(newBlocks) => setPaperData(prev => prev ? {...prev, blocks: newBlocks} : null)} 
                />
              </div>
              
              <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Questions</h3>
                <button className="btn-secondary" onClick={() => {
                  if(paperData) setPaperData({...paperData, sections: [...(paperData.sections || []), { sectionTitle: 'New Section', questions: [{ text: '', marks: 1 }] }]});
                }}><Plus size={18} /> Add Section</button>
              </div>

            {paperData?.sections.map((section, sIdx) => (
              <div key={sIdx} style={{ background: 'var(--bg-color)', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--glass-border)' }}>
                <div className="section-header-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="text" className="glass-input" style={{ flex: 1, minWidth: '150px', fontWeight: 'bold', width: '100%' }} value={section.sectionTitle} onChange={e => {
                    const newSecs = [...paperData.sections];
                    newSecs[sIdx].sectionTitle = e.target.value;
                    setPaperData({...paperData, sections: newSecs});
                  }} placeholder="Section Title (e.g. SECTION A: OBJECTIVE)" />
                  <button className="btn-secondary" style={{ color: 'var(--danger)', width: 'auto', flexShrink: 0, padding: '10px 14px', marginBottom: 0 }} onClick={() => {
                    const newSecs = [...paperData.sections];
                    newSecs.splice(sIdx, 1);
                    setPaperData({...paperData, sections: newSecs});
                  }}><Trash2 size={18} /></button>
                </div>

                {section.questions.map((q, qIdx) => {
                  let globalQuestionIndex = 0;
                  for (let i = 0; i < sIdx; i++) {
                    globalQuestionIndex += paperData.sections[i].questions.filter(qu => qu.type !== 'instruction').length;
                  }
                  globalQuestionIndex += section.questions.slice(0, qIdx).filter(qu => qu.type !== 'instruction').length;
                  
                  const autoLabel = q.type === 'instruction' ? 'Info:' : `Q${globalQuestionIndex + 1}.`;

                  return (
                    <div key={qIdx} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', paddingLeft: '24px', borderLeft: '3px solid var(--primary-color)', paddingBottom: '12px' }}>
                      <div className="question-row" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <input 
                          type="text" 
                          className="glass-input" 
                          style={{ width: '70px', fontWeight: 'bold', padding: '6px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', marginTop: '4px' }} 
                          value={q.label !== undefined ? q.label : autoLabel}
                          onChange={(e) => {
                            const newSecs = [...paperData.sections];
                            newSecs[sIdx].questions[qIdx].label = e.target.value;
                            setPaperData({...paperData, sections: newSecs});
                          }}
                          onBlur={(e) => {
                            if (e.target.value.trim() === '') {
                              const newSecs = [...paperData.sections];
                              delete newSecs[sIdx].questions[qIdx].label;
                              setPaperData({...paperData, sections: newSecs});
                            }
                          }}
                        />
                      
                      <div style={{ flex: 1, minWidth: '150px', width: '100%' }}><RichTextEditor 
                        value={q.text} 
                        onChange={val => {
                          const newSecs = [...paperData.sections];
                          newSecs[sIdx].questions[qIdx].text = val;
                          setPaperData({...paperData, sections: newSecs});
                        }}
                        placeholder={q.type === 'instruction' ? "Type instruction here (e.g. Attempt any 5 questions)" : "Type question here..."}
                      />

                      {q.type === 'tracing' && (
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>
                          Note: For tracing, just type the letters (e.g., "A B C D E"). The editor format (bold/italic) will be ignored; it will be rendered as dotted grids in the print view.
                        </div>
                      )}
                      
                      {q.type === 'passage' && (
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>
                          Note: Passage text spans the full width and allows for larger reading blocks.
                        </div>
                      )}
                      {q.image && (
                        <div style={{ marginTop: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px', background: '#f9fafb' }}>
                          <img src={q.image} alt="Question" style={{ maxWidth: '100%', height: 'auto', display: 'block', marginBottom: '8px' }} />
                          <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'var(--danger)' }} onClick={() => {
                            const newSecs = [...paperData.sections];
                            delete newSecs[sIdx].questions[qIdx].image;
                            setPaperData({...paperData, sections: newSecs});
                          }}>Remove Image (Legacy)</button>
                        </div>
                      )}

                      {((q.images && q.images.length > 0) || (q.shapes && q.shapes.length > 0)) && (
                        <div style={{ marginTop: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', background: '#f9fafb' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Preview</div>
                          
                          <div style={{ overflow: 'hidden', width: '100%', border: '1px dashed #cbd5e1', padding: '8px', background: 'white', borderRadius: '4px', marginBottom: '16px' }}>
                            {q.images?.map((img, iIdx) => {
                              const isCenter = (!img.align || img.align === 'center');
                              const isRight = img.align === 'right';
                              return (
                                <div key={`img-${iIdx}`} style={{ 
                                  float: isCenter ? 'none' : (isRight ? 'right' : 'left'),
                                  margin: isCenter ? '0 auto' : '0',
                                  width: `${img.width || 100}%`, 
                                  textAlign: isCenter ? 'center' : (isRight ? 'right' : 'left'),
                                  padding: '4px',
                                  boxSizing: 'border-box'
                                }}>
                                  <img src={img.url} alt="" style={{ maxWidth: '100%', height: 'auto', display: 'inline-block' }} />
                                </div>
                              );
                            })}
                            
                            {q.shapes?.map((shape, sIdx) => {
                              const isCenter = (!shape.align || shape.align === 'center');
                              const isRight = shape.align === 'right';
                              return (
                                <div key={`shape-${sIdx}`} style={{ 
                                  float: isCenter ? 'none' : (isRight ? 'right' : 'left'),
                                  margin: isCenter ? '0 auto' : '0',
                                  width: `${shape.width || 10}%`, 
                                  textAlign: isCenter ? 'center' : (isRight ? 'right' : 'left'),
                                  padding: '4px',
                                  boxSizing: 'border-box'
                                }}>
                                  <div style={{ display: 'inline-block', width: '100%', aspectRatio: shape.type === 'line' ? 'auto' : '1 / 1' }}>
                                    {renderShape(shape)}
                                  </div>
                                </div>
                              );
                            })}
                            
                            <div style={{ clear: 'both' }}></div>
                          </div>

                          <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Settings</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {q.images?.map((img, iIdx) => (
                              <div key={`img-set-${iIdx}`} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'white', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <img src={img.url} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e5e7eb' }} />
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Size:</span>
                                  <input type="number" min="5" max="100" value={img.width} onChange={e => {
                                    const newSecs = [...paperData.sections];
                                    newSecs[sIdx].questions[qIdx].images![iIdx].width = Number(e.target.value);
                                    setPaperData({...paperData, sections: newSecs});
                                  }} style={{ width: '60px', padding: '4px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center' }} />
                                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>%</span>
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderLeft: '1px solid #e5e7eb', paddingLeft: '16px' }}>
                                  <button className="btn-secondary" style={{ padding: '4px', background: img.align === 'left' ? '#e5e7eb' : 'transparent', border: 'none', marginBottom: 0 }} onClick={() => {
                                    const newSecs = [...paperData.sections];
                                    newSecs[sIdx].questions[qIdx].images![iIdx].align = 'left';
                                    setPaperData({...paperData, sections: newSecs});
                                  }}><AlignLeft size={16} /></button>
                                  <button className="btn-secondary" style={{ padding: '4px', background: (!img.align || img.align === 'center') ? '#e5e7eb' : 'transparent', border: 'none', marginBottom: 0 }} onClick={() => {
                                    const newSecs = [...paperData.sections];
                                    newSecs[sIdx].questions[qIdx].images![iIdx].align = 'center';
                                    setPaperData({...paperData, sections: newSecs});
                                  }}><AlignCenter size={16} /></button>
                                  <button className="btn-secondary" style={{ padding: '4px', background: img.align === 'right' ? '#e5e7eb' : 'transparent', border: 'none', marginBottom: 0 }} onClick={() => {
                                    const newSecs = [...paperData.sections];
                                    newSecs[sIdx].questions[qIdx].images![iIdx].align = 'right';
                                    setPaperData({...paperData, sections: newSecs});
                                  }}><AlignRight size={16} /></button>
                                </div>
                                
                                <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'var(--danger)', marginLeft: 'auto', marginBottom: 0 }} onClick={() => {
                                  const newSecs = [...paperData.sections];
                                  newSecs[sIdx].questions[qIdx].images!.splice(iIdx, 1);
                                  setPaperData({...paperData, sections: newSecs});
                                }}>Remove</button>
                              </div>
                            ))}
                            
                            {q.shapes?.map((shape, shpIdx) => (
                              <div key={`shape-set-${shpIdx}`} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', background: 'white', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {renderShape({ ...shape, width: 40, height: 40, rotation: 0 })}
                                </div>
                                
                                <select className="glass-input" style={{ width: '100px', padding: '4px' }} value={shape.type} onChange={e => {
                                  const newSecs = [...paperData.sections];
                                  newSecs[sIdx].questions[qIdx].shapes![shpIdx].type = e.target.value;
                                  setPaperData({...paperData, sections: newSecs});
                                }}>
                                  <option value="circle">Circle</option>
                                  <option value="square">Square</option>
                                  <option value="triangle">Triangle</option>
                                  <option value="hexagon">Hexagon</option>
                                  <option value="octagon">Octagon</option>
                                  <option value="star">Star</option>
                                  <option value="diamond">Diamond</option>
                                  <option value="line">Line</option>
                                </select>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ fontSize: '0.8rem' }}>Color:</span>
                                  <input type="color" value={shape.color} onChange={e => {
                                    const newSecs = [...paperData.sections];
                                    newSecs[sIdx].questions[qIdx].shapes![shpIdx].color = e.target.value;
                                    setPaperData({...paperData, sections: newSecs});
                                  }} style={{ width: '30px', height: '24px', padding: '0', border: 'none', cursor: 'pointer' }} />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ fontSize: '0.8rem' }}>Size:</span>
                                  <input type="number" min="5" max="100" value={shape.width} onChange={e => {
                                    const newSecs = [...paperData.sections];
                                    newSecs[sIdx].questions[qIdx].shapes![shpIdx].width = Number(e.target.value);
                                    setPaperData({...paperData, sections: newSecs});
                                  }} style={{ width: '50px', padding: '4px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center' }} />%
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ fontSize: '0.8rem' }}>Rot:</span>
                                  <input type="number" value={shape.rotation} onChange={e => {
                                    const newSecs = [...paperData.sections];
                                    newSecs[sIdx].questions[qIdx].shapes![shpIdx].rotation = Number(e.target.value);
                                    setPaperData({...paperData, sections: newSecs});
                                  }} style={{ width: '50px', padding: '4px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center' }} />°
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <button className="btn-secondary" style={{ padding: '4px', border: 'none', background: shape.flipX ? '#e5e7eb' : 'transparent' }} onClick={() => {
                                    const newSecs = [...paperData.sections];
                                    newSecs[sIdx].questions[qIdx].shapes![shpIdx].flipX = !shape.flipX;
                                    setPaperData({...paperData, sections: newSecs});
                                  }}><FlipHorizontal size={14} /></button>
                                  <button className="btn-secondary" style={{ padding: '4px', border: 'none', background: shape.flipY ? '#e5e7eb' : 'transparent' }} onClick={() => {
                                    const newSecs = [...paperData.sections];
                                    newSecs[sIdx].questions[qIdx].shapes![shpIdx].flipY = !shape.flipY;
                                    setPaperData({...paperData, sections: newSecs});
                                  }}><FlipVertical size={14} /></button>
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderLeft: '1px solid #e5e7eb', paddingLeft: '8px' }}>
                                  <button className="btn-secondary" style={{ padding: '4px', background: shape.align === 'left' ? '#e5e7eb' : 'transparent', border: 'none', marginBottom: 0 }} onClick={() => {
                                    const newSecs = [...paperData.sections];
                                    newSecs[sIdx].questions[qIdx].shapes![shpIdx].align = 'left';
                                    setPaperData({...paperData, sections: newSecs});
                                  }}><AlignLeft size={16} /></button>
                                  <button className="btn-secondary" style={{ padding: '4px', background: (!shape.align || shape.align === 'center') ? '#e5e7eb' : 'transparent', border: 'none', marginBottom: 0 }} onClick={() => {
                                    const newSecs = [...paperData.sections];
                                    newSecs[sIdx].questions[qIdx].shapes![shpIdx].align = 'center';
                                    setPaperData({...paperData, sections: newSecs});
                                  }}><AlignCenter size={16} /></button>
                                  <button className="btn-secondary" style={{ padding: '4px', background: shape.align === 'right' ? '#e5e7eb' : 'transparent', border: 'none', marginBottom: 0 }} onClick={() => {
                                    const newSecs = [...paperData.sections];
                                    newSecs[sIdx].questions[qIdx].shapes![shpIdx].align = 'right';
                                    setPaperData({...paperData, sections: newSecs});
                                  }}><AlignRight size={16} /></button>
                                </div>
                                
                                <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'var(--danger)', marginLeft: 'auto', marginBottom: 0 }} onClick={() => {
                                  const newSecs = [...paperData.sections];
                                  newSecs[sIdx].questions[qIdx].shapes!.splice(shpIdx, 1);
                                  setPaperData({...paperData, sections: newSecs});
                                }}>Remove</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {q.blankSpace !== undefined && (
                        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', background: '#fef3c7', padding: '8px 12px', borderRadius: '8px', border: '1px dashed #f59e0b' }}>
                          <Square size={16} color="#d97706" />
                          <span style={{ color: '#d97706', fontSize: '0.9rem', fontWeight: 600 }}>Blank Space (px):</span>
                          <input type="number" className="glass-input" style={{ width: '80px', padding: '4px 8px' }} value={q.blankSpace} onChange={e => {
                            const newSecs = [...paperData.sections];
                            newSecs[sIdx].questions[qIdx].blankSpace = Number(e.target.value) || 0;
                            setPaperData({...paperData, sections: newSecs});
                          }} />
                          <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'var(--danger)', marginLeft: 'auto' }} onClick={() => {
                            const newSecs = [...paperData.sections];
                            delete newSecs[sIdx].questions[qIdx].blankSpace;
                            setPaperData({...paperData, sections: newSecs});
                          }}>Remove Space</button>
                        </div>
                      )}

                      {q.hint !== undefined && (
                        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', background: '#f3f4f6', padding: '8px 12px', borderRadius: '8px' }}>
                          <Lightbulb size={16} color="#4b5563" />
                          <input type="text" className="glass-input" placeholder="Enter Hint..." style={{ flex: 1, padding: '4px 8px' }} value={q.hint} onChange={e => {
                            const newSecs = [...paperData.sections];
                            newSecs[sIdx].questions[qIdx].hint = e.target.value;
                            setPaperData({...paperData, sections: newSecs});
                          }} />
                          <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'var(--danger)' }} onClick={() => {
                            const newSecs = [...paperData.sections];
                            delete newSecs[sIdx].questions[qIdx].hint;
                            setPaperData({...paperData, sections: newSecs});
                          }}>Remove Hint</button>
                        </div>
                      )}
                      
                      <div className="question-action-bar" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '12px', padding: '8px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <select className="glass-input" style={{ background: 'white' }} value={q.type || 'subjective'} onChange={e => {
                          const newSecs = [...paperData.sections];
                          newSecs[sIdx].questions[qIdx].type = e.target.value as any;
                          if (e.target.value === 'objective' && !newSecs[sIdx].questions[qIdx].options) {
                            newSecs[sIdx].questions[qIdx].options = ['', '', '', ''];
                          }
                          if (e.target.value === 'match' && !newSecs[sIdx].questions[qIdx].matchPairs) {
                            newSecs[sIdx].questions[qIdx].matchPairs = [{left: '', right: ''}, {left: '', right: ''}];
                          }
                          if (e.target.value === 'fill_in_the_blanks' && !newSecs[sIdx].questions[qIdx].wordBank) {
                            newSecs[sIdx].questions[qIdx].wordBank = [];
                          }
                          setPaperData({...paperData, sections: newSecs});
                        }}>
                          <option value="subjective">Subjective</option>
                          <option value="objective">Objective (MCQ)</option>
                          <option value="match">Match the Following</option>
                          <option value="fill_in_the_blanks">Fill in the Blanks</option>
                          <option value="true_false">True / False</option>
                          <option value="tracing">Tracing (Play Class)</option>
                          <option value="passage">Comprehension Passage</option>
                          <option value="instruction">Instruction Text</option>
                        </select>
                        
                        {q.type !== 'instruction' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'white', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <input type="number" style={{ width: '40px', border: 'none', outline: 'none', background: 'transparent', textAlign: 'center' }} value={q.marks} onChange={e => {
                              const newSecs = [...paperData.sections];
                              newSecs[sIdx].questions[qIdx].marks = Number(e.target.value);
                              setPaperData({...paperData, sections: newSecs});
                            }} />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>marks</span>
                          </div>
                        )}

                        <div style={{ width: '1px', height: '20px', background: '#d1d5db', margin: '0 4px' }} />

                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem', color: '#4b5563', background: 'white', border: '1px solid var(--border-color)', transition: 'all 0.2s' }} className="hover-bg-gray">
                          <ImageIcon size={14} /> Add Image
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                // Compression
                                const img = new Image();
                                img.onload = () => {
                                  const canvas = document.createElement('canvas');
                                  let width = img.width; let height = img.height;
                                  const max = 800;
                                  if(width > max || height > max) {
                                    if(width > height) { height = (height/width)*max; width = max; }
                                    else { width = (width/height)*max; height = max; }
                                  }
                                  canvas.width = width; canvas.height = height;
                                  const ctx = canvas.getContext('2d');
                                  ctx?.drawImage(img, 0, 0, width, height);
                                  const newSecs = [...paperData.sections];
                                  if (!newSecs[sIdx].questions[qIdx].images) {
                                    newSecs[sIdx].questions[qIdx].images = [];
                                  }
                                  newSecs[sIdx].questions[qIdx].images!.push({
                                    url: canvas.toDataURL('image/jpeg', 0.8),
                                    width: 10,
                                    align: 'center'
                                  });
                                  setPaperData({...paperData, sections: newSecs});
                                };
                                img.src = ev.target?.result as string;
                              };
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                        
                        <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.85rem', background: 'white', border: '1px solid var(--border-color)', marginBottom: 0 }} onClick={() => {
                          const newSecs = [...paperData.sections];
                          if (!newSecs[sIdx].questions[qIdx].shapes) {
                            newSecs[sIdx].questions[qIdx].shapes = [];
                          }
                          newSecs[sIdx].questions[qIdx].shapes!.push({
                            type: 'circle',
                            width: 10,
                            color: '#000000',
                            rotation: 0,
                            flipX: false,
                            flipY: false,
                            align: 'center'
                          });
                          setPaperData({...paperData, sections: newSecs});
                        }}>
                          <Shapes size={14} /> Add Shape
                        </button>
                        <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.85rem', background: 'white', border: '1px solid var(--border-color)', marginBottom: 0 }} onClick={() => {
                           const newSecs = [...paperData.sections];
                           newSecs[sIdx].questions[qIdx].blankSpace = 100;
                           setPaperData({...paperData, sections: newSecs});
                        }}>
                          <Square size={14} /> Blank Space
                        </button>

                        <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.85rem', background: 'white', border: '1px solid var(--border-color)', marginBottom: 0 }} onClick={() => {
                           const newSecs = [...paperData.sections];
                           newSecs[sIdx].questions[qIdx].hint = '';
                           setPaperData({...paperData, sections: newSecs});
                        }}>
                          <Lightbulb size={14} /> Hint
                        </button>

                        <button className="btn-secondary" style={{ padding: "6px", color: "var(--danger)", width: "auto", marginBottom: 0, marginLeft: 'auto', background: 'white', border: '1px solid #fca5a5' }} onClick={() => {
                          const newSecs = [...paperData.sections];
                          newSecs[sIdx].questions.splice(qIdx, 1);
                          setPaperData({...paperData, sections: newSecs});
                        }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                    </div>

                    {q.type === 'match' && (
                      <div style={{ marginTop: '16px', paddingLeft: '32px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '8px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                          <div>Left Column</div>
                          <div>Right Column</div>
                        </div>
                        {q.matchPairs?.map((pair, pIdx) => (
                          <div key={pIdx} style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                            <input type="text" className="glass-input" style={{ flex: 1 }} value={pair.left} onChange={e => {
                               const newSecs = [...paperData.sections];
                               newSecs[sIdx].questions[qIdx].matchPairs![pIdx].left = e.target.value;
                               setPaperData({...paperData, sections: newSecs});
                            }} placeholder="Item" />
                            <input type="text" className="glass-input" style={{ flex: 1 }} value={pair.right} onChange={e => {
                               const newSecs = [...paperData.sections];
                               newSecs[sIdx].questions[qIdx].matchPairs![pIdx].right = e.target.value;
                               setPaperData({...paperData, sections: newSecs});
                            }} placeholder="Match" />
                            <button className="btn-secondary" style={{ padding: '8px', color: 'var(--danger)' }} onClick={() => {
                               const newSecs = [...paperData.sections];
                               newSecs[sIdx].questions[qIdx].matchPairs!.splice(pIdx, 1);
                               setPaperData({...paperData, sections: newSecs});
                            }}><Trash2 size={16} /></button>
                          </div>
                        ))}
                        <button className="btn-secondary" style={{ marginTop: '8px', fontSize: '0.85rem', padding: '6px 12px' }} onClick={() => {
                          const newSecs = [...paperData.sections];
                          newSecs[sIdx].questions[qIdx].matchPairs!.push({left: '', right: ''});
                          setPaperData({...paperData, sections: newSecs});
                        }}><Plus size={14} /> Add Row</button>
                      </div>
                    )}

                    {q.type === 'fill_in_the_blanks' && (
                      <div style={{ paddingLeft: '32px', marginTop: '12px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px' }}>
                          Add words for the hint box (Word Bank). Use Enter or comma to add. Note: Use underscores (____) in the question text to create blanks.
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb', minHeight: '42px' }}>
                          {q.wordBank?.map((word, wIdx) => (
                            <span key={wIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'white', padding: '2px 8px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
                              {word}
                              <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }} onClick={() => {
                                const newSecs = [...paperData.sections];
                                newSecs[sIdx].questions[qIdx].wordBank!.splice(wIdx, 1);
                                setPaperData({...paperData, sections: newSecs});
                              }}>×</button>
                            </span>
                          ))}
                          <input type="text" placeholder="Type a word and press Enter..." style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, minWidth: '150px', fontSize: '0.85rem' }} onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              const val = e.currentTarget.value.trim();
                              if (val) {
                                const newSecs = [...paperData.sections];
                                if (!newSecs[sIdx].questions[qIdx].wordBank) newSecs[sIdx].questions[qIdx].wordBank = [];
                                newSecs[sIdx].questions[qIdx].wordBank!.push(val);
                                setPaperData({...paperData, sections: newSecs});
                                e.currentTarget.value = '';
                              }
                            }
                          }} />
                        </div>
                      </div>
                    )}

                    {q.type === 'objective' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingLeft: '32px', marginTop: '12px' }}>
                        {['A', 'B', 'C', 'D'].map((optLabel, optIdx) => (
                          <div key={optIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 'bold' }}>{optLabel}.</span>
                              <input type="text" className="glass-input" style={{ flex: 1, padding: '6px 12px' }} value={q.options?.[optIdx] || ''} onChange={e => {
                                const newSecs = [...paperData.sections];
                                const opts = newSecs[sIdx].questions[qIdx].options || ['', '', '', ''];
                                opts[optIdx] = e.target.value;
                                newSecs[sIdx].questions[qIdx].options = opts;
                                setPaperData({...paperData, sections: newSecs});
                              }} placeholder={`Option ${optLabel}`} />
                              
                              <label style={{ cursor: 'pointer', padding: '4px', background: '#f3f4f6', borderRadius: '4px', border: '1px solid #d1d5db', display: 'flex' }}>
                                <ImageIcon size={14} />
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      const img = new Image();
                                      img.onload = () => {
                                        const canvas = document.createElement('canvas');
                                        let width = img.width; let height = img.height;
                                        if (width > 600) { height = Math.round(height * 600 / width); width = 600; }
                                        canvas.width = width; canvas.height = height;
                                        const ctx = canvas.getContext('2d');
                                        ctx?.drawImage(img, 0, 0, width, height);
                                        const newSecs = [...paperData.sections];
                                        if (!newSecs[sIdx].questions[qIdx].optionImages) {
                                          newSecs[sIdx].questions[qIdx].optionImages = ['', '', '', ''];
                                        }
                                        newSecs[sIdx].questions[qIdx].optionImages![optIdx] = canvas.toDataURL('image/jpeg', 0.8);
                                        setPaperData({...paperData, sections: newSecs});
                                      };
                                      img.src = ev.target?.result as string;
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }} />
                              </label>
                            </div>
                            
                            {q.optionImages && q.optionImages[optIdx] && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '24px' }}>
                                <img src={q.optionImages[optIdx]} alt="" style={{ height: '40px', borderRadius: '4px', border: '1px solid #e5e7eb' }} />
                                <button className="btn-secondary" style={{ padding: '2px 6px', fontSize: '0.7rem', color: 'var(--danger)', marginBottom: 0 }} onClick={() => {
                                  const newSecs = [...paperData.sections];
                                  newSecs[sIdx].questions[qIdx].optionImages![optIdx] = '';
                                  setPaperData({...paperData, sections: newSecs});
                                }}>Remove</button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )})}
                
                <button className="btn-secondary" style={{ marginTop: '8px', marginLeft: '24px', fontSize: '0.9rem', padding: '6px 12px' }} onClick={() => {
                  const newSecs = [...paperData.sections];
                  newSecs[sIdx].questions.push({ text: '', marks: 1 });
                  setPaperData({...paperData, sections: newSecs});
                }}><Plus size={16} /> Add Question</button>
              </div>
            ))}
          </div>
          </div>
          )}

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
        
        <button className={activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('reports')}><Award size={18} style={{whiteSpace:'nowrap'}}/> Report Cards</button>
        {role !== 'Teacher' && <button className={activeTab === 'schedules' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('schedules')}><Calendar size={18} style={{whiteSpace:'nowrap'}}/> Schedules</button>}
        <button className={activeTab === 'papers' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('papers')}><FileSignature size={18} style={{whiteSpace:'nowrap'}}/> Paper Builder</button>
        {role !== 'Teacher' && (
          <>
            <button className={activeTab === 'certificates' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('certificates')}><ShieldAlert size={18} style={{whiteSpace:'nowrap'}}/> Certificates</button>
            <button className={activeTab === 'doc_builder' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('doc_builder')}><FileText size={18} style={{whiteSpace:'nowrap'}}/> Custom Docs</button>
          </>
        )}
      </div>

        {activeTab !== 'doc_builder' && (
          <>
          {!(activeTab === 'schedules' && scheduleMode === 'combined') && (
          <div className="glass-panel" style={{ padding: '20px', marginBottom: '32px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Class</label>
              <select className="glass-input" value={classFilter} onChange={handleClassChange}>
                <option value="">Select Class</option>
                {uniqueClasses.map(c => <option key={c.id} value={c.className}>{c.className}</option>)}
              </select>
          </div>
          {true && (
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Section</label>
              <select className="glass-input" value={sectionFilter} onChange={e => setSectionFilter(e.target.value)} disabled={!classFilter}>
                <option value="">All Sections</option>
                {activeSections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
              </select>
            </div>
          )}
          {(activeTab === 'reports' || activeTab === 'certificates') && (
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Search Student</label>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search by name or Admission No..." 
                  className="glass-input" 
                  style={{ paddingLeft: '40px', width: '100%', margin: 0 }}
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
        )}

      {(!classFilter && activeTab === 'papers' || (!classFilter && activeTab !== 'schedules' && activeTab !== 'papers' && !studentSearch.trim())) ? (
        <div className="glass-panel" style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileText size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <h3>{(activeTab === 'schedules' || activeTab === 'papers') ? 'No Class Selected' : 'No Class or Student Selected'}</h3>
          <p>Please select a Class {(activeTab === 'schedules' || activeTab === 'papers') ? '' : 'or search for a student '}to continue.</p>
        </div>
      ) : (
        <>
          {/* Schedules Tab */}
          {activeTab === 'schedules' && (
              <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
                <Calendar size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <h3>Manage Exam Schedules</h3>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
                  <button 
                    className={scheduleMode === 'class_wise' ? 'btn-primary' : 'btn-secondary'} 
                    onClick={() => setScheduleMode('class_wise')}
                    style={{ padding: '8px 24px', borderRadius: '8px' }}>
                    Class-Wise
                  </button>
                  <button 
                    className={scheduleMode === 'combined' ? 'btn-primary' : 'btn-secondary'} 
                    onClick={() => setScheduleMode('combined')}
                    style={{ padding: '8px 24px', borderRadius: '8px' }}>
                    Combined
                  </button>
                </div>

                {scheduleMode === 'class_wise' ? (
                  <>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Create and print individual date sheets for {classFilter || 'selected class'}.</p>
                    <button className="btn-primary" disabled={!classFilter} onClick={async () => {
                      if (!classFilter) return;
                      const existing = await getExamSchedulesByClass(classFilter);
                      const termSched = existing.find(s => s.examTerm === examType);
                      if(termSched) {
                        setScheduleData(termSched);
                      } else {
                        setScheduleData({ classId: classFilter, examTerm: examType, schedule: activeSubjects.map(s => ({ subject: s, date: '', startTime: '09:00 AM', endTime: '12:00 PM' })) });
                      }
                      setView('schedule_config');
                    }}>
                      <Calendar size={20} style={{ marginRight: '8px' }} /> {classFilter ? 'Configure Date Sheet' : 'Select a Class First'}
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Generate a Master Date Sheet containing all classes for {examType}.</p>
                    <button className="btn-primary" onClick={() => {
                      setView('master_schedule_config');
                    }}>
                      <Printer size={20} style={{ marginRight: '8px' }} /> Configure Master Date Sheet
                    </button>
                  </>
                )}
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
          {(activeTab === 'reports' || activeTab === 'certificates') && (
            <>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>
                Students in {classFilter} {sectionFilter} ({filteredStudents.length})
              </h3>
              
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
                          {(student.firstName || '')[0]}{(student.lastName || '')[0]}
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '1.2rem' }}>{student.firstName} {student.lastName}</h4>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Roll No: {student.rollNumber || '-'}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '8px' }}>
                          
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
      </>)}
      {activeTab === 'doc_builder' && <DocumentBuilder />}
    </motion.div>
  );
};

export default Examination;







