import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, Eye } from 'lucide-react';
import { getStudents, deleteStudent, type StudentData } from '../services/studentService';
import { getClasses, addClass, type ClassData, getSequenceIndex } from '../services/classService';
import Modal from '../components/Modal';

const Students: React.FC = () => {
  const authUser = JSON.parse(sessionStorage.getItem('authUser') || localStorage.getItem('authUser') || '{}');
  const role = authUser.role || '';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [students, setStudents] = useState<StudentData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      if (role === 'Teacher') {
          if (authUser.assignedClass && student.classId !== authUser.assignedClass) return false;
          if (authUser.assignedSection && student.sectionId !== authUser.assignedSection) return false;
        }
      
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (student.firstName?.toLowerCase().includes(searchLower)) ||
        (student.lastName?.toLowerCase().includes(searchLower)) ||
        (student.admissionNo?.toLowerCase().includes(searchLower));
        
      const matchesClass = selectedClass === 'All' || student.classId === selectedClass;
      const matchesSection = (selectedSection === 'All' || !selectedSection) || student.sectionId === selectedSection;
      
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
          
          {role === 'Teacher' ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', padding: '10px 20px', borderRadius: '12px', border: '1px solid #a5b4fc', color: '#3730a3', fontWeight: 700, boxShadow: '0 4px 6px rgba(99,102,241,0.1)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>👩‍🏫 My Class: <span style={{ background: '#3730a3', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '0.9rem' }}>{authUser.assignedClass || 'Not Assigned'}</span></span>
                {authUser.assignedSection && <span style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>Section: <span style={{ background: '#3730a3', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '0.9rem' }}>{authUser.assignedSection}</span></span>}
              </div>
            ) : (
              <>
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
              </>
            )}
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

          <div className="students-grid" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
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
                  background: 'linear-gradient(145deg, #ffffff, #f8fafc)', 
                  borderRadius: '16px', 
                  padding: '16px',
                  boxShadow: selectedStudents.includes(student.id as string) ? '0 0 0 2px var(--primary), 0 8px 20px rgba(37,99,235,0.15)' : '0 4px 12px rgba(0,0,0,0.03)',
                  border: selectedStudents.includes(student.id as string) ? '1px solid transparent' : '1px solid rgba(226, 232, 240, 0.8)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: selectedStudents.includes(student.id as string) ? 'translateY(-2px)' : 'none'
                }}
              >
                {/* Top Header Row: Avatar + Info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {['Principal', 'Manager', 'Super Admin'].includes(role) && (
                    <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 2 }}>
                      <input 
                        type="checkbox" 
                        checked={selectedStudents.includes(student.id as string)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, student.id as string]);
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                          }
                        }}
                        style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                      />
                    </div>
                  )}
                  
                  <Link to={['Principal', 'Manager', 'Super Admin'].includes(role) ? `/student/${student.id}` : '#'} style={{ textDecoration: 'none' }}>
                    <img src={`https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=random`} alt="" style={{ width: '42px', height: '42px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                  </Link>
                  
                  <div style={{ flex: 1, paddingRight: '24px', minWidth: 0 }}>
                    <Link to={['Principal', 'Manager', 'Super Admin'].includes(role) ? `/student/${student.id}` : '#'} style={{ textDecoration: 'none' }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#1e293b', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {student.firstName} {student.lastName}
                      </h4>
                    </Link>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.65rem', background: '#e0e7ff', color: '#4338ca', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {student.classId}-{student.sectionId}
                      </span>
                      <span style={{ fontSize: '0.65rem', background: student.status === 'Active' ? '#dcfce7' : '#fee2e2', color: student.status === 'Active' ? '#15803d' : '#b91c1c', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {student.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Row: Roll & Adm */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', padding: '10px 12px', borderRadius: '10px', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Roll No</div>
                      <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>{student.rollNumber || '-'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Adm No</div>
                      <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>{student.admissionNo || '-'}</div>
                    </div>
                  </div>
                  
                  {['Principal', 'Manager', 'Super Admin'].includes(role) && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Link to={`/student/${student.id}`} style={{ width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#3b82f6', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <Eye size={16} />
                      </Link>
                      <button onClick={() => { if(student.id) { setStudentToDelete([student.id]); setDeleteModalOpen(true); } }} style={{ width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
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





