import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Briefcase, Trash2, Mail, Phone, Search, Users, Shield, GraduationCap, Truck, Settings, Coffee, BookOpen, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStaff, addStaff, deleteStaff, type StaffData } from '../services/staffService';
import { uploadImageToCloudinary, uploadFileToCloudinary } from '../lib/cloudinary';
import Modal from '../components/Modal';

const ROLES = [
  
  { name: 'Teachers', icon: GraduationCap, filter: 'Teacher' },
  { name: 'Admins', icon: Shield, filter: 'Admin' },
  { name: 'Accountants', icon: Briefcase, filter: 'Accountant' },
  { name: 'Drivers', icon: Truck, filter: 'Driver' },
  { name: 'Support / Peon', icon: Coffee, filter: 'Support Staff' },
  { name: 'Other', icon: Settings, filter: 'Other' }
];

const ROLE_COLORS: Record<string, string> = {
  'Teacher': 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)', // Purple/Pink
  'Admin': 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', // Red/Orange
  'Accountant': 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)', // Emerald/Teal
  'Driver': 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', // Blue/Cyan
  'Support Staff': 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)', // Amber/Yellow
  'Other': 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' // Gray
};

const getRoleColor = (role: string | undefined | null) => {
  if (!role) return ROLE_COLORS['Other'];
  return ROLE_COLORS[role] || ROLE_COLORS['Other'];
};

