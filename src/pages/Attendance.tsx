import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Save, Search, Download } from 'lucide-react';
import { getStudents, type StudentData } from '../services/studentService';
import { getClasses, type ClassData, getSequenceIndex } from '../services/classService';

const Attendance: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [students, setStudents] = useState<StudentData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  // By default, everyone is present. We only track absentees.
  const [absentees, setAbsentees] = useState<string[]>([]);

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
    const fetchData = async () => {
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
    fetchData();
  }, []);

  // Update initial selected class/section when uniqueClasses changes
  useEffect(() => {
    if (uniqueClasses.length > 0 && !selectedClass) {
      setSelectedClass(uniqueClasses[0].className);
      setSelectedSection(uniqueClasses[0].sections[0] || '');
    }
  }, [uniqueClasses, selectedClass]);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedClass(val);
    const matchedClass = uniqueClasses.find(c => c.className === val);
    setSelectedSection(matchedClass?.sections[0] || '');
  };

  const toggleAttendance = (id: string) => {
    if (absentees.includes(id)) {
      setAbsentees(absentees.filter(a => a !== id)); // Mark Present
    } else {
      setAbsentees([...absentees, id]); // Mark Absent
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title"><CalendarCheck size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Smart Attendance System</h1>
          <p className="page-subtitle">Mark daily attendance or integrate with biometric devices (ZK Teco).</p>
        </div>
        <button className="btn-secondary">
          <Download size={18} /> Export Monthly Report
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '24px', display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Select Class</label>
          <select className="glass-input" value={selectedClass} onChange={handleClassChange}>
             {uniqueClasses.map(c => <option key={c.className} value={c.className}>{c.className}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Section</label>
          <select className="glass-input" value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
             {uniqueClasses.find(c => c.className === selectedClass)?.sections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Date</label>
          <input type="date" className="glass-input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div style={{ position: 'relative', flex: 2 }}>
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
                <th>Status (Click to toggle)</th>
              </tr>
            </thead>
            <tbody>
              {activeStudents.map(student => {
                const isAbsent = student.id ? absentees.includes(student.id) : false;
                return (
                  <tr key={student.id} style={{ background: isAbsent ? 'rgba(239, 68, 68, 0.05)' : 'transparent', transition: '0.2s' }}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{student.rollNumber}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={student.photoUrl || `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=random&size=40`} alt={student.firstName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{student.firstName} {student.lastName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Father: {student.parentPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div 
                        onClick={() => student.id && toggleAttendance(student.id)}
                        style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px', 
                          background: isAbsent ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: isAbsent ? 'var(--danger)' : 'var(--success)',
                          fontWeight: 600, cursor: 'pointer', userSelect: 'none',
                          border: `1px solid ${isAbsent ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                        }}
                      >
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isAbsent ? 'var(--danger)' : 'var(--success)' }}></div>
                        {isAbsent ? 'Absent' : 'Present'}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {loading && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>Loading students...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass-bg)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div>Total Students: <strong style={{ color: 'var(--text-main)' }}>{activeStudents.length}</strong></div>
          <div>Present: <strong style={{ color: 'var(--success)' }}>{activeStudents.length - absentees.length}</strong></div>
          <div>Absent: <strong style={{ color: 'var(--danger)' }}>{absentees.length}</strong></div>
        </div>
        <button className="btn-primary" style={{ padding: '12px 32px' }}>
          <Save size={18} /> Submit Attendance
        </button>
      </div>
    </motion.div>
  );
};

export default Attendance;
