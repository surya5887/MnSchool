import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Save, CheckCircle, Award, FileOutput } from 'lucide-react';
import { getStudents, type StudentData } from '../services/studentService';
import { getClasses, type ClassData } from '../services/classService';
import { saveExamMark, getAllExamMarksForTerm, type ExamMarkData } from '../services/examService';
import ReportCardPrintView from '../components/ReportCardPrintView';
// Import TransferCertificate if it exists, otherwise we'll create a placeholder print view for TC
// For now we will add a flag to show TC print view
import TransferCertificatePrintView from '../components/TransferCertificatePrintView';

type SubjectMarks = { theory: number; practical: number; docId?: string };
type StudentMarksRecord = Record<string, SubjectMarks>; // subject -> marks

const Examination: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [examType, setExamType] = useState('Half Yearly Exam');
  const [maxMarks, setMaxMarks] = useState(100);
  
  const [activeSections, setActiveSections] = useState<string[]>([]);
  const [activeSubjects, setActiveSubjects] = useState<string[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  
  // marksMap[studentId][subject] = { theory, practical, docId }
  const [marksMap, setMarksMap] = useState<Record<string, StudentMarksRecord>>({});
  const [saved, setSaved] = useState(false);
  
  const [showPrintView, setShowPrintView] = useState(false);
  const [showTCPrintView, setShowTCPrintView] = useState(false);
  
  const [printMarks, setPrintMarks] = useState<ExamMarkData[]>([]);
  const [singleStudentForPrint, setSingleStudentForPrint] = useState<StudentData[]>([]);

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

  // Fetch all marks for the selected term whenever term or class changes
  useEffect(() => {
    if (examType && filteredStudents.length > 0) {
      const fetchMarks = async () => {
        const marksData = await getAllExamMarksForTerm(examType);
        const newMap: Record<string, StudentMarksRecord> = {};
        
        marksData.forEach(m => {
          if (!newMap[m.studentId]) newMap[m.studentId] = {};
          newMap[m.studentId][m.subject] = { theory: m.theoryMarks, practical: m.practicalMarks, docId: m.id };
        });
        setMarksMap(newMap);
      };
      fetchMarks();
    } else {
      setMarksMap({});
    }
  }, [examType, filteredStudents]);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setClassFilter(e.target.value);
  };

  const handleMarkChange = (studentId: string, subject: string, type: 'theory' | 'practical', value: string) => {
    let numVal = parseInt(value, 10);
    if (isNaN(numVal)) numVal = 0;
    
    // Validation
    if (type === 'theory' && numVal > maxTheory) numVal = maxTheory;
    if (type === 'practical' && numVal > maxPractical) numVal = maxPractical;
    if (numVal < 0) numVal = 0;

    setMarksMap(prev => {
      const studentData = prev[studentId] || {};
      const subjectData = studentData[subject] || { theory: 0, practical: 0 };
      
      return {
        ...prev,
        [studentId]: {
          ...studentData,
          [subject]: {
            ...subjectData,
            [type]: numVal
          }
        }
      };
    });
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
    // Save all marks that exist in marksMap
    const promises: Promise<any>[] = [];
    
    for (const studentId of Object.keys(marksMap)) {
      const studentSubjects = marksMap[studentId];
      for (const subject of Object.keys(studentSubjects)) {
        const marks = studentSubjects[subject];
        promises.push(
          saveExamMark({
            studentId,
            examTerm: examType,
            subject,
            theoryMarks: marks.theory || 0,
            practicalMarks: marks.practical || 0
          })
        );
      }
    }
    
    await Promise.all(promises);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDownloadTemplate = () => {
    if (filteredStudents.length === 0) {
      alert("No students to export.");
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    // Header
    const headerRow = ["Roll No", "Student Name"];
    activeSubjects.forEach(s => {
      headerRow.push(`${s} Theory(Max ${maxTheory})`);
      headerRow.push(`${s} Practical(Max ${maxPractical})`);
    });
    csvContent += headerRow.join(",") + "\r\n";
    
    filteredStudents.forEach(student => {
      const row = [`"${student.rollNumber || ''}"`, `"${student.firstName} ${student.lastName}"`];
      activeSubjects.forEach(subj => {
        const theory = marksMap[student.id!]?.[subj]?.theory || 0;
        const prac = marksMap[student.id!]?.[subj]?.practical || 0;
        row.push(theory.toString());
        row.push(prac.toString());
      });
      csvContent += row.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Marks_Template_${classFilter}_${sectionFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateReportCard = async (student: StudentData) => {
    // Generate for a single student
    const allMarks = await getAllExamMarksForTerm(examType);
    setPrintMarks(allMarks);
    setSingleStudentForPrint([student]);
    setShowPrintView(true);
  };

  const handleGenerateTC = (student: StudentData) => {
    setSingleStudentForPrint([student]);
    setShowTCPrintView(true);
  };

  if (showPrintView) {
    return (
      <ReportCardPrintView 
        students={singleStudentForPrint} 
        marks={printMarks} 
        term={examType} 
        className={classFilter || 'Unknown Class'} 
        section={sectionFilter} 
        maxMarks={maxMarks}
        onClose={() => setShowPrintView(false)} 
      />
    );
  }

  if (showTCPrintView) {
    return (
      <TransferCertificatePrintView 
        student={singleStudentForPrint[0]}
        className={classFilter || 'Unknown Class'}
        section={sectionFilter}
        onClose={() => setShowTCPrintView(false)}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title"><FileText size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Examinations & Results</h1>
          <p className="page-subtitle">Enter student marks, grade automatically, and generate beautiful PDF report cards & TCs.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px' }}>
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
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Exam Term</label>
          <select className="glass-input" value={examType} onChange={(e) => setExamType(e.target.value)}>
            <option>Half Yearly Exam</option>
            <option>Final Annual Exam</option>
            <option>Unit Test 1</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Max Marks (Total)</label>
          <input type="number" className="glass-input" value={maxMarks} onChange={(e) => setMaxMarks(Number(e.target.value) || 0)} min="10" />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>
          {filteredStudents.length} Students {classFilter ? `in ${classFilter} ${sectionFilter}` : ''}
        </h3>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn-secondary" onClick={handleDownloadTemplate}><Download size={18} /> Download Excel Template</button>
          <button className="btn-primary" onClick={handleSaveMarks}><Save size={18} /> Save All Marks</button>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {filteredStudents.map(student => {
          return (
            <motion.div key={student.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
              
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', color: 'var(--text-main)' }}>{student.firstName} {student.lastName}</h3>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Roll No: <span style={{ fontWeight: 600, color: 'var(--text-main)', marginRight: '16px' }}>{student.rollNumber || 'N/A'}</span>
                    Adm No: <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{student.admissionNo || 'N/A'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => handleGenerateReportCard(student)}>
                    <Award size={16} /> Report Card
                  </button>
                  <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => handleGenerateTC(student)}>
                    <FileOutput size={16} /> Generate TC
                  </button>
                </div>
              </div>

              {/* Subjects List */}
              {activeSubjects.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Table Header row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', padding: '0 16px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    <div>Subject</div>
                    <div>Theory (Max {maxTheory})</div>
                    <div>Practical (Max {maxPractical})</div>
                    <div>Total & Grade</div>
                  </div>
                  
                  {activeSubjects.map(subj => {
                    const theory = marksMap[student.id!]?.[subj]?.theory || 0;
                    const prac = marksMap[student.id!]?.[subj]?.practical || 0;
                    const total = theory + prac;
                    const grade = calculateGrade(total);

                    return (
                      <div key={subj} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                        <div style={{ fontWeight: 600 }}>{subj}</div>
                        <div>
                          <input type="number" max={maxTheory} min="0" value={theory.toString()} onChange={e => handleMarkChange(student.id!, subj, 'theory', e.target.value)} className="glass-input" style={{ width: '80px', padding: '8px' }}/>
                        </div>
                        <div>
                          <input type="number" max={maxPractical} min="0" value={prac.toString()} onChange={e => handleMarkChange(student.id!, subj, 'practical', e.target.value)} className="glass-input" style={{ width: '80px', padding: '8px' }}/>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{total}</span>
                          <span className={`badge ${(total/maxMarks*100) >= 33 ? 'success' : 'danger'}`}>{grade}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.3)', borderRadius: '12px' }}>
                  No subjects assigned to this class. Go to Classes & Sections to add subjects.
                </div>
              )}
            </motion.div>
          );
        })}
        {filteredStudents.length === 0 && (
          <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No students found. Please select a valid class and section.
          </div>
        )}
      </div>
      
      {filteredStudents.length > 0 && (
        <div className="glass-panel" style={{ padding: '20px', marginTop: '24px', position: 'sticky', bottom: '24px', zIndex: 10, display: 'flex', justifyContent: 'flex-end' }}>
           <button className="btn-primary" style={{ padding: '12px 32px', fontSize: '1.1rem' }} onClick={handleSaveMarks}><Save size={20} /> Save All Students' Marks</button>
        </div>
      )}

      <AnimatePresence>
        {saved && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed', bottom: '100px', right: '40px',
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