const Staff: React.FC = () => {
  const authUser = JSON.parse(sessionStorage.getItem('authUser') || localStorage.getItem('authUser') || '{}');
  const userRole = authUser.role || '';
  const navigate = useNavigate();
  
  const [allStaff, setAllStaff] = useState<StaffData[]>([]);
  const [activeTab, setActiveTab] = useState('Teacher');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newStaff, setNewStaff] = useState<Partial<StaffData>>({
    name: '', role: 'Teacher', department: '', subject: '', assignedClass: '', experience: '', salary: 0, status: 'Active',
    customId: '', email: '', phone: '', address: '', aadharNumber: '', cast: '', religion: '', qualification: ''
  });
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [docFiles, setDocFiles] = useState<File[]>([]);

  const [staffToDelete, setStaffToDelete] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const fetchStaff = async () => {
    try {
      const data = await getStaff();
      setAllStaff(data || []);
    } catch (error) {
      console.error('Error fetching staff', error);
      setAllStaff([]);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.role) return alert("Name and Role are required");
    setIsSaving(true);
    try {
      let photoUrl = '';
      if (photoFile) {
        photoUrl = await uploadImageToCloudinary(photoFile);
      }
      
      const docUrls: string[] = [];
      for (const file of docFiles) {
        const url = await uploadFileToCloudinary(file);
        docUrls.push(url);
      }

      await addStaff({
        ...newStaff as StaffData,
        joinDate: new Date().toISOString(),
        photoUrl,
        documents: docUrls
      });
      setAddModalOpen(false);
      setNewStaff({
        name: '', role: 'Teacher', department: '', subject: '', assignedClass: '', experience: '', salary: 0, status: 'Active',
        customId: '', email: '', phone: '', address: '', aadharNumber: '', cast: '', religion: '', qualification: ''
      });
      setPhotoFile(null);
      setDocFiles([]);
      fetchStaff();
    } catch (error) {
      console.error(error);
      alert('Failed to save staff member');
    }
    setIsSaving(false);
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deletePassword !== 'admin@8393') {
      setDeleteError('Invalid admin password');
      return;
    }
    setDeleteError('');
    try {
      for (const id of staffToDelete) {
        await deleteStaff(id);
      }
      setStaffToDelete([]);
      setIsDeleteModalOpen(false);
      setDeletePassword('');
      fetchStaff();
    } catch (error) {
      setDeleteError('Failed to delete staff');
    }
  };

  const filteredStaff = useMemo(() => {
    if (!Array.isArray(allStaff)) return [];
    
    return allStaff.filter(s => {
      try {
        const matchesTab = activeTab === 'All' || s.role === activeTab;
        const searchStr = (searchQuery || '').toLowerCase();
        
        if (!searchStr) return matchesTab;
        
        const safeName = s.name ? String(s.name).toLowerCase() : '';
        const safeId = s.customId ? String(s.customId).toLowerCase() : '';
        const safeRole = s.role ? String(s.role).toLowerCase() : '';
        
        const matchesSearch = safeName.includes(searchStr) || 
                              safeId.includes(searchStr) ||
                              safeRole.includes(searchStr);
                              
        return matchesTab && matchesSearch;
      } catch (e) {
        return false;
      }
    });
  }, [allStaff, activeTab, searchQuery]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="page-container" style={{ paddingTop: '16px', maxWidth: '1400px', margin: '0 auto' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Staff Directory</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Manage teachers, admins, and all support staff across the school.</p>
        </div>
        {['Principal', 'Manager', 'Super Admin', 'Admin'].includes(userRole) && (
            <div style={{ display: 'flex', gap: '12px' }}>
            {staffToDelete.length > 0 && (
              <button className="btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setIsDeleteModalOpen(true)}>
                <Trash2 size={18} /> Delete Selected ({staffToDelete.length})
              </button>
            )}
            <button className="btn-primary" onClick={() => { setNewStaff({...newStaff, role: activeTab}); setAddModalOpen(true); }}>
              <UserPlus size={20} style={{ marginRight: '8px' }} /> Add {activeTab === 'Support Staff' ? 'Support' : activeTab}
            </button>
          </div>
        )}
      </div>

      {/* Tabs and Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px', background: 'var(--glass-bg)', padding: '16px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
        <div className="hide-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%', paddingBottom: '4px' }}>
          {ROLES.map(r => (
            <button 
              key={r.filter} 
              onClick={() => setActiveTab(r.filter)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', 
                background: activeTab === r.filter ? 'var(--primary-color)' : 'transparent', 
                color: activeTab === r.filter ? 'white' : 'var(--text-muted)', 
                border: 'none', borderRadius: '10px', cursor: 'pointer', 
                fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap' 
              }}
            >
              <r.icon size={16} />
              {r.name}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', minWidth: '250px', flex: '1 1 auto', maxWidth: '400px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search staff by name or ID..." 
            className="glass-input" 
            style={{ paddingLeft: '40px', width: '100%' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Staff Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
        <AnimatePresence>
          {filteredStaff.map((staff, idx) => {
            const COLOR_THEMES = [
              { gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', bg: 'rgba(99, 102, 241, 0.1)', text: '#6366f1' },
              { gradient: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)', bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
              { gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', bg: 'rgba(245, 158, 11, 0.1)', text: '#d97706' },
              { gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', bg: 'rgba(236, 72, 153, 0.1)', text: '#db2777' },
              { gradient: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', bg: 'rgba(16, 185, 129, 0.1)', text: '#059669' },
            ];
            // We use the index to assign a playful color theme just like the old UI, 
            // but we can also use role if we want. Old UI used index for variety!
            const theme = COLOR_THEMES[idx % COLOR_THEMES.length];

            return (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: (idx % 10) * 0.05 }}
              key={staff.id || Math.random().toString()}
              whileHover={{ scale: 1.02, translateY: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('.checkbox-container')) return;
                if (staff.id) navigate(`/staff/${staff.id}`);
              }}
              style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  cursor: 'pointer',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(10px)',
                  position: 'relative'
              }}
            >
              {['Principal', 'Manager', 'Super Admin', 'Admin'].includes(userRole) && staff.id && (
                <div className="checkbox-container" style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10 }}>
                  <input 
                    type="checkbox" 
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'white' }}
                    checked={staffToDelete.includes(staff.id)}
                    onChange={(e) => {
                      if (e.target.checked) setStaffToDelete(prev => [...prev, staff.id!]);
                      else setStaffToDelete(prev => prev.filter(id => id !== staff.id));
                    }}
                  />
                </div>
              )}
              
              {/* Header / Avatar Area */}
              <div style={{ background: theme.gradient, padding: '32px 24px 24px', color: 'white', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                  <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                  
                  <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', marginBottom: '12px', position: 'relative', zIndex: 1, backgroundImage: staff.photoUrl ? `url(${staff.photoUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    {!staff.photoUrl && (
                      <span style={{ fontSize: '2.5rem', color: theme.text, fontWeight: 700 }}>
                        {staff.name ? String(staff.name).charAt(0).toUpperCase() : '?'}
                      </span>
                    )}
                  </div>
                  
                  <h2 style={{ fontSize: '1.4rem', margin: '0 0 4px 0', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', zIndex: 1 }}>{staff.name || 'Unknown'}</h2>
                  <div style={{ fontSize: '0.85rem', opacity: 0.9, letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600, position: 'relative', zIndex: 1 }}>{String(staff.role || 'STAFF').toUpperCase()}</div>
              </div>

              {/* Content Area */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                
                {/* Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-40px', position: 'relative', zIndex: 2, marginBottom: '8px' }}>
                  <span className={`badge ${staff.status === 'Active' ? 'success' : 'danger'}`} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    {staff.status || 'Active'}
                  </span>
                </div>

                <div style={{ flex: 1 }}></div>

                {/* Info Grid */}
                {staff.role === 'Teacher' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '16px' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}><BookOpen size={12}/> Subject</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{staff.subject || 'N/A'}</div>
                    </div>
                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '16px' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> Experience</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{staff.experience || 'N/A'}</div>
                    </div>
                  </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {staff.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <Phone size={14} /> {staff.phone}
                    </div>
                  )}
                  {staff.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <Mail size={14} /> {staff.email}
                    </div>
                  )}
                </div>
                
                {staff.customId && (
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
                    <span style={{ background: 'var(--glass-bg)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', border: '1px solid var(--glass-border)' }}>
                      ID: {staff.customId}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
          })}
        </AnimatePresence>
        
        {filteredStaff.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 24px', background: 'var(--glass-bg)', borderRadius: '24px' }}>
            <Users size={48} color="var(--text-muted)" style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ color: 'var(--text-main)', margin: '0 0 8px 0' }}>No staff found</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Try adjusting your search or role filters.</p>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title={`Register New ${activeTab}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Full Name</label>
              <input type="text" className="glass-input" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Custom ID</label>
              <input type="text" className="glass-input" value={newStaff.customId} onChange={e => setNewStaff({...newStaff, customId: e.target.value})} placeholder="e.g. STF-001" />
            </div>
          </div>
          
          <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Department</label>
              <input type="text" className="glass-input" value={newStaff.department} onChange={e => setNewStaff({...newStaff, department: e.target.value})} placeholder="e.g. Academics" />
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

          {newStaff.role === 'Teacher' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(99,102,241,0.05)', padding: '16px', borderRadius: '12px', border: '1px dashed rgba(99,102,241,0.2)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--primary-color)', fontWeight: 600 }}>Subject</label>
                <input type="text" className="glass-input" style={{ background: 'white' }} value={newStaff.subject} onChange={e => setNewStaff({...newStaff, subject: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--primary-color)', fontWeight: 600 }}>Assigned Class</label>
                <input type="text" className="glass-input" style={{ background: 'white' }} value={newStaff.assignedClass} onChange={e => setNewStaff({...newStaff, assignedClass: e.target.value})} placeholder="e.g. 10th" />
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Base Salary (,1)</label>
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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Photo Upload</label>
              <input type="file" className="glass-input" accept="image/*" onChange={e => {
                if (e.target.files && e.target.files[0]) setPhotoFile(e.target.files[0]);
                else setPhotoFile(null);
              }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Documents (PDF/JPG)</label>
              <input type="file" className="glass-input" multiple accept=".pdf,.doc,.docx,.jpg,.png" onChange={e => {
                if (e.target.files) setDocFiles(Array.from(e.target.files));
                else setDocFiles([]);
              }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
            <button className="btn-secondary" onClick={() => setAddModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAddStaff} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Staff Profile'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Staff Modal */}
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
