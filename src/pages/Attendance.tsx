import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Save, Search, Download, CheckCircle, XCircle, Circle } from 'lucide-react';
import { getStudents, type StudentData } from '../services/studentService';
import { getClasses, type ClassData, getSequenceIndex } from '../services/classService';
import { getAttendance, saveAttendance, type AttendanceStatus } from '../services/attendanceService';

const Attendance: React.FC = () => {
  const authUser = JSON.parse(sessionStorage.getItem('authUser') || localStorage.getItem('authUser') || '{}');
  const role = authUser.role || '';
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [students, setStudents] = useState<StudentData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  

  // Map of studentId -> AttendanceStatus ('Present' | 'Absent' | 'Unmarked')
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const uniqueClasses = useMemo(() => {
    const list: { className: string; sections: string[] }[] = [];
    classes.forEach(c => {
      let existing = list.find(x => x.className === c.className);
      if (!existing) {
        existing = { className: c.className, sections: [] };
        list.push(existing);
      }
      c.sections.forEach(s => {
        if (!existing?.sections.includes(s)) existing?.sections.push(s);
      });
    });
    return list.sort((a, b) => getSequenceIndex(a.className) - getSequenceIndex(b.className));
  }, [classes]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [studentData, classData] = await Promise.all([
          getStudents(),
          getClasses()
        ]);
        setStudents(studentData);
        setClasses(classData);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (uniqueClasses.length > 0 && !selectedClass) {
      if (role === 'Teacher') {
        setSelectedClass(authUser.assignedClass || '');
        setSelectedSection(authUser.assignedSection || '');
      } else {
        const defaultClass = uniqueClasses[0].className;
        setSelectedClass(defaultClass);
        const matchedClass = uniqueClasses.find(c => c.className === defaultClass);
        setSelectedSection(matchedClass?.sections[0] || '');
      }
    }
  }, [uniqueClasses, selectedClass]);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!selectedClass || !selectedSection || !date) return;
      
      const activeSession = localStorage.getItem('activeSession') || '2026-2027';
      try {
        const record = await getAttendance(date, selectedClass, selectedSection, activeSession);
        if (record && record.records) {
          setAttendance(record.records);
        } else {
          setAttendance({}); // Reset if no data found
        }
      } catch (error) {
        console.error("Error fetching attendance record", error);
      } finally {
        
      }
    };
    fetchAttendanceData();
  }, [selectedClass, selectedSection, date]);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedClass(val);
    const matchedClass = uniqueClasses.find(c => c.className === val);
    setSelectedSection(matchedClass?.sections[0] || '');
  };

  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    const newAttendance = { ...attendance, [studentId]: status };
    setAttendance(newAttendance);
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveAttendanceToDB(newAttendance);
    }, 1000);
  };

  const saveAttendanceToDB = async (recordsToSave: Record<string, AttendanceStatus>) => {
    if (!selectedClass || !selectedSection || !date) return;
    setSaving(true);
    const activeSession = localStorage.getItem('activeSession') || '2026-2027';
    try {
      await saveAttendance({
        date,
        classId: selectedClass,
        sectionId: selectedSection,
        session: activeSession,
        records: recordsToSave
      });
    } catch (error) {
      console.error("Failed to save attendance:", error);
    } finally {
      setSaving(false);
    }
  };

  const activeStudents = useMemo(() => {
    return students.filter(s => {
      const matchStatus = s.status === 'Active' || !s.status;
      const matchClass = s.classId === selectedClass;
      const matchSection = (!selectedSection || s.sectionId === selectedSection);
      const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
      const matchSearch = fullName.includes(searchQuery.toLowerCase().trim());
      return matchStatus && matchClass && matchSection && matchSearch;
    }).sort((a, b) => {
      const rollA = Number(a.rollNumber) || 0;
      const rollB = Number(b.rollNumber) || 0;
      return rollA - rollB;
    });
  }, [students, selectedClass, selectedSection, searchQuery]);

  const presentCount = activeStudents.filter(s => s.id && attendance[s.id] === 'Present').length;
  const absentCount = activeStudents.filter(s => s.id && attendance[s.id] === 'Absent').length;
  const unmarkedCount = activeStudents.length - presentCount - absentCount;

  if (role === 'Student') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex-responsive" style={{ marginBottom: "32px" }}>
          <div>
            <h1 className="page-title"><CalendarCheck size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> My Attendance</h1>
            <p className="page-subtitle">View your daily attendance history.</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Attendance history is currently being compiled. Please contact your class teacher for detailed reports.
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex-responsive" style={{ marginBottom: "32px" }}>
        <div>
          <h1 className="page-title"><CalendarCheck size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Smart Attendance System</h1>
          <p className="page-subtitle">Mark daily attendance. Auto-saves to database instantly.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {saving && <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Saving...</span>}
          <button className="btn-secondary">
            <Download size={18} /> Export Monthly Report
          </button>
        </div>
      </div>

      
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div className="dashboard-grid">
          {role === 'Teacher' ? (
              <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '16px 24px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 6px rgba(16,185,129,0.2)' }}>
                <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, marginBottom: '4px', fontWeight: 600 }}>Marking Attendance For</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{authUser.assignedClass || 'No Class'} {authUser.assignedSection ? `- Section ${authUser.assignedSection}` : ''}</div>
              </div>
            ) : (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Select Class</label>
                  <select className="glass-input" style={{ width: '100%' }} value={selectedClass} onChange={handleClassChange}>
                     {uniqueClasses.map(c => <option key={c.className} value={c.className}>{c.className}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Section</label>
                  <select className="glass-input" style={{ width: '100%' }} value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
                     {uniqueClasses.find(c => c.className === selectedClass)?.sections.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </>
            )}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Date</label>
            <input type="date" className="glass-input" style={{ width: '100%' }} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Search Student</label>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '42px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search name..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="glass-input"
              style={{ paddingLeft: '44px', width: '100%' }} 
            />
          </div>
        </div>
      </div>

            {activeStudents.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '24px' }}>
          No students found for the selected class/section.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {activeStudents.map(student => {
            if (!student.id) return null;
            const status = attendance[student.id] || 'Unmarked';
            
            return (
              <div key={student.id} className="glass-panel" style={{ 
                padding: '20px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px',
                borderLeft: `6px solid ${status === 'Present' ? 'var(--success)' : status === 'Absent' ? 'var(--danger)' : 'var(--text-muted)'}`
              }}>
                 {/* Top row: Profile */}
                 <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img src={student.photoUrl || `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=random&size=50`} alt={student.firstName} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--glass-border)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.firstName} {student.lastName}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Roll No: {student.rollNumber || '-'} | Father: {student.parentName || 'N/A'}</div>
                    </div>
                 </div>
                 
                 {/* Bottom row: Action Buttons */}
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    <button 
                      onClick={() => setStudentStatus(student.id, 'Unmarked')} 
                      style={{ 
                        padding: '12px 4px', 
                        borderRadius: '12px', 
                        border: `1px solid ${status === 'Unmarked' ? 'transparent' : 'var(--glass-border)'}`, 
                        background: status === 'Unmarked' ? 'var(--text-muted)' : 'var(--glass-bg)', 
                        color: status === 'Unmarked' ? 'white' : 'var(--text-color)', 
                        fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: '0.2s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                      }}>
                      <Circle size={16} /> Unmarked
                    </button>
                    
                    <button 
                      onClick={() => setStudentStatus(student.id, 'Present')} 
                      style={{ 
                        padding: '12px 4px', 
                        borderRadius: '12px', 
                        border: `1px solid ${status === 'Present' ? 'transparent' : 'var(--glass-border)'}`, 
                        background: status === 'Present' ? 'var(--success)' : 'var(--glass-bg)', 
                        color: status === 'Present' ? 'white' : 'var(--success)', 
                        fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: '0.2s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                      }}>
                      <CheckCircle size={16} /> Present
                    </button>
                    
                    <button 
                      onClick={() => setStudentStatus(student.id, 'Absent')} 
                      style={{ 
                        padding: '12px 4px', 
                        borderRadius: '12px', 
                        border: `1px solid ${status === 'Absent' ? 'transparent' : 'var(--glass-border)'}`, 
                        background: status === 'Absent' ? 'var(--danger)' : 'var(--glass-bg)', 
                        color: status === 'Absent' ? 'white' : 'var(--danger)', 
                        fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: '0.2s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                      }}>
                      <XCircle size={16} /> Absent
                    </button>
                 </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="glass-panel" style={{ padding: '24px', borderTop: '4px solid var(--primary)' }}>
        <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-main)', fontSize: '1.2rem' }}>Attendance Summary</h3>
        <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div style={{ fontSize: '0.85rem', color: '#6366f1', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Total Students</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6366f1' }}>{activeStudents.length}</div>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ fontSize: '0.85rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Present</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{presentCount}</div>
          </div>
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div style={{ fontSize: '0.85rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Absent</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>{absentCount}</div>
          </div>
          <div style={{ background: 'rgba(107, 114, 128, 0.08)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(107,114,128,0.2)' }}>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Unmarked</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6b7280' }}>{unmarkedCount}</div>
          </div>
        </div>
        
        <button className="btn-primary" style={{ padding: '16px', width: '100%', justifyContent: 'center', fontSize: '1.1rem' }} onClick={() => saveAttendanceToDB(attendance)} disabled={saving}>
          <Save size={20} /> {saving ? 'Saving...' : 'Submit & Save Attendance'}
        </button>
      </div>
    </motion.div>

  );
};

export default Attendance;



