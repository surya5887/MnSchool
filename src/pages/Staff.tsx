import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, UserPlus } from 'lucide-react';
import { teachers } from '../data/mockData';
import Modal from '../components/Modal';

const Staff: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  const handlePaySalary = (teacher: any) => {
    setSelectedTeacher(teacher);
    setModalOpen(true);
  };

  const confirmPayment = () => {
    setModalOpen(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Staff & Payroll</h1>
          <p className="page-subtitle">Manage teaching staff and process salaries with one click.</p>
        </div>
        <button className="btn-primary">
          <UserPlus size={20} /> Add Staff
        </button>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="glass-table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Staff Name</th>
                <th>Subject</th>
                <th>Experience</th>
                <th>Salary Status (Oct)</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher, idx) => (
                <motion.tr 
                  key={teacher.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <td style={{ fontWeight: 600 }}>{teacher.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={`https://ui-avatars.com/api/?name=${teacher.name}&background=random`} alt={teacher.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                      <span style={{ fontWeight: 500 }}>{teacher.name}</span>
                    </div>
                  </td>
                  <td>{teacher.subject}</td>
                  <td>{teacher.experience}</td>
                  <td>
                    <span className={`badge ${teacher.salaryStatus === 'Paid' ? 'success' : 'danger'}`}>
                      {teacher.salaryStatus}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {teacher.salaryStatus === 'Pending' ? (
                      <button onClick={() => handlePaySalary(teacher)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                        Mark Paid
                      </button>
                    ) : (
                      <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', opacity: 0.5 }} disabled>
                        Done
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Process Salary Payment">
        {selectedTeacher && (
          <div>
            <p>You are about to process salary for <strong>{selectedTeacher.name}</strong>.</p>
            <div style={{ background: 'rgba(99,102,241,0.1)', padding: '16px', borderRadius: '12px', margin: '20px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Base Salary</span>
                <span style={{ fontWeight: 600 }}>₹35,000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Deductions (Leaves)</span>
                <span style={{ fontWeight: 600, color: 'var(--danger)' }}>- ₹1,500</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '8px', marginTop: '8px' }}>
                <span style={{ fontWeight: 600 }}>Total Payable</span>
                <span style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '1.2rem' }}>₹33,500</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={confirmPayment}>Confirm & Pay</button>
            </div>
          </div>
        )}
      </Modal>

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
            <Check size={24} /> Salary processed successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Staff;
