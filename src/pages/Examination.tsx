import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Save, Download, Award, CheckCircle } from 'lucide-react';
import { getStudents, type StudentData } from '../services/studentService';
import { getExamMarks, saveExamMark } from '../services/examService';
import { getClasses, type ClassData } from '../services/classService';

const Examination: React.FC = () => {
  const [examType, setExamType] = useState('Half Yearly Exam');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [students, setStudents] = useState<StudentData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [marksMap, setMarksMap] = useState<Record<string, { theory: number, practical: number }>>({});
  const [saved, setSaved] = useState(false);
  
  useEffect(() => {
    const fetchStudentsAndClasses = async () => {
      try {
        const [studentData, classData] = await Promise.all([
          getStudents(),
          getClasses()
        ]);
        setStudents(studentData);
        setClasses(classData);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchStudentsAndClasses();
  }, []);

  useEffect(() => {
    if (!subjectFilter) return;
    const fetchMarks = async () => {
      try {
        const marksData = await getExamMarks(examType, subjectFilter);
        const map: Record<string, { theory: number, practical: number }> = {};
        marksData.forEach(m => {
          map[m.studentId] = { theory: m.theoryMarks, practical: m.practicalMarks };
        });
        setMarksMap(map);
      } catch (error) {
        console.error("Error fetching marks", error);
      }
    };
    fetchMarks();
  }, [examType, subjectFilter]);

  const filteredStudents = students.filter(s => {
    const matchClass = !classFilter || s.classId === classFilter;
    const matchSection = !sectionFilter || s.sectionId === sectionFilter;
    // If no class is selected, show none to avoid confusion during data entry
    if (!classFilter) return false;
    return matchClass && matchSection;
  });
  
  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newClass = e.target.value;
    setClassFilter(newClass);
    setSectionFilter('');
    const selectedClass = classes.find(c => c.className === newClass);
    if (selectedClass && selectedClass.subjects && selectedClass.subjects.length > 0) {
      setSubjectFilter(selectedClass.subjects[0]);
    } else {
      setSubjectFilter('');
    }
  };

  const activeClassObj = classes.find(c => c.className === classFilter);
  const activeSections = activeClassObj?.sections || [];
  const activeSubjects = activeClassObj?.subjects || [];

  const handleMarkChange = (studentId: string, type: 'theory' | 'practical', value: number) => {
    setMarksMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [type]: value || 0
      }
    }));
  };

  const calculateGrade = (total: number) => {
    if (total >= 90) return 'A1';
    if (total >= 80) return 'A2';
    if (total >= 70) return 'B1';
    if (total >= 60) return 'B2';
    if (total >= 50) return 'C1';
    if (total >= 40) return 'C2';
    if (total >= 33) return 'D';
    return 'E';
  };

  const handleSaveMarks = async () => {
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
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title"><FileText size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Examinations & Results</h1>
          <p className="page-subtitle">Enter student marks, grade automatically, and generate beautiful PDF report cards.</p>
        </div>
        <button className="btn-primary"><Award size={18} /> Generate Report Cards (PDF)</button>
      </div>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
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
          <input type="number" className="glass-input" defaultValue="100" />
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
                <th>Theory Marks (80)</th>
                <th>Practical Marks (20)</th>
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
                    <td><input type="number" value={theory} onChange={e => handleMarkChange(student.id!, 'theory', Number(e.target.value))} className="glass-input" style={{ width: '80px', padding: '6px' }}/></td>
                    <td><input type="number" value={prac} onChange={e => handleMarkChange(student.id!, 'practical', Number(e.target.value))} className="glass-input" style={{ width: '80px', padding: '6px' }}/></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{total}</span>
                        <span className={`badge ${total >= 33 ? 'success' : 'danger'}`}>{grade}</span>
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
          <button className="btn-secondary"><Download size={18} /> Download Excel Template</button>
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
