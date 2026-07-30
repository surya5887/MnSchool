import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, Eye } from 'lucide-react';
import { getStudents, deleteStudent, type StudentData } from '../services/studentService';
import { getClasses, addClass, type ClassData } from '../services/classService';
import Modal from '../components/Modal';

const getStudentDisplayType = (student: StudentData): 'New' | 'Old' => {
  if (student.admissionType === 'Old') return 'Old';
  if (student.admissionType === 'New') {
    // Auto-transition: if 1 year has passed since admission, show as Old
    const admDate = student.originalAdmissionDate || student.admissionDate || student.createdAt;
    if (admDate) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      if (new Date(admDate) < oneYearAgo) return 'Old';
    }
    return 'New';
  }
  // Legacy students without admissionType â€” check date
  const admDate = student.admissionDate || student.createdAt;
  if (admDate) {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (new Date(admDate) < oneYearAgo) return 'Old';
  }
  return 'New';
};

const Students: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
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
    try {
      await addClass({
        className: newClassData.className,
        sections: newClassData.sections.split(',').map(s => s.trim()).filter(s => s),
        subjects: [], // Can be configured later in settings
        classTeacher: '',
        fees: newClassData.feeAmount ? [{ feeName: newClassData.feeName, amount: Number(newClassData.feeAmount) }] : []
      });
      setClassModalOpen(false);
      setNewClassData({ className: '', sections: '', feeName: 'Monthly Tuition', feeAmount: '' });
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Error adding class", error);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const displayType = getStudentDisplayType(s);
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase().trim();
      
      // Check if search term is "new" or "old" for type matching
      let matchSearch = false;
      if (searchLower === 'new' || searchLower === 'old') {
        matchSearch = displayType.toLowerCase() === searchLower || 
                      fullName.includes(searchLower) || 
                      (s.admissionNo?.toLowerCase().includes(searchLower) || false);
      } else {
        matchSearch = fullName.includes(searchLower) || 
                      (s.admissionNo?.toLowerCase().includes(searchLower) || false);
      }
      
      const matchClass = selectedClass === 'All' || s.classId === selectedClass;
      const matchSection = selectedSection === 'All' || s.sectionId === selectedSection;
      const matchType = selectedType === 'All' || displayType === selectedType;
      return matchSearch && matchClass && matchSection && matchType;
    });
  }, [students, searchTerm, selectedClass, selectedSection, selectedType]);

  const activeClassObj = classes.find(c => c.className === selectedClass);
  const activeSections = activeClassObj ? activeClassObj.sections : [];

  const handleDeleteRequest = (id: string) => {
    setStudentToDelete(id);
    setDeleteModalOpen(true);
    setDeletePassword('');
    setDeleteError('');
  };

  const confirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deletePassword !== 'admin123') {
      setDeleteError('Incorrect administrator password.');
      return;
    }
    
    if (studentToDelete) {
      try {
        await deleteStudent(studentToDelete);
        setStudents(students.filter(s => s.id !== studentToDelete));
        setDeleteModalOpen(false);
      } catch (err) {
        setDeleteError('Error deleting student.');
      }
    }
  };

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
        <button className="btn-primary" onClick={() => navigate('/admission')}>
          <Plus size={20} /> Add New Student
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '400px' }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by name, admission no, or type (new/old)..." 
              className="glass-input" 
              style={{ paddingLeft: '48px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select 
              className="glass-input" 
              value={selectedType} 
              onChange={e => setSelectedType(e.target.value)} 
              style={{ width: '110px' }}
            >
              <option value="All">All Types</option>
              <option value="New">ðŸ†• New</option>
              <option value="Old">ðŸ”„ Old</option>
            </select>

            <select 
              className="glass-input" 
              value={selectedClass} 
              onChange={e => { setSelectedClass(e.target.value); setSelectedSection('All'); }} 
              style={{ width: '130px' }}
            >
              <option value="All">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.className}>{c.className}</option>)}
            </select>

            {selectedClass !== 'All' && activeSections.length > 0 && (
              <select 
                className="glass-input" 
                value={selectedSection} 
                onChange={e => setSelectedSection(e.target.value)} 
                style={{ width: '120px' }}
              >
                <option value="All">All Sec</option>
                {activeSections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
              </select>
            )}

            <button className="btn-secondary" style={{ padding: '8px 12px' }} onClick={() => setClassModalOpen(true)} title="Quick Add Class">
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="glass-table-container">
          <table>
            <thead>
              <tr>
                <th>Adm No</th>
                <th>Full Name</th>
                <th>Class / Sec</th>
                <th>Roll No.</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr>
                   <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>Loading students...</td>
                 </tr>
              ) : filteredStudents.map((student, idx) => {
                const displayType = getStudentDisplayType(student);
                return (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={student.id}
                >
                  <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{student.admissionNo}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={student.photoUrl || `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=random`} alt={student.firstName} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                      <Link to={`/students/${student.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>
                        {student.firstName} {student.lastName}
                      </Link>
                    </div>
                  </td>
                  <td>{student.classId} {student.sectionId}</td>
                  <td>{student.rollNumber}</td>
                  <td>
                    <span className={`badge ${displayType === 'New' ? 'warning' : 'success'}`}>
                      {displayType === 'New' ? 'ðŸ†• New' : 'ðŸ”„ Old'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${student.status === 'Active' ? 'success' : 'danger'}`}>
                      {student.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Link to={`/students/${student.id}`} style={{ color: 'var(--primary)', cursor: 'pointer', background: 'none', border: 'none' }}>
                        <Eye size={18} />
                      </Link>
                      <button onClick={() => handleDeleteRequest(student.id!)} style={{ color: 'var(--danger)', cursor: 'pointer', background: 'none', border: 'none' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )})}
              
              {!loading && filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No students found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <span>Showing {filteredStudents.length} entries</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" style={{ padding: '6px 12px' }}>Previous</button>
            <button className="btn-secondary" style={{ padding: '6px 12px', background: 'var(--primary-color)', color: 'white', border: 'none' }}>1</button>
            <button className="btn-secondary" style={{ padding: '6px 12px' }}>Next</button>
          </div>
        </div>
      </div>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Secure Deletion Required">
        <form onSubmit={confirmDelete} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: 'var(--danger)' }}>Warning: Deleting a student will permanently remove their records.</p>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Enter Admin Password to Confirm</label>
            <input 
              required 
              type="password" 
              className="glass-input" 
              value={deletePassword} 
              onChange={e => setDeletePassword(e.target.value)} 
              placeholder="Password..." 
            />
          </div>
          {deleteError && <div style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{deleteError}</div>}
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ background: 'var(--danger)' }}>Delete Permanently</button>
          </div>
        </form>
      </Modal>

      {/* Quick Add Class Modal */}
      <Modal isOpen={isClassModalOpen} onClose={() => setClassModalOpen(false)} title="Quick Add New Class">
        <form onSubmit={handleAddClass} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Instantly add a class and its sections to update the directory.</p>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Class Name</label>
            <input required type="text" className="glass-input" value={newClassData.className} onChange={e => setNewClassData({...newClassData, className: e.target.value})} placeholder="e.g. Class 10" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Sections (comma-separated)</label>
            <input required type="text" className="glass-input" value={newClassData.sections} onChange={e => setNewClassData({...newClassData, sections: e.target.value})} placeholder="e.g. A, B, C" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Base Fee Name</label>
              <input required type="text" className="glass-input" value={newClassData.feeName} onChange={e => setNewClassData({...newClassData, feeName: e.target.value})} placeholder="e.g. Monthly Tuition" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Amount (â‚¹)</label>
              <input required type="number" className="glass-input" value={newClassData.feeAmount} onChange={e => setNewClassData({...newClassData, feeAmount: e.target.value})} placeholder="e.g. 2500" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => setClassModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Add Class</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Students;

