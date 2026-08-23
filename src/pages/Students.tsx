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
  
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
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
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
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
    
    if (studentToDelete) {
      try {
        await deleteStudent(studentToDelete);
        setDeleteModalOpen(false);
        setStudentToDelete(null);
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
    });
  }, [students, searchTerm, selectedClass, selectedSection, role, authUser.assignedClass]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Students Directory</h1>
          <p className="page-subtitle">View and manage all registered students across the school.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {role === 'Principal' && (
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
        <div style={{ display: 'flex', gap: '16px', padding: '24px', borderBottom: '1px solid var(--glass-border)', flexWrap: 'wrap' }}>
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

        <div className="glass-table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Adm No</th>
                <th>Full Name</th>
                <th>Class / Sec</th>
                <th>Roll No.</th>
                <th>Status</th>
                {role === 'Principal' && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr>
                   <td colSpan={role === 'Principal' ? 6 : 5} style={{ textAlign: 'center', padding: '40px' }}>Loading students...</td>
                 </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={role === 'Principal' ? 6 : 5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : filteredStudents.map((student, index) => (
                <motion.tr 
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td style={{ fontWeight: 600 }}>{student.admissionNo || '-'}</td>
                  <td>
                    {role === 'Principal' ? (
                      <Link to={`/student/${student.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={`https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=random`} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                          <span style={{ fontWeight: 500, color: 'var(--primary)' }}>{student.firstName} {student.lastName}</span>
                        </div>
                      </Link>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={`https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=random`} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                        <span style={{ fontWeight: 500 }}>{student.firstName} {student.lastName}</span>
                      </div>
                    )}
                  </td>
                  <td>{student.classId} - {student.sectionId}</td>
                  <td>{student.rollNumber || '-'}</td>
                  <td>
                    <span className={`badge ${student.status === 'Active' ? 'success' : 'danger'}`}>
                      {student.status || 'Active'}
                    </span>
                  </td>
                  {role === 'Principal' && (
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link to={`/student/${student.id}`} className="icon-btn" style={{ color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
                          <Eye size={18} />
                        </Link>
                        <button className="icon-btn" onClick={() => { setStudentToDelete(student.id || null); setDeleteModalOpen(true); }} style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
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
      <Modal isOpen={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setDeleteError(''); }} title="Delete Student Record">
        <form onSubmit={handleSecureDelete} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="alert-warning" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
            Warning: This action will permanently remove the student and all associated records (fees, attendance) from the system.
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
