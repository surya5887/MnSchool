import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IndianRupee, ArrowLeft, Camera, X, Edit, Save, Trash2, AlertTriangle, Check } from 'lucide-react';
import { getStaffById, updateStaff, updateStaffSalaryStatus, deleteStaff, type StaffData } from '../services/staffService';
import Modal from '../components/Modal';

// Mock Cloudinary upload if needed, otherwise use lib/cloudinary
// We'll import it from lib/cloudinary if it's there
import { uploadImageToCloudinary } from '../lib/cloudinary';

const StaffProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffData | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<StaffData>>({});
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const staffData = await getStaffById(id);
        if (staffData) {
          setStaff(staffData);
          setEditData(staffData);
        }
      } catch (error) {
        console.error("Error fetching staff details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleEditToggle = () => {
    if (isEditing) {
      setEditData(staff || {});
      setNewPhotoFile(null);
      setNewPhotoPreview(null);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    if (!id || !staff) return;
    setSaving(true);
    try {
      let finalPhotoUrl = editData.photoUrl;
      
      if (newPhotoFile) {
        finalPhotoUrl = await uploadImageToCloudinary(newPhotoFile);
      } else if (editData.photoUrl === '') {
        finalPhotoUrl = '';
      }

      const updatedData = { ...editData, photoUrl: finalPhotoUrl };

      await updateStaff(id, updatedData);
      setStaff(updatedData as StaffData);
      setIsEditing(false);
      setNewPhotoFile(null);
      setNewPhotoPreview(null);
    } catch (e) {
      console.error("Error updating profile", e);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!id || !staff) return;
    try {
      await updateStaffSalaryStatus(id, 'Paid');
      setStaff({ ...staff, salaryStatus: 'Paid' });
    } catch (e) {
      console.error("Error marking as paid", e);
    }
  };

  const handleDeleteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deletePassword !== 'admin123') {
      setDeleteError('Incorrect admin password.');
      return;
    }
    if (!id) return;
    try {
      await deleteStaff(id);
      setIsDeleteModalOpen(false);
      navigate('/staff');
    } catch (error) {
      console.error("Error deleting staff", error);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = () => {
    setNewPhotoFile(null);
    setNewPhotoPreview(null);
    setEditData({ ...editData, photoUrl: '' });
  };

  if (loading) return <div>Loading Profile...</div>;
  if (!staff) return <div>Staff not found.</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate('/staff')} className="btn-secondary" style={{ background: 'transparent', border: 'none', padding: 0 }}>
          <ArrowLeft size={20} /> Back to Staff
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          {isEditing ? (
            <>
              <button className="btn-secondary" onClick={handleEditToggle}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Saving...' : <><Save size={16}/> Save Changes</>}
              </button>
            </>
          ) : (
            <>
              <button className="btn-primary" style={{ background: 'var(--danger)' }} onClick={() => setIsDeleteModalOpen(true)}>
                <Trash2 size={16} /> Delete Staff
              </button>
              <button className="btn-primary" onClick={handleEditToggle}>
                <Edit size={16} /> Edit Profile
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* Left Column - Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ textAlign: 'center', position: 'relative' }}>
            
            <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handlePhotoChange} />
            
            <div style={{ 
              width: '120px', height: '120px', borderRadius: '50%', background: 'var(--primary)', 
              margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
              fontSize: '3rem', fontWeight: 600, overflow: 'hidden', position: 'relative',
              cursor: isEditing ? 'pointer' : 'default', border: isEditing ? '2px dashed var(--glass-border)' : 'none'
            }} onClick={() => isEditing && fileInputRef.current?.click()}>
              {newPhotoPreview || (editData.photoUrl && editData.photoUrl !== '') ? (
                <>
                  <img src={newPhotoPreview || editData.photoUrl} alt="Staff" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {isEditing && (
                    <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.5)', padding: '4px', fontSize: '0.7rem' }}>
                       <Camera size={14} /> Change
                    </div>
                  )}
                </>
              ) : (
                isEditing ? <Camera size={32} /> : (staff.name?.[0] || 'S')
              )}
            </div>
            
            {isEditing && (newPhotoPreview || (editData.photoUrl && editData.photoUrl !== '')) && (
              <button 
                onClick={handleRemovePhoto}
                style={{ margin: '-10px auto 16px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <X size={14} /> Remove Photo
              </button>
            )}

            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                <input className="glass-input" value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} placeholder="Full Name" />
                <select className="glass-input" value={editData.status} onChange={e => setEditData({...editData, status: e.target.value as 'Active' | 'On Leave' | 'Resigned'})}>
                   <option value="Active">Active</option>
                   <option value="On Leave">On Leave</option>
                   <option value="Resigned">Resigned</option>
                </select>
                <input className="glass-input" value={editData.role || ''} onChange={e => setEditData({...editData, role: e.target.value})} placeholder="Role (e.g. Teacher)" />
              </div>
            ) : (
              <>
                <h2 style={{ margin: '0 0 8px 0' }}>{staff.name}</h2>
                <p style={{ color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
                  {staff.role} - {staff.department}
                </p>
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <span className={`badge ${staff.status === 'Active' ? 'success' : staff.status === 'On Leave' ? 'warning' : 'danger'}`}>
                    {staff.status}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column - Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel">
            <h3 style={{ margin: '0 0 16px 0' }}>Professional Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-muted)' }}>
                <span style={{ width: '120px', fontWeight: 500 }}>Department</span>
                {isEditing ? 
                  <input className="glass-input" style={{flex: 1, padding: '4px 8px'}} value={editData.department || ''} onChange={e => setEditData({...editData, department: e.target.value})} placeholder="Department" /> 
                  : <span>{staff.department || 'N/A'}</span>
                }
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-muted)' }}>
                <span style={{ width: '120px', fontWeight: 500 }}>Subject</span>
                {isEditing ? 
                  <input className="glass-input" style={{flex: 1, padding: '4px 8px'}} value={editData.subject || ''} onChange={e => setEditData({...editData, subject: e.target.value})} placeholder="Subject" /> 
                  : <span>{staff.subject || 'N/A'}</span>
                }
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-muted)' }}>
                <span style={{ width: '120px', fontWeight: 500 }}>Experience</span>
                {isEditing ? 
                  <input className="glass-input" style={{flex: 1, padding: '4px 8px'}} value={editData.experience || ''} onChange={e => setEditData({...editData, experience: e.target.value})} placeholder="Experience (e.g. 5 Years)" /> 
                  : <span>{staff.experience || 'N/A'}</span>
                }
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-muted)' }}>
                <span style={{ width: '120px', fontWeight: 500 }}>Join Date</span>
                {isEditing ? 
                  <input type="date" className="glass-input" style={{flex: 1, padding: '4px 8px'}} value={editData.joinDate || ''} onChange={e => setEditData({...editData, joinDate: e.target.value})} /> 
                  : <span>{staff.joinDate ? new Date(staff.joinDate).toLocaleDateString() : 'N/A'}</span>
                }
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-muted)' }}>
                <span style={{ width: '120px', fontWeight: 500 }}>Email</span>
                {isEditing ? 
                  <input type="email" className="glass-input" style={{flex: 1, padding: '4px 8px'}} value={editData.email || ''} onChange={e => setEditData({...editData, email: e.target.value})} placeholder="Email Address" /> 
                  : <span>{staff.email || 'N/A'}</span>
                }
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-muted)' }}>
                <span style={{ width: '120px', fontWeight: 500 }}>Phone</span>
                {isEditing ? 
                  <input className="glass-input" style={{flex: 1, padding: '4px 8px'}} value={editData.phone || ''} onChange={e => setEditData({...editData, phone: e.target.value})} placeholder="Phone Number" /> 
                  : <span>{staff.phone || 'N/A'}</span>
                }
              </div>
            </div>
          </div>

          <div className="glass-panel">
            <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IndianRupee size={20} className="text-primary" /> Salary & Payroll
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-muted)' }}>
                <span style={{ width: '120px', fontWeight: 500 }}>Monthly Salary</span>
                {isEditing ? 
                  <input type="number" className="glass-input" style={{flex: 1, padding: '4px 8px'}} value={editData.salary || 0} onChange={e => setEditData({...editData, salary: Number(e.target.value)})} placeholder="Salary" /> 
                  : <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)' }}>₹{staff.salary || 0}</span>
                }
              </div>
              
              {!isEditing && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
                  <span style={{ width: '120px', fontWeight: 500, color: 'var(--text-muted)' }}>Salary Status</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`badge ${staff.salaryStatus === 'Paid' ? 'success' : 'danger'}`}>
                      {staff.salaryStatus || 'Pending'}
                    </span>
                    {staff.salaryStatus !== 'Paid' && (
                      <button className="btn-primary" style={{ padding: '4px 12px', fontSize: '0.85rem' }} onClick={handleMarkPaid}>
                        <Check size={14} /> Mark Paid
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Delete Staff Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setDeletePassword(''); setDeleteError(''); }} title="Delete Staff Member">
        <form onSubmit={handleDeleteStaff} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="alert-warning" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', gap: '8px' }}>
            <AlertTriangle size={18} /> Warning: This action cannot be undone and will permanently delete the staff record.
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

export default StaffProfile;
