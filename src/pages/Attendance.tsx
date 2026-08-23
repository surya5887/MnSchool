import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Save, Search, Download, CheckCircle, XCircle, Circle } from 'lucide-react';
import { getStudents, type StudentData } from '../services/studentService';
import { getClasses, type ClassData, getSequenceIndex } from '../services/classService';
import { getAttendance, saveAttendance, type AttendanceStatus } from '../services/attendanceService';

const Attendance: React.FC = () => {
  const authUser = JSON.parse(sessionStorage.getItem('authUser') || localStorage.getItem('authUser') || '{}');
  const role = authUser.role || '';
  
  const [selectedClass, setSelectedClass] = useState(role === 'Teacher' ? (authUser.assignedClass || '') : '');
  const [selectedSection, setSelectedSection] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [students, setStudents] = useState<StudentData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (uniqueClasses.length > 0 && !selectedClass) {
      setSelectedClass(uniqueClasses[0].className);
      setSelectedSection(uniqueClasses[0].sections[0] || '');
    }
  }, [uniqueClasses, selectedClass]);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!selectedClass || !selectedSection || !date) return;
      setLoading(true);
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
        setLoading(false);
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
      const matchSection = s.sectionId === selectedSection;
      const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
      const matchSearch = fullName.includes(searchQuery.toLowerCase().trim());
      return matchStatus && matchClass && matchSection && matchSearch;
    });
  }, [students, selectedClass, selectedSection, searchQuery]);

  const presentCount = activeStudents.filter(s => s.id && attendance[s.id] === 'Present').length;
  const absentCount = activeStudents.filter(s => s.id && attendance[s.id] === 'Absent').length;
  const unmarkedCount = activeStudents.length - presentCount - absentCount;

  if (role === 'Student') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
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

      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '24px', display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Select Class</label>
          <select className="glass-input" value={selectedClass} onChange={handleClassChange}>
             {uniqueClasses.map(c => <option key={c.className} value={c.className}>{c.className}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '100px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Section</label>
          <select className="glass-input" value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
             {uniqueClasses.find(c => c.className === selectedClass)?.sections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Date</label>
          <input type="date" className="glass-input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div style={{ position: 'relative', flex: 2, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'transparent' }}>Search</label>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '44px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search student name..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="glass-input"
            style={{ paddingLeft: '48px', width: '100%' }} 
          />
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
        <div className="glass-table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Roll No.</th>
                <th>Student Details</th>
                <th>Mark Attendance</th>
              </tr>
            </thead>
            <tbody>
              {activeStudents.map(student => {
                if (!student.id) return null;
                const status = attendance[student.id] || 'Unmarked';
                
                return (
                  <tr key={student.id} style={{ 
                    background: status === 'Absent' ? 'rgba(239, 68, 68, 0.05)' : status === 'Present' ? 'rgba(16, 185, 129, 0.05)' : 'transparent', 
                    transition: '0.2s' 
                  }}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{student.rollNumber || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={student.photoUrl || `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=random&size=40`} alt={student.firstName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{student.firstName} {student.lastName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Father: {student.parentName || student.parentPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => setStudentStatus(student.id!, 'Unmarked')}
                          style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', 
                            background: status === 'Unmarked' ? 'var(--glass-border)' : 'transparent',
                            color: status === 'Unmarked' ? 'var(--text-main)' : 'var(--text-muted)',
                            border: `1px solid var(--glass-border)`, cursor: 'pointer', fontSize: '0.9rem'
                          }}
                        >
                          <Circle size={14} /> Unmarked
                        </button>
                        <button 
                          onClick={() => setStudentStatus(student.id!, 'Present')}
                          style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', 
                            background: status === 'Present' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                            color: status === 'Present' ? 'var(--success)' : 'var(--text-muted)',
                            border: `1px solid ${status === 'Present' ? 'rgba(16, 185, 129, 0.3)' : 'var(--glass-border)'}`, 
                            cursor: 'pointer', fontSize: '0.9rem'
                          }}
                        >
                          <CheckCircle size={14} /> Present
                        </button>
                        <button 
                          onClick={() => setStudentStatus(student.id!, 'Absent')}
                          style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', 
                            background: status === 'Absent' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                            color: status === 'Absent' ? 'var(--danger)' : 'var(--text-muted)',
                            border: `1px solid ${status === 'Absent' ? 'rgba(239, 68, 68, 0.3)' : 'var(--glass-border)'}`, 
                            cursor: 'pointer', fontSize: '0.9rem'
                          }}
                        >
                          <XCircle size={14} /> Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {loading && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td>
                </tr>
              )}
              {!loading && activeStudents.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No students found for the selected class/section.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass-bg)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div>Total Students: <strong style={{ color: 'var(--text-main)' }}>{activeStudents.length}</strong></div>
          <div>Present: <strong style={{ color: 'var(--success)' }}>{presentCount}</strong></div>
          <div>Absent: <strong style={{ color: 'var(--danger)' }}>{absentCount}</strong></div>
          <div>Unmarked: <strong style={{ color: 'var(--text-muted)' }}>{unmarkedCount}</strong></div>
        </div>
        <button className="btn-primary" style={{ padding: '12px 32px' }} onClick={() => saveAttendanceToDB(attendance)} disabled={saving}>
          <Save size={18} /> {saving ? 'Saving...' : 'Submit / Save Attendance'}
        </button>
      </div>
    </motion.div>
  );
};

export default Attendance;
