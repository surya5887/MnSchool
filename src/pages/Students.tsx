import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Filter, MoreVertical } from 'lucide-react';
import { students } from '../data/mockData';

const Students: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Students Directory</h1>
          <p className="page-subtitle">Manage all enrolled students, their details, and status.</p>
        </div>
        <button className="btn-primary">
          <Plus size={20} /> Add New Student
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              className="glass-input" 
              style={{ paddingLeft: '48px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-secondary">
            <Filter size={18} /> Filters
          </button>
        </div>

        {/* Table */}
        <div className="glass-table-container">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Class</th>
                <th>Roll No.</th>
                <th>Status</th>
                <th>Fee Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={student.id}
                >
                  <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{student.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={`https://ui-avatars.com/api/?name=${student.name}&background=random`} alt={student.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                      {student.name}
                    </div>
                  </td>
                  <td>{student.class}</td>
                  <td>{student.roll}</td>
                  <td>
                    <span className={`badge ${student.status === 'Active' ? 'success' : 'danger'}`}>
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${student.feeStatus === 'Paid' ? 'success' : 'warning'}`}>
                      {student.feeStatus}
                    </span>
                  </td>
                  <td>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </motion.tr>
              ))}
              
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No students found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination mock */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <span>Showing 1 to {filteredStudents.length} of {students.length} entries</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" style={{ padding: '6px 12px' }}>Previous</button>
            <button className="btn-secondary" style={{ padding: '6px 12px', background: 'var(--primary-color)', color: 'white', border: 'none' }}>1</button>
            <button className="btn-secondary" style={{ padding: '6px 12px' }}>Next</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Students;
