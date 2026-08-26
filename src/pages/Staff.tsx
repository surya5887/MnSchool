import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStaff, addStaff, deleteStaff, type StaffData } from '../services/staffService';
import { uploadImageToCloudinary, uploadFileToCloudinary } from '../lib/cloudinary';
import Modal from '../components/Modal';

const Staff: React.FC = () => {
  const authUser = JSON.parse(sessionStorage.getItem('authUser') || localStorage.getItem('authUser') || '{}');
  const role = authUser.role || '';
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Teachers</h1>
          <p className="page-subtitle">Manage teaching staff across the school.</p>
        </div>
        {['Principal', 'Manager', 'Super Admin'].includes(role) && (
          <div style={{ display: 'flex', gap: '12px' }}>
            {selectedStaff.length > 0 && (
              <button className="btn-primary" style={{ background: 'var(--danger)' }} onClick={() => { setStaffToDelete(selectedStaff); setIsDeleteModalOpen(true); }}>
                <Trash2 size={20} /> Delete Selected ({selectedStaff.length})
              </button>
            )}
            <button className="btn-primary" onClick={() => setAddModalOpen(true)}>
              <UserPlus size={20} /> Add Staff
            </button>
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="glass-table-container">
          <table>
            <thead>
              <tr>
                {['Principal', 'Manager', 'Super Admin'].includes(role) && (
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={teachers.length > 0 && selectedStaff.length === teachers.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStaff(teachers.map(t => t.id));
                        } else {
                          setSelectedStaff([]);
                        }
                      }}
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                    />
                  </th>
                )}
                <th>Custom ID</th>
                <th>Staff Name</th>
                <th>Subject</th>
                <th>Experience</th>
                <th>Status</th>
                {['Principal', 'Manager', 'Super Admin'].includes(role) && <th style={{ textAlign: 'center' }}>Action</th>}
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
                  {['Principal', 'Manager', 'Super Admin'].includes(role) && (
                    <td style={{ textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedStaff.includes(teacher.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStaff([...selectedStaff, teacher.id]);
                          } else {
                            setSelectedStaff(selectedStaff.filter(id => id !== teacher.id));
                          }
                        }}
                        style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                      />
                    </td>
                  )}
                  <td style={{ fontWeight: 600 }}>{teacher.customId || '-'}</td>
                  <td>
                    {['Principal', 'Manager', 'Super Admin'].includes(role) ? (
                      <Link to={`/staff/${teacher.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={teacher.photoUrl || `https://ui-avatars.com/api/?name=${teacher.name}&background=random`} alt={teacher.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                          <span style={{ fontWeight: 500, color: 'var(--primary)' }}>{teacher.name}</span>
                        </div>
                      </Link>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={teacher.photoUrl || `https://ui-avatars.com/api/?name=${teacher.name}&background=random`} alt={teacher.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                        <span style={{ fontWeight: 500 }}>{teacher.name}</span>
                      </div>
                    )}
                  </td>
                  <td>{teacher.subject || '-'}</td>
                  <td>{teacher.experience || '-'}</td>
                  <td>
                    <span className={`badge ${teacher.status === 'Active' ? 'success' : 'danger'}`}>
                      {teacher.status || 'Active'}
                    </span>
                  </td>
                  {['Principal', 'Manager', 'Super Admin'].includes(role) && (
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
                        <Link to={`/staff/${teacher.id}`} className="icon-btn" style={{ color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
                          <Eye size={18} />
                        </Link>
                        <button className="icon-btn" onClick={() => { if(teacher.id) { setStaffToDelete([teacher.id]); setIsDeleteModalOpen(true); } }} style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
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
