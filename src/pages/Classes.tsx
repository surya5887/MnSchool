import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, Edit2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getClasses, addClass, updateClass, deleteClass, type ClassData } from '../services/classService';
import { addStaff, getStaff } from '../services/staffService';
import Modal from '../components/Modal';

// Logical ordering for classes
const CLASS_ORDER = [
  "Play", "Nursery", "L.K.G.", "U.K.G.", 
  "1st", "2nd", "3rd", "4th", "5th", "6th", 
  "7th", "8th", "9th", "10th", "11th", "12th"
];

const getSequenceIndex = (className: string) => {
  const index = CLASS_ORDER.indexOf(className);
  return index === -1 ? 999 : index; // Unknown classes go to the bottom
};

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClassModalOpen, setClassModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  
  const [newClassData, setNewClassData] = useState({
    className: '',
    sections: '',
    subjects: '',
    classTeacher: '',
    feeName: 'Monthly Tuition',
    feeAmount: ''
  });

  const navigate = useNavigate();

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

  const sortedClasses = useMemo(() => {
    return [...classes].sort((a, b) => {
      const classDiff = getSequenceIndex(a.className) - getSequenceIndex(b.className);
      if (classDiff !== 0) return classDiff;
      // If class names are the same, sort by the first section name
      const sectionA = a.sections && a.sections.length > 0 ? a.sections[0] : '';
      const sectionB = b.sections && b.sections.length > 0 ? b.sections[0] : '';
      return sectionA.localeCompare(sectionB);
    });
  }, [classes]);

  const handleOpenEdit = (e: React.MouseEvent, c: ClassData) => {
    e.stopPropagation(); // Prevent row click
    setEditingClassId(c.id || null);
    setNewClassData({
      className: c.className,
      sections: c.sections.join(', '),
      subjects: c.subjects.join(', '),
      classTeacher: c.classTeacher,
      feeName: c.fees && c.fees.length > 0 ? c.fees[0].feeName : 'Monthly Tuition',
      feeAmount: c.fees && c.fees.length > 0 ? c.fees[0].amount.toString() : ''
    });
    setClassModalOpen(true);
  };

  const syncTeacherToStaff = async (teacherName: string, subject: string) => {
    if (!teacherName) return;
    try {
      const allStaff = await getStaff();
      const exists = allStaff.some(s => s.name.toLowerCase() === teacherName.toLowerCase());
      if (!exists) {
        await addStaff({
          name: teacherName,
          role: 'Teacher',
          department: 'Academic',
          joinDate: new Date().toISOString(),
          salary: 35000,
          status: 'Active',
          subject: subject || 'General',
          experience: '0 years',
          salaryStatus: 'Pending'
        });
      }
    } catch (error) {
      console.error("Error syncing teacher to staff", error);
    }
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const classDataToSave = {
        className: newClassData.className,
        sections: newClassData.sections.split(',').map(s => s.trim()).filter(s => s),
        subjects: newClassData.subjects.split(',').map(s => s.trim()).filter(s => s),
        classTeacher: newClassData.classTeacher,
        fees: newClassData.feeAmount ? [{ feeName: newClassData.feeName, amount: Number(newClassData.feeAmount) }] : []
      };

      if (editingClassId) {
        await updateClass(editingClassId, classDataToSave);
      } else {
        await addClass(classDataToSave);
      }
      
      // Auto-sync teacher to staff
      if (newClassData.classTeacher) {
        await syncTeacherToStaff(newClassData.classTeacher, newClassData.subjects.split(',')[0] || 'General');
      }

      setClassModalOpen(false);
      setNewClassData({ className: '', sections: '', subjects: '', classTeacher: '', feeName: 'Monthly Tuition', feeAmount: '' });
      setEditingClassId(null);
      setSaved(true);
      fetchClasses();
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving class", error);
    }
  };

  const handleDeleteClass = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent row click
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
        <button className="btn-primary" onClick={() => {
          setEditingClassId(null);
          setNewClassData({ className: '', sections: '', subjects: '', classTeacher: '', feeName: 'Monthly Tuition', feeAmount: '' });
          setClassModalOpen(true);
        }}>
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
              ) : sortedClasses.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No classes found. Add a class to get started.</td></tr>
              ) : sortedClasses.map(c => (
                <tr 
                  key={c.id} 
                  onClick={() => navigate(`/classes/${c.id}`)}
                  style={{ cursor: 'pointer' }}
                  className="clickable-row"
                >
                  <td style={{ fontWeight: 600 }}>{c.className}</td>
                  <td>{c.sections.join(', ')}</td>
                  <td>{c.subjects.join(', ')}</td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                    {c.fees && c.fees.length > 0 ? c.fees.map(f => `${f.feeName}: ₹${f.amount}`).join(', ') : 'Not Set'}
                  </td>
                  <td>{c.classTeacher}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={(e) => handleOpenEdit(e, c)} style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Edit2 size={18} />
                      </button>
                      <button onClick={(e) => c.id && handleDeleteClass(e, c.id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                      <button onClick={() => navigate(`/classes/${c.id}`)} style={{ color: 'var(--text-main)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isClassModalOpen} onClose={() => setClassModalOpen(false)} title={editingClassId ? "Edit Class" : "Add New Class"}>
        <form onSubmit={handleSaveClass} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Class Name</label>
            <input required type="text" className="glass-input" value={newClassData.className} onChange={e => setNewClassData({...newClassData, className: e.target.value})} placeholder="e.g. 10th" />
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
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>* Adding a teacher here will auto-sync them to the Staff directory.</span>
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
            <button type="submit" className="btn-primary">{editingClassId ? "Update Class" : "Save Class"}</button>
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
            <Check size={24} /> Class {editingClassId ? 'updated' : 'saved'} successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .clickable-row:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </motion.div>
  );
};

export default Classes;
