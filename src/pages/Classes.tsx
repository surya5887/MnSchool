import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2 } from 'lucide-react';
import { getClasses, addClass, deleteClass, type ClassData } from '../services/classService';
import Modal from '../components/Modal';

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClassModalOpen, setClassModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newClassData, setNewClassData] = useState({
    className: '',
    sections: '',
    subjects: '',
    classTeacher: '',
    feeName: 'Monthly Tuition',
    feeAmount: ''
  });

  const fetchClasses = async () => {
    try {
      const data = await getClasses();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addClass({
        className: newClassData.className,
        sections: newClassData.sections.split(',').map(s => s.trim()).filter(s => s),
        subjects: newClassData.subjects.split(',').map(s => s.trim()).filter(s => s),
        classTeacher: newClassData.classTeacher,
        fees: newClassData.feeAmount ? [{ feeName: newClassData.feeName, amount: Number(newClassData.feeAmount) }] : []
      });
      
      setClassModalOpen(false);
      setNewClassData({ className: '', sections: '', subjects: '', classTeacher: '', feeName: 'Monthly Tuition', feeAmount: '' });
      setSaved(true);
      fetchClasses();
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error adding class", error);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this class? This will not automatically delete its students.")) {
      try {
        await deleteClass(id);
        fetchClasses();
      } catch (error) {
        console.error("Error deleting class", error);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Classes & Sections</h1>
          <p className="page-subtitle">Manage school classes, sections, assigned teachers, and base fees.</p>
        </div>
        <button className="btn-primary" onClick={() => setClassModalOpen(true)}>
          <Plus size={20} /> Add New Class
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="glass-table-container">
          <table>
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Sections</th>
                <th>Subjects Assigned</th>
                <th>Base Fee</th>
                <th>Class Teacher</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>Loading classes...</td></tr>
              ) : classes.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No classes found. Add a class to get started.</td></tr>
              ) : classes.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.className}</td>
                  <td>{c.sections.join(', ')}</td>
                  <td>{c.subjects.join(', ')}</td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                    {c.fees && c.fees.length > 0 ? c.fees.map(f => `${f.feeName}: ₹${f.amount}`).join(', ') : 'Not Set'}
                  </td>
                  <td>{c.classTeacher}</td>
                  <td>
                    <button onClick={() => c.id && handleDeleteClass(c.id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isClassModalOpen} onClose={() => setClassModalOpen(false)} title="Add New Class">
        <form onSubmit={handleSaveClass} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Class Name</label>
            <input required type="text" className="glass-input" value={newClassData.className} onChange={e => setNewClassData({...newClassData, className: e.target.value})} placeholder="e.g. Class 10" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Sections (comma-separated)</label>
            <input required type="text" className="glass-input" value={newClassData.sections} onChange={e => setNewClassData({...newClassData, sections: e.target.value})} placeholder="e.g. A, B, C" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Subjects (comma-separated)</label>
            <input type="text" className="glass-input" value={newClassData.subjects} onChange={e => setNewClassData({...newClassData, subjects: e.target.value})} placeholder="e.g. English, Math, Science" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Class Teacher</label>
            <input type="text" className="glass-input" value={newClassData.classTeacher} onChange={e => setNewClassData({...newClassData, classTeacher: e.target.value})} placeholder="e.g. Mr. Sharma" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Base Fee Name</label>
              <input required type="text" className="glass-input" value={newClassData.feeName} onChange={e => setNewClassData({...newClassData, feeName: e.target.value})} placeholder="e.g. Monthly Tuition" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Amount (₹)</label>
              <input required type="number" className="glass-input" value={newClassData.feeAmount} onChange={e => setNewClassData({...newClassData, feeAmount: e.target.value})} placeholder="e.g. 2500" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => setClassModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Class</button>
          </div>
        </form>
      </Modal>

      <AnimatePresence>
        {saved && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed', bottom: '40px', right: '40px', background: 'var(--success)', color: 'white',
              padding: '16px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px',
              fontWeight: 600, zIndex: 1000
            }}
          >
            <Check size={24} /> Class saved successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Classes;
