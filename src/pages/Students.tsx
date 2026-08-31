import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, Eye } from 'lucide-react';
import { getStudents, deleteStudent, type StudentData } from '../services/studentService';
import { getClasses, addClass, type ClassData, getSequenceIndex } from '../services/classService';
import Modal from '../components/Modal';

const Students: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [students, setStudents] = useState<StudentData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const authUser = JSON.parse(sessionStorage.getItem('authUser') || localStorage.getItem('authUser') || '{}');
  const role = authUser.role || '';

  // Add Class State
  const [isClassModalOpen, setClassModalOpen] = useState(false);
  const [newClassData, setNewClassData] = useState({
    className: '',
    sections: '',
    feeName: 'Monthly Tuition',
    feeAmount: ''
  });

  // Secure Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentToDelete, setStudentToDelete] = useState<string[]>([]);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassData.className || !newClassData.sections) return;
    try {
      const sectionsArray = newClassData.sections.split(',').map(s => s.trim()).filter(s => s);
      const classId = await addClass({
        className: newClassData.className,
        order: getSequenceIndex(newClassData.className),
        sections: sectionsArray,
        subjects: [],
        classTeacher: '',
        monthlyBaseFee: Number(newClassData.feeAmount) || 0,
        fees: [{ feeName: newClassData.feeName || 'Monthly Tuition', amount: Number(newClassData.feeAmount) || 0 }]
      });
      console.log('Added class with ID:', classId);
      setClassModalOpen(false);
      setNewClassData({ className: '', sections: '', feeName: 'Monthly Tuition', feeAmount: '' });
      fetchData();
    } catch (error) {
      console.error("Error adding class", error);
    }
  };

  const handleSecureDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deletePassword !== 'admin123') {
      setDeleteError('Incorrect admin password.');
      return;
    }
    
    if (studentToDelete.length > 0) {
      try {
        await Promise.all(studentToDelete.map(id => deleteStudent(id)));
        setDeleteModalOpen(false);
        setStudentToDelete([]);
        setSelectedStudents([]);
        setDeletePassword('');
        setDeleteError('');
        fetchData();
      } catch (err) {
        console.error("Error deleting student", err);
      }
    }
  };

  const sortedClasses = useMemo(() => {
    return [...classes].sort((a, b) => getSequenceIndex(a.className) - getSequenceIndex(b.className));
  }, [classes]);

  const availableSections = useMemo(() => {
    if (selectedClass === 'All') return [];
    const cls = classes.find(c => c.className === selectedClass);
    return cls ? cls.sections : [];
  }, [selectedClass, classes]);

  useEffect(() => {
    if (availableSections.length > 0 && !availableSections.includes(selectedSection) && selectedSection !== 'All') {
      setSelectedSection('All');
    }
  }, [availableSections, selectedSection]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Role Restriction
      if (role === 'Teacher' && authUser.assignedClass) {
        if (student.classId !== authUser.assignedClass) return false;
      }
      
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (student.firstName?.toLowerCase().includes(searchLower)) ||
        (student.lastName?.toLowerCase().includes(searchLower)) ||
        (student.admissionNo?.toLowerCase().includes(searchLower));
        
      const matchesClass = selectedClass === 'All' || student.classId === selectedClass;
      const matchesSection = selectedSection === 'All' || student.sectionId === selectedSection;
      
      return matchesSearch && matchesClass && matchesSection;
    }).sort((a, b) => {
      const rollA = Number(a.rollNumber) || 0;
      const rollB = Number(b.rollNumber) || 0;
      if (rollA === 0 && rollB === 0) return 0;
      if (rollA === 0) return 1;
      if (rollB === 0) return -1;
      return rollA - rollB;
    });
  }, [students, searchTerm, selectedClass, selectedSection, role, authUser.assignedClass]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex-responsive" style={{ marginBottom: "32px" }}>
        <div>
          <h1 className="page-title">Students Directory</h1>
          <p className="page-subtitle">View and manage all registered students across the school.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {['Principal', 'Manager', 'Super Admin'].includes(role) && (
            <>
              <button className="btn-secondary" onClick={() => setClassModalOpen(true)}>
                <Plus size={20} /> Add Class
              </button>
              <button className="btn-primary" onClick={() => navigate('/admission')}>
                <Plus size={20} /> New Admission
              </button>
            </>
          )}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="filter-bar" style={{ padding: "24px", borderBottom: "1px solid var(--glass-border)" }}>
          {['Principal', 'Manager', 'Super Admin'].includes(role) && selectedStudents.length > 0 && (
            <button 
              className="btn-primary" 
              style={{ background: 'var(--danger)', padding: '0 16px', height: '42px' }}
              onClick={() => {
                setStudentToDelete(selectedStudents);
                setDeleteModalOpen(true);
              }}
            >
              <Trash2 size={18} /> Delete Selected ({selectedStudents.length})
            </button>
          )}
          <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Search by name or Admission No..." 
              style={{ paddingLeft: '48px', width: '100%', margin: 0 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="glass-input" 
            style={{ width: '200px', margin: 0 }}
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="All">All Classes</option>
            {sortedClasses.map(c => (
              <option key={c.id} value={c.className}>{c.className}</option>
            ))}
          </select>

          <select 
            className="glass-input" 
            style={{ width: '150px', margin: 0 }}
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            disabled={selectedClass === 'All'}
          >
            <option value="All">All Sections</option>
            {availableSections.map(s => (
              <option key={s} value={s}>Section {s}</option>
            ))}
          </select>
        </div>

                  {/* Select All Controls for Admin */}
          {['Principal', 'Manager', 'Super Admin'].includes(role) && filteredStudents.length > 0 && (
            <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.4)' }}>
              <input 
                type="checkbox" 
                checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedStudents(filteredStudents.map(s => s.id).filter(Boolean));
                  } else {
                    setSelectedStudents([]);
                  }
                }}
                style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Select All Students</span>
              {selectedStudents.length > 0 && (
                 <span style={{ marginLeft: 'auto', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>{selectedStudents.length} selected</span>
              )}
            </div>
          )}

          <div className="students-grid" style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {loading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Loading students...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No students found matching your criteria.
              </div>
            ) : filteredStudents.map((student, index) => (
              <motion.div 
                key={student.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
                style={{ 
                  background: 'white', 
                  borderRadius: '16px', 
                  padding: '20px',
                  boxShadow: selectedStudents.includes(student.id) ? '0 0 0 2px var(--primary), 0 4px 12px rgba(37,99,235,0.1)' : '0 2px 12px rgba(0,0,0,0.04)',
                  border: '1px solid var(--glass-border)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'all 0.2s',
                  transform: selectedStudents.includes(student.id) ? 'translateY(-2px)' : 'none'
                }}
              >
                {['Principal', 'Manager', 'Super Admin'].includes(role) && (
                  <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 2 }}>
                    <input 
                      type="checkbox" 
                      checked={selectedStudents.includes(student.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents([...selectedStudents, student.id]);
                        } else {
                          setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                        }
                      }}
                      style={{ cursor: 'pointer', width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                    />
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingRight: '24px' }}>
                  <img src={`https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=random`} alt="" style={{ width: '56px', height: '56px', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <div>
                    {['Principal', 'Manager', 'Super Admin'].includes(role) ? (
                      <Link to={`/student/${student.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.2 }}>{student.firstName} {student.lastName}</h4>
                      </Link>
                    ) : (
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.2 }}>{student.firstName} {student.lastName}</h4>
                    )}
                    <span className={`badge ${student.status === 'Active' ? 'success' : 'danger'}`} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '100px' }}>
                      {student.status || 'Active'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-light)', padding: '16px', borderRadius: '12px', marginTop: '4px', border: '1px solid rgba(0,0,0,0.02)' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Class</div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>{student.classId} - {student.sectionId}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Roll No</div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>{student.rollNumber || '-'}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Admission No</div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>{student.admissionNo || '-'}</div>
                  </div>
                </div>

                {['Principal', 'Manager', 'Super Admin'].includes(role) && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '8px' }}>
                    <Link to={`/student/${student.id}`} className="btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '0.95rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', textDecoration: 'none', background: 'white', border: '1px solid var(--glass-border)' }}>
                      <Eye size={18} /> View Profile
                    </Link>
                    <button onClick={() => { if(student.id) { setStudentToDelete([student.id]); setDeleteModalOpen(true); } }} style={{ width: '42px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.08)', border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

      {/* Class Modal */}
      <Modal isOpen={isClassModalOpen} onClose={() => setClassModalOpen(false)} title="Add New Class & Sections">
        <form onSubmit={handleAddClass} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Class Name</label>
            <input required type="text" className="glass-input" value={newClassData.className} onChange={e => setNewClassData({...newClassData, className: e.target.value})} placeholder="e.g. 10th" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Sections (Comma separated)</label>
            <input required type="text" className="glass-input" value={newClassData.sections} onChange={e => setNewClassData({...newClassData, sections: e.target.value})} placeholder="e.g. A, B, C" />
          </div>
          <div style={{ background: 'rgba(255,255,255,0.3)', padding: '16px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <h4 style={{ margin: '0 0 12px 0' }}>Default Base Fee</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Fee Name</label>
                <input required type="text" className="glass-input" value={newClassData.feeName} onChange={e => setNewClassData({...newClassData, feeName: e.target.value})} placeholder="Monthly Tuition" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Amount (₹)</label>
                <input required type="number" min="0" className="glass-input" value={newClassData.feeAmount} onChange={e => setNewClassData({...newClassData, feeAmount: e.target.value})} placeholder="e.g. 1500" />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => setClassModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Add Class</button>
          </div>
        </form>
      </Modal>

      {/* Secure Delete Modal */}
      <style>{`
        @media (max-width: 768px) {
          .students-grid {
            grid-template-columns: 1fr !important;
            padding: 16px !important;
          }
        }
      `}</style>
      <Modal isOpen={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setDeleteError(''); }} title="Delete Student Record">
        <form onSubmit={handleSecureDelete} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="alert-warning" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
            Warning: This action will permanently remove the {studentToDelete.length > 1 ? `${studentToDelete.length} selected students` : "student"} and all associated records (fees, attendance) from the system.
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Admin Password</label>
            <input required type="password" className="glass-input" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="Enter admin password to confirm" />
            {deleteError && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>{deleteError}</p>}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ background: 'var(--danger)' }}>Confirm Delete</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Students;
