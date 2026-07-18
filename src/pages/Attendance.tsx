import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Save, Search, Download } from 'lucide-react';
import { students } from '../data/mockData';

const Attendance: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('10A');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // By default, everyone is present. We only track absentees.
  const [absentees, setAbsentees] = useState<string[]>([]);

  const toggleAttendance = (id: string) => {
    if (absentees.includes(id)) {
      setAbsentees(absentees.filter(a => a !== id)); // Mark Present
    } else {
      setAbsentees([...absentees, id]); // Mark Absent
    }
  };

  const activeStudents = students.filter(s => s.status === 'Active');

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
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Select Class & Section</label>
          <select className="glass-input" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="10A">Class 10 - Section A</option>
            <option value="10B">Class 10 - Section B</option>
            <option value="9A">Class 9 - Section A</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Date</label>
          <input type="date" className="glass-input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="search-bar" style={{ margin: 0, flex: 2 }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search student name..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }} />
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
                const isAbsent = absentees.includes(student.id);
                return (
                  <tr key={student.id} style={{ background: isAbsent ? 'rgba(239, 68, 68, 0.05)' : 'transparent', transition: '0.2s' }}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{student.roll}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={`https://ui-avatars.com/api/?name=${student.name}&background=random&size=40`} alt={student.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{student.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Father: {student.parentPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div 
                        onClick={() => toggleAttendance(student.id)}
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
