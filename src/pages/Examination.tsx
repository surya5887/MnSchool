import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save, Download, Award, CheckCircle } from 'lucide-react';

const Examination: React.FC = () => {
  const [examType, setExamType] = useState('Half Yearly');
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title"><FileText size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Examinations & Results</h1>
          <p className="page-subtitle">Enter student marks, grade automatically, and generate beautiful PDF report cards.</p>
        </div>
        <button className="btn-primary"><Award size={18} /> Generate Report Cards (PDF)</button>
      </div>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Class & Section</label>
          <select className="glass-input">
            <option>Class 10 - Section A</option>
            <option>Class 9 - Section A</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Subject</label>
          <select className="glass-input">
            <option>Mathematics</option>
            <option>Science</option>
            <option>English</option>
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
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Marks Entry: Mathematics ({examType})</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>24 Students in Class 10A</span>
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
              {[
                { roll: '101', name: 'Aarav Sharma', theory: 72, prac: 18, total: 90, grade: 'A1' },
                { roll: '102', name: 'Diya Patel', theory: 65, prac: 19, total: 84, grade: 'A2' },
                { roll: '103', name: 'Rahul Verma', theory: 45, prac: 15, total: 60, grade: 'C1' },
                { roll: '104', name: 'Sneha Singh', theory: 78, prac: 20, total: 98, grade: 'A1' },
              ].map(student => (
                <tr key={student.roll}>
                  <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{student.roll}</td>
                  <td style={{ fontWeight: 500 }}>{student.name}</td>
                  <td><input type="number" defaultValue={student.theory} className="glass-input" style={{ width: '80px', padding: '6px' }}/></td>
                  <td><input type="number" defaultValue={student.prac} className="glass-input" style={{ width: '80px', padding: '6px' }}/></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{student.total}</span>
                      <span className={`badge success`}>{student.grade}</span>
                    </div>
                  </td>
                  <td><button className="btn-secondary" style={{ padding: '6px 12px' }}><CheckCircle size={14} /> Saved</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button className="btn-secondary"><Download size={18} /> Download Excel Template</button>
          <button className="btn-primary" style={{ padding: '10px 32px' }}><Save size={18} /> Save All Marks</button>
        </div>
      </div>
    </motion.div>
  );
};

export default Examination;
