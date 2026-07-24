import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, UserPlus } from 'lucide-react';
import Modal from '../components/Modal';
import { getStaff, addStaff, updateStaffSalaryStatus, type StaffData } from '../services/staffService';

const Staff: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [teachers, setTeachers] = useState<StaffData[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<StaffData | null>(null);
  
  const [newStaff, setNewStaff] = useState<Partial<StaffData>>({
    name: '', subject: '', experience: '', department: 'Academic', role: 'Teacher', salary: 35000, joinDate: '', status: 'Active'
  });

  const fetchStaff = async () => {
    const data = await getStaff();
    setTeachers(data);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handlePaySalary = (teacher: StaffData) => {
    setSelectedTeacher(teacher);
    setModalOpen(true);
  };

  const confirmPayment = async () => {
    if (selectedTeacher && selectedTeacher.id) {
      await updateStaffSalaryStatus(selectedTeacher.id, 'Paid');
      setModalOpen(false);
      setSaved(true);
      fetchStaff();
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleAddStaff = async () => {
    await addStaff(newStaff as StaffData);
    setAddModalOpen(false);
    fetchStaff();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Staff & Payroll</h1>
          <p className="page-subtitle">Manage teaching staff and process salaries with one click.</p>
        </div>
        <button className="btn-primary" onClick={() => setAddModalOpen(true)}>
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
                <span style={{ fontWeight: 600 }}>₹{selectedTeacher.salary || 35000}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '8px', marginTop: '8px' }}>
                <span style={{ fontWeight: 600 }}>Total Payable</span>
                <span style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '1.2rem' }}>₹{selectedTeacher.salary || 35000}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={confirmPayment}>Confirm & Pay</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Staff">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Name</label>
            <input type="text" className="glass-input" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Subject</label>
            <input type="text" className="glass-input" value={newStaff.subject} onChange={e => setNewStaff({...newStaff, subject: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Experience</label>
            <input type="text" className="glass-input" value={newStaff.experience} onChange={e => setNewStaff({...newStaff, experience: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Salary</label>
            <input type="number" className="glass-input" value={newStaff.salary} onChange={e => setNewStaff({...newStaff, salary: Number(e.target.value)})} />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button className="btn-secondary" onClick={() => setAddModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAddStaff}>Save Staff</button>
          </div>
        </div>
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
