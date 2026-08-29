import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, Edit2, Users, BookOpen, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getClasses, type ClassData, getSequenceIndex, addClass, updateClass, deleteClass } from '../services/classService';
import { getStaff, type StaffData } from '../services/staffService';
import { getStudents, type StudentData } from '../services/studentService';
import Modal from '../components/Modal';

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClassModalOpen, setClassModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<StaffData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);

  const [newClassData, setNewClassData] = useState({
    className: '',
    sections: '',
    subjects: '',
    classTeacher: '',
    feeName: 'Monthly Tuition',
    feeAmount: '',
    monthlyBaseFee: 1000
  });

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [classData, staffData, studentData] = await Promise.all([
          getClasses(),
          getStaff(),
          getStudents()
        ]);
        setClasses(classData);
        setStaffList(staffData);
        setStudents(studentData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      feeAmount: c.fees && c.fees.length > 0 ? c.fees[0].amount.toString() : '',
      monthlyBaseFee: c.monthlyBaseFee || 1000
    });
    setClassModalOpen(true);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        className: newClassData.className,
        order: classes.length + 1,
        sections: newClassData.sections.split(',').map(s => s.trim()).filter(s => s),
        subjects: newClassData.subjects.split(',').map(s => s.trim()).filter(s => s),
        classTeacher: newClassData.classTeacher,
        monthlyBaseFee: Number(newClassData.monthlyBaseFee) || 1000,
        fees: newClassData.feeAmount ? [{ feeName: newClassData.feeName, amount: Number(newClassData.feeAmount) }] : []
      };

      if (editingClassId) {
        await updateClass(editingClassId, dataToSave);
      } else {
        await addClass(dataToSave);
      }
      
      setClassModalOpen(false);
      setNewClassData({ className: '', sections: '', subjects: '', classTeacher: '', feeName: 'Monthly Tuition', feeAmount: '', monthlyBaseFee: 1000 });
      setEditingClassId(null);
      setSaved(true);
      fetchData();
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
        fetchData();
      } catch (error) {
        console.error("Error deleting class", error);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex-responsive" style={{ marginBottom: '32px' }}>
          <div>
            <h1 className="page-title">Classes & Sections</h1>
            <p className="page-subtitle">Manage school classes, sections, assigned teachers, and base fees.</p>
          </div>
          <button className="btn-primary" onClick={() => {
            setEditingClassId(null);
            setNewClassData({ className: '', sections: '', subjects: '', classTeacher: '', feeName: 'Monthly Tuition', feeAmount: '', monthlyBaseFee: 1000 });
            setClassModalOpen(true);
          }}>
            <Plus size={20} /> Add New Class
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading classes...</div>
          ) : sortedClasses.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No classes found. Add a class to get started.</div>
          ) : (
            sortedClasses.flatMap((c, classIndex) => {
              const COLOR_THEMES = [
                { gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', bg: 'rgba(99, 102, 241, 0.1)', text: '#6366f1' },
                { gradient: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)', bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
                { gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', bg: 'rgba(245, 158, 11, 0.1)', text: '#d97706' },
                { gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', bg: 'rgba(236, 72, 153, 0.1)', text: '#db2777' },
                { gradient: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', bg: 'rgba(16, 185, 129, 0.1)', text: '#059669' },
              ];
              const theme = COLOR_THEMES[classIndex % COLOR_THEMES.length];
              const baseFee = c.fees && c.fees.length > 0 ? c.fees[0].amount : (c.monthlyBaseFee || 0);

              // Ensure there's at least one section to map over, fallback to 'A' if empty
              const sections = c.sections && c.sections.length > 0 ? c.sections : ['A'];
              return sections.map(section => {
                const studentCount = students.filter(s => s.classId === c.className && s.sectionId === section).length;
                return (
                  <motion.div
                    key={`${c.id}-${section}`}
                    whileHover={{ scale: 1.02, translateY: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/classes/${c.id}`)}
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      cursor: 'pointer',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      background: 'rgba(255, 255, 255, 0.7)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                      border: '1px solid rgba(255,255,255,0.6)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {/* Beautiful Gradient Header */}
                    <div style={{ background: theme.gradient, padding: '24px', color: 'white', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '4px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Section {section}</div>
                          <h2 style={{ fontSize: '2.2rem', margin: 0, fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{c.className}</h2>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenEdit(e, c); }}
                            style={{ color: 'white', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', backdropFilter: 'blur(4px)' }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); c.id && handleDeleteClass(e, c.id); }}
                            style={{ color: 'white', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', backdropFilter: 'blur(4px)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                      
                      {/* Subjects */}
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                          <BookOpen size={14} /> Subjects
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {c.subjects && c.subjects.length > 0 ? c.subjects.map((sub, i) => (
                            <span key={i} style={{ background: theme.bg, color: theme.text, padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>{sub}</span>
                          )) : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No subjects added</span>}
                        </div>
                      </div>

                      <div style={{ flex: 1 }}></div>

                      {/* Stats Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '16px' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>Base Fee</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>₹{baseFee}</div>
                        </div>
                        <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '16px' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>Students</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Users size={16} color={theme.text} /> {studentCount}
                          </div>
                        </div>

                        {/* Teacher */}
                        <div style={{ gridColumn: '1 / -1', background: theme.bg, padding: '12px 16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: theme.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                            <User size={16} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.7rem', color: theme.text, fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>Class Teacher</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {c.classTeacher || 'Not Assigned'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              });
            })
          )}
        </div>

        <Modal isOpen={isClassModalOpen} onClose={() => setClassModalOpen(false)} title={editingClassId ? "Edit Class" : "Add New Class"}>
        <form onSubmit={handleSaveClass} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Class Name</label>
            <input required type="text" className="glass-input" value={newClassData.className} onChange={e => setNewClassData({...newClassData, className: e.target.value})} placeholder="e.g. 10th" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Monthly Base Fee (₹)</label>
            <input required type="number" className="glass-input" value={newClassData.monthlyBaseFee} onChange={e => setNewClassData({...newClassData, monthlyBaseFee: Number(e.target.value)})} placeholder="e.g. 1500" />
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
            <select 
              className="glass-input" 
              value={newClassData.classTeacher} 
              onChange={e => setNewClassData({...newClassData, classTeacher: e.target.value})}
            >
              <option value="">Select a Teacher</option>
              {staffList.map(staff => (
                <option key={staff.id} value={staff.name}>{staff.name}</option>
              ))}
            </select>
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
