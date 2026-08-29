import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, BookOpen, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStaff, addStaff, deleteStaff, type StaffData } from '../services/staffService';
import { uploadImageToCloudinary, uploadFileToCloudinary } from '../lib/cloudinary';
import Modal from '../components/Modal';

const Staff: React.FC = () => {
  const authUser = JSON.parse(sessionStorage.getItem('authUser') || localStorage.getItem('authUser') || '{}');
  const role = authUser.role || '';
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<StaffData[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newStaff, setNewStaff] = useState<Partial<StaffData>>({
    name: '', subject: '', assignedClass: '', experience: '', salary: 0, status: 'Active',
    customId: '', email: '', phone: '', address: '', aadharNumber: '', cast: '', religion: '', qualification: ''
  });
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [docFiles, setDocFiles] = useState<File[]>([]);

  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [staffToDelete, setStaffToDelete] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const fetchStaff = async () => {
    try {
      const data = await getStaff();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching staff', error);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async () => {
    if (!newStaff.name) return;
    setIsSaving(true);
    try {
      let photoUrl = '';
      if (photoFile) {
        photoUrl = await uploadImageToCloudinary(photoFile);
      }
      
      let documents = [];
      for (const file of docFiles) {
        const url = await uploadFileToCloudinary(file);
        documents.push({ name: file.name, url });
      }

      await addStaff({ 
        ...newStaff, 
        photoUrl,
        documents,
        role: 'Teacher', 
        department: 'Academic', 
        joinDate: new Date().toISOString().split('T')[0] 
      } as StaffData);
      
      setAddModalOpen(false);
      setNewStaff({ name: '', subject: '', assignedClass: '', experience: '', salary: 0, status: 'Active', customId: '', email: '', phone: '', address: '', aadharNumber: '', cast: '', religion: '', qualification: '' });
      setPhotoFile(null);
      setDocFiles([]);
      fetchStaff();
    } catch (err) {
      console.error('Error adding staff', err);
      alert('Failed to add staff. Check network/cloudinary settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deletePassword !== 'admin123') {
      setDeleteError('Incorrect admin password.');
      return;
    }
    if (staffToDelete.length === 0) return;
    try {
      await Promise.all(staffToDelete.map(id => deleteStaff(id)));
      setIsDeleteModalOpen(false);
      setStaffToDelete([]);
      setSelectedStaff([]);
      setDeletePassword('');
      setDeleteError('');
      fetchStaff();
    } catch (err) {
      console.error('Error deleting staff', err);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex-responsive" style={{ marginBottom: "32px" }}>
        <div>
          <h1 className="page-title">Teachers</h1>
          <p className="page-subtitle">Manage teaching staff across the school.</p>
        </div>
        {['Principal', 'Manager', 'Super Admin'].includes(role) && (
          <div style={{ display: 'flex', gap: '12px' }}>
            
            <button className="btn-primary" onClick={() => setAddModalOpen(true)}>
              <UserPlus size={20} /> Add Staff
            </button>
          </div>
        )}
      </div>

      
      

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {teachers.map((teacher, idx) => {
          const COLOR_THEMES = [
            { gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', bg: 'rgba(99, 102, 241, 0.1)', text: '#6366f1' },
            { gradient: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)', bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
            { gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', bg: 'rgba(245, 158, 11, 0.1)', text: '#d97706' },
            { gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', bg: 'rgba(236, 72, 153, 0.1)', text: '#db2777' },
            { gradient: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', bg: 'rgba(16, 185, 129, 0.1)', text: '#059669' },
          ];
          const theme = COLOR_THEMES[idx % COLOR_THEMES.length];
          const isAdmin = ['Principal', 'Manager', 'Super Admin'].includes(role);

          return (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02, translateY: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => isAdmin ? navigate(`/staff/${teacher.id}`) : null}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                cursor: isAdmin ? 'pointer' : 'default',
                borderRadius: '24px',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.8)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                border: '1px solid rgba(255,255,255,0.6)',
                backdropFilter: 'blur(10px)',
                position: 'relative'
              }}
            >
              
              
              {/* Header Profile Area */}
              <div style={{ background: theme.gradient, padding: '32px 24px 24px', color: 'white', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                
                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
                  {teacher.photoUrl ? (
                    <img src={teacher.photoUrl} alt={teacher.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '2.5rem', color: theme.text, fontWeight: 700 }}>{teacher.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                
                <h2 style={{ fontSize: '1.4rem', margin: '0 0 4px 0', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', zIndex: 1 }}>{teacher.name}</h2>
                <div style={{ fontSize: '0.85rem', opacity: 0.9, letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600, position: 'relative', zIndex: 1 }}>{teacher.customId || 'STAFF'}</div>
              </div>

              {/* Content Area */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                
                {/* Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-40px', position: 'relative', zIndex: 2, marginBottom: '8px' }}>
                  <span className={`badge ${teacher.status === 'Active' ? 'success' : 'danger'}`} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    {teacher.status || 'Active'}
                  </span>
                </div>

                <div style={{ flex: 1 }}></div>

                {/* Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '16px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}><BookOpen size={12}/> Subject</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{teacher.subject || 'N/A'}</div>
                  </div>
                  <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '16px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> Experience</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{teacher.experience || 'N/A'}</div>
                  </div>
                </div>

              </div>
            </motion.div>
          );
        })}
      </div>


      <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Staff">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Name *</label>
              <input type="text" className="glass-input" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Custom ID</label>
              <input type="text" className="glass-input" value={newStaff.customId} onChange={e => setNewStaff({...newStaff, customId: e.target.value})} placeholder="e.g. STF-001" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Phone / Contact</label>
              <input type="text" className="glass-input" value={newStaff.phone} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Email</label>
              <input type="email" className="glass-input" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Address</label>
            <textarea className="glass-input" value={newStaff.address} onChange={e => setNewStaff({...newStaff, address: e.target.value})} rows={2}></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Aadhar Number</label>
              <input type="text" className="glass-input" value={newStaff.aadharNumber} onChange={e => setNewStaff({...newStaff, aadharNumber: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Cast</label>
              <input type="text" className="glass-input" value={newStaff.cast} onChange={e => setNewStaff({...newStaff, cast: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Religion</label>
              <input type="text" className="glass-input" value={newStaff.religion} onChange={e => setNewStaff({...newStaff, religion: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Qualification (Optional)</label>
              <input type="text" className="glass-input" value={newStaff.qualification} onChange={e => setNewStaff({...newStaff, qualification: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Subject</label>
              <input type="text" className="glass-input" value={newStaff.subject} onChange={e => setNewStaff({...newStaff, subject: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Assigned Class</label>
              <input type="text" className="glass-input" value={newStaff.assignedClass} onChange={e => setNewStaff({...newStaff, assignedClass: e.target.value})} placeholder="e.g. 10th" />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Experience</label>
              <input type="text" className="glass-input" value={newStaff.experience} onChange={e => setNewStaff({...newStaff, experience: e.target.value})} placeholder="e.g. 5 Years" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Base Salary (₹)</label>
              <input type="number" className="glass-input" value={newStaff.salary} onChange={e => setNewStaff({...newStaff, salary: Number(e.target.value)})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Status</label>
              <select className="glass-input" value={newStaff.status} onChange={e => setNewStaff({...newStaff, status: e.target.value as any})}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Photo Upload</label>
            <input type="file" className="glass-input" accept="image/*" onChange={e => {
              if (e.target.files && e.target.files[0]) {
                setPhotoFile(e.target.files[0]);
              } else {
                setPhotoFile(null);
              }
            }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Documents Upload</label>
            <input type="file" className="glass-input" multiple accept=".pdf,.doc,.docx,.jpg,.png" onChange={e => {
              if (e.target.files) {
                setDocFiles(Array.from(e.target.files));
              } else {
                setDocFiles([]);
              }
            }} />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
            <button className="btn-secondary" onClick={() => setAddModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAddStaff} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Staff'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Transaction Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setStaffToDelete([]); setDeleteError(''); }} title="Delete Staff">
        <form onSubmit={handleDelete} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="alert-warning" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
            Warning: This action cannot be undone and will permanently remove the {staffToDelete.length > 1 ? `${staffToDelete.length} selected staff members` : "staff member"} from the system.
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Admin Password</label>
            <input required type="password" className="glass-input" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="Enter admin password" />
            {deleteError && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>{deleteError}</p>}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ background: 'var(--danger)' }}>Confirm Delete</button>
          </div>
        </form>
      </Modal>

    </motion.div>
  );
};

export default Staff;
