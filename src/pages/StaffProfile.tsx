import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IndianRupee, ArrowLeft, Trash2, Edit, Save, Plus } from 'lucide-react';
import { getStaffById, updateStaff, deleteStaff, type StaffData } from '../services/staffService';
import { getTransactions, addTransaction, deleteTransaction, type TransactionData } from '../services/financeService';
import { uploadImageToCloudinary, uploadFileToCloudinary } from '../lib/cloudinary';
import Modal from '../components/Modal';

const getISTDateTimeLocalString = () => {
  const now = new Date();
  const istTime = new Date(now.toLocaleString('en-US', {timeZone: 'Asia/Kolkata'}));
  const yyyy = istTime.getFullYear();
  const mm = String(istTime.getMonth() + 1).padStart(2, '0');
  const dd = String(istTime.getDate()).padStart(2, '0');
  const hh = String(istTime.getHours()).padStart(2, '0');
  const min = String(istTime.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const StaffProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
  const role = authUser.role || '';
  const [staff, setStaff] = useState<StaffData | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<StaffData>>({});
  const [saving, setSaving] = useState(false);
  
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newDocFiles, setNewDocFiles] = useState<File[]>([]);

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Ledger State
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [filterMonth, setFilterMonth] = useState('All');
  
  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [newTxn, setNewTxn] = useState({
    type: 'Expense',
    category: 'Salary',
    description: '',
    amount: '',
    date: getISTDateTimeLocalString()
  });

  // Delete Txn
  const [deleteTxnId, setDeleteTxnId] = useState<string | null>(null);
  const [isDeleteTxnModalOpen, setIsDeleteTxnModalOpen] = useState(false);
  const [deleteTxnPassword, setDeleteTxnPassword] = useState('');
  const [deleteTxnError, setDeleteTxnError] = useState('');

  const fetchStaffData = async () => {
    if (!id) return;
    try {
      const staffData = await getStaffById(id);
      if (staffData) {
        setStaff(staffData);
        setEditData(staffData);
      }
    } catch (error) {
      console.error('Error fetching staff details', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLedger = async () => {
    if (!id) return;
    try {
      const data = await getTransactions({ staffId: id });
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching ledger', error);
    }
  };

  useEffect(() => {
    fetchStaffData();
    fetchLedger();
  }, [id]);

  const handleSaveProfile = async () => {
    if (!id || !staff) return;
    setSaving(true);
    try {
      let photoUrl = editData.photoUrl;
      if (newPhotoFile) {
        photoUrl = await uploadImageToCloudinary(newPhotoFile);
      }
      
      let newDocs = [...(editData.documents || [])];
      for (const file of newDocFiles) {
        const url = await uploadFileToCloudinary(file);
        newDocs.push({ name: file.name, url });
      }

      const updatedData = { ...editData, photoUrl, documents: newDocs };
      if (!updatedData.password || updatedData.password.startsWith('$2a$') || updatedData.password.startsWith('$2b$')) {
        delete updatedData.password;
      }

      await updateStaff(id, updatedData);
      setStaff(updatedData as StaffData);
      setIsEditing(false);
      setNewPhotoFile(null);
      setNewDocFiles([]);
    } catch (e) {
      console.error('Error updating profile', e);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deletePassword !== 'admin@8393') {
      setDeleteError('Incorrect admin password.');
      return;
    }
    if (!id) return;
    try {
      await deleteStaff(id);
      navigate('/staff');
    } catch (err) {
      console.error('Error deleting staff', err);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newTxn.amount || !newTxn.description) return;
    try {
      await addTransaction({
        type: newTxn.type as 'Income' | 'Expense',
        amount: Number(newTxn.amount),
        description: newTxn.description,
        category: newTxn.category,
        date: newTxn.date,
        staffId: id
      });
      setIsPaymentModalOpen(false);
      setNewTxn({ type: 'Expense', category: 'Salary', description: '', amount: '', date: getISTDateTimeLocalString() });
      fetchLedger();
    } catch (err) {
      console.error('Error adding transaction', err);
    }
  };

  const handleDeleteTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteTxnPassword !== 'admin@8393') {
      setDeleteTxnError('Incorrect admin password.');
      return;
    }
    if (!deleteTxnId) return;
    
    try {
      await deleteTransaction(deleteTxnId);
      setIsDeleteTxnModalOpen(false);
      setDeleteTxnId(null);
      setDeleteTxnPassword('');
      setDeleteTxnError('');
      fetchLedger();
    } catch (err) {
      console.error('Error deleting transaction', err);
    }
  };

  const toggleStatus = async () => {
    if (!id || !staff) return;
    const newStatus = staff.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateStaff(id, { status: newStatus });
      setStaff({ ...staff, status: newStatus });
      setEditData({ ...editData, status: newStatus });
    } catch (e) {
      console.error('Error updating status', e);
    }
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading...</div>;
  if (!staff) return <div style={{ padding: '24px' }}>Staff not found</div>;

  const availableMonths = Array.from(new Set(transactions.map(t => t.date.substring(0, 7)))).sort().reverse();
  const displayedRows = filterMonth === 'All' 
    ? transactions 
    : transactions.filter(t => t.date.startsWith(filterMonth));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button className="btn-secondary" onClick={() => navigate('/staff')} style={{ padding: '8px 16px' }}>
          <ArrowLeft size={18} /> Back to Staff
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          {role === 'Principal' && (
            <button className="btn-primary" style={{ background: 'var(--danger)' }} onClick={() => setIsDeleteModalOpen(true)}>
              <Trash2 size={16} /> Delete Staff
            </button>
          )}
          {!isEditing ? (
            role === 'Principal' && (
              <button className="btn-primary" onClick={() => setIsEditing(true)}>
                <Edit size={16} /> Edit Profile
              </button>
            )
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-secondary" onClick={() => { setIsEditing(false); setEditData(staff); setNewPhotoFile(null); setNewDocFiles([]); }}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveProfile} disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* Left Column - ID & Quick Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <div style={{ width: '120px', height: '120px', margin: '0 auto 20px', borderRadius: '16px', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid var(--glass-border)' }}>
              {staff.photoUrl ? (
                <img src={staff.photoUrl} alt={staff.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '3rem', color: 'var(--primary)', fontWeight: 600 }}>{staff.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', color: 'var(--text-color)' }}>{staff.name}</h2>
            <p style={{ margin: '0 0 16px 0', color: 'var(--text-muted)' }}>{staff.email ? `${staff.email} • ` : ''}{staff.role} - {staff.department}</p>
            
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span className={`badge ${staff.status === 'Active' ? 'success' : 'danger'}`}>
                {staff.status || 'Active'}
              </span>
              <button onClick={toggleStatus} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--text-color)' }}>
                Toggle Status
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Detailed Info & Ledger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel">
            <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
               Staff Details
            </h3>
            {isEditing ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><label className="form-label">Name</label><input type="text" className="glass-input" value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} /></div>
                <div><label className="form-label">Custom ID</label><input type="text" className="glass-input" value={editData.customId || ''} onChange={e => setEditData({...editData, customId: e.target.value})} /></div>
                <div><label className="form-label">Phone / Contact</label><input type="text" className="glass-input" value={editData.phone || ''} onChange={e => setEditData({...editData, phone: e.target.value})} /></div>
                <div><label className="form-label">Email</label><input type="email" className="glass-input" value={editData.email || ''} onChange={e => setEditData({...editData, email: e.target.value})} /></div>
                <div style={{ gridColumn: '1 / -1' }}><label className="form-label">Address</label><textarea className="glass-input" value={editData.address || ''} onChange={e => setEditData({...editData, address: e.target.value})} rows={2} /></div>
                <div><label className="form-label">Aadhar Number</label><input type="text" className="glass-input" value={editData.aadharNumber || ''} onChange={e => setEditData({...editData, aadharNumber: e.target.value})} /></div>
                <div><label className="form-label">Cast</label><input type="text" className="glass-input" value={editData.cast || ''} onChange={e => setEditData({...editData, cast: e.target.value})} /></div>
                <div><label className="form-label">Religion</label><input type="text" className="glass-input" value={editData.religion || ''} onChange={e => setEditData({...editData, religion: e.target.value})} /></div>
                <div><label className="form-label">Qualification</label><input type="text" className="glass-input" value={editData.qualification || ''} onChange={e => setEditData({...editData, qualification: e.target.value})} /></div>
                <div><label className="form-label">Subject</label><input type="text" className="glass-input" value={editData.subject || ''} onChange={e => setEditData({...editData, subject: e.target.value})} /></div>
                <div><label className="form-label">Assigned Class</label><input type="text" className="glass-input" value={editData.assignedClass || ''} onChange={e => setEditData({...editData, assignedClass: e.target.value})} placeholder="e.g. 10th" /></div>
                <div><label className="form-label">Experience</label><input type="text" className="glass-input" value={editData.experience || ''} onChange={e => setEditData({...editData, experience: e.target.value})} /></div>
                <div><label className="form-label">Base Salary (₹)</label><input type="number" className="glass-input" value={editData.salary || 0} onChange={e => setEditData({...editData, salary: Number(e.target.value)})} /></div>
                
                <div>
                  <label className="form-label">Update Photo</label>
                  <input type="file" className="glass-input" accept="image/*" onChange={e => {
                    if (e.target.files && e.target.files[0]) setNewPhotoFile(e.target.files[0]);
                    else setNewPhotoFile(null);
                  }} />
                </div>
                <div>
                  <label className="form-label">Upload New Documents</label>
                  <input type="file" className="glass-input" multiple onChange={e => {
                    if (e.target.files) setNewDocFiles(Array.from(e.target.files));
                  }} />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div><div className="detail-label">Phone</div><div className="detail-value">{staff.phone || 'N/A'}</div></div>
                <div><div className="detail-label">Email</div><div className="detail-value">{staff.email || 'N/A'}</div></div>
                <div style={{ gridColumn: '1 / -1' }}><div className="detail-label">Address</div><div className="detail-value">{staff.address || 'N/A'}</div></div>
                <div><div className="detail-label">Aadhar Number</div><div className="detail-value">{staff.aadharNumber || 'N/A'}</div></div>
                <div><div className="detail-label">Cast</div><div className="detail-value">{staff.cast || 'N/A'}</div></div>
                <div><div className="detail-label">Religion</div><div className="detail-value">{staff.religion || 'N/A'}</div></div>
                <div><div className="detail-label">Qualification</div><div className="detail-value">{staff.qualification || 'N/A'}</div></div>
                <div><div className="detail-label">Subject</div><div className="detail-value">{staff.subject || 'N/A'}</div></div>
                <div><div className="detail-label">Assigned Class</div><div className="detail-value">{staff.assignedClass || 'N/A'}</div></div>
                <div><div className="detail-label">Experience</div><div className="detail-value">{staff.experience || 'N/A'}</div></div>
                <div><div className="detail-label">Base Salary</div><div className="detail-value">₹{staff.salary || 0}</div></div>
                
                {role === 'Principal' && (
                  <div style={{ gridColumn: '1 / -1', background: 'rgba(99, 102, 241, 0.05)', padding: '16px', borderRadius: '12px', marginTop: '12px' }}>
                    <div className="detail-label" style={{ color: 'var(--primary-color)' }}>System Credentials (Admin Only)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '8px' }}>
                      <div>
                        <div className="detail-label">Login ID (Email)</div>
                        {isEditing ? (
                          <input type="email" className="glass-input" style={{ width: '100%' }} value={editData.email || ''} onChange={e => setEditData({...editData, email: e.target.value})} />
                        ) : (
                          <div className="detail-value" style={{ fontFamily: 'monospace' }}>{staff.email || 'N/A'}</div>
                        )}
                      </div>
                      <div>
                        <div className="detail-label">Password</div>
                        {isEditing ? (
                          <input type="text" className="glass-input" style={{ width: '100%' }} placeholder="******** (Type to change)" value={editData.password && !editData.password.startsWith('$2a$') && !editData.password.startsWith('$2b$') ? editData.password : ''} onChange={e => setEditData({...editData, password: e.target.value})} />
                        ) : (
                          <div className="detail-value" style={{ fontFamily: 'monospace' }}>********</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {staff.documents && staff.documents.length > 0 && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div className="detail-label">Documents</div>
                    <div className="detail-value" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {staff.documents.map((doc, idx) => (
                        <a key={idx} href={doc.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '6px 12px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'var(--primary)' }}>
                          {doc.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="glass-panel">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IndianRupee size={20} className="text-primary" /> Salary & Payroll Ledger
              </h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                {availableMonths.length > 0 && (
                  <select 
                    className="glass-input" 
                    style={{ width: 'auto', padding: '6px 12px', margin: 0 }}
                    value={filterMonth}
                    onChange={e => setFilterMonth(e.target.value)}
                  >
                    <option value="All">All Months</option>
                    {availableMonths.map(m => (
                      <option key={m} value={m}>
                        {new Date(m + "-01").toLocaleDateString('default', { month: 'short', year: 'numeric' })}
                      </option>
                    ))}
                  </select>
                )}
                {role === 'Principal' && (
                  <button className="btn-primary" style={{ background: 'var(--success)' }} onClick={() => setIsPaymentModalOpen(true)}>
                    <Plus size={16} /> Record Transaction
                  </button>
                )}
              </div>
            </div>

            <div className="glass-table-container">
              <table style={{ width: '100%', minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th style={{ whiteSpace: 'nowrap' }}>Date</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Credit (In)</th>
                    <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Debit (Out)</th>
                    {role === 'Principal' && <th style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {displayedRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No records found.</td>
                    </tr>
                  ) : displayedRows.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(t.date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {t.description}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>
                        {t.type === 'Income' || t.type === 'Discount' ? `₹${t.amount}` : '-'}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--danger)', fontWeight: 600 }}>
                        {t.type === 'Expense' || t.type === 'Charge' ? `₹${t.amount}` : '-'}
                      </td>
                      {role === 'Principal' && (
                        <td style={{ textAlign: 'center' }}>
                          <button className="icon-btn" onClick={() => { setDeleteTxnId(t.id || null); setIsDeleteTxnModalOpen(true); }} style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Staff Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setDeleteError(''); }} title="Delete Staff">
        <form onSubmit={handleDeleteStaff} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="alert-warning" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
            Warning: This action cannot be undone and will permanently remove this staff member from the system.
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

      {/* Payment / Ledger Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Transaction">
        <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Type</label>
              <select className="glass-input" value={newTxn.type} onChange={e => setNewTxn({...newTxn, type: e.target.value})}>
                <option value="Expense">Debit (Expense / Paid to Staff)</option>
                <option value="Income">Credit (Income / Deduction)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Category</label>
              <select className="glass-input" value={newTxn.category} onChange={e => setNewTxn({...newTxn, category: e.target.value})}>
                <option value="Salary">Salary</option>
                <option value="Bonus">Bonus</option>
                <option value="Deduction">Deduction</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Description</label>
            <input required type="text" className="glass-input" value={newTxn.description} onChange={e => setNewTxn({...newTxn, description: e.target.value})} placeholder="e.g. October Salary" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Amount (₹)</label>
            <input required type="number" min="1" className="glass-input" value={newTxn.amount} onChange={e => setNewTxn({...newTxn, amount: e.target.value})} placeholder="e.g. 15000" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Date</label>
            <input required type="datetime-local" className="glass-input" value={newTxn.date} onChange={e => setNewTxn({...newTxn, date: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsPaymentModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ background: 'var(--success)' }}>Record Entry</button>
          </div>
        </form>
      </Modal>

      {/* Delete Transaction Modal */}
      <Modal isOpen={isDeleteTxnModalOpen} onClose={() => { setIsDeleteTxnModalOpen(false); setDeleteTxnId(null); setDeleteTxnError(''); }} title="Delete Transaction">
        <form onSubmit={handleDeleteTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="alert-warning" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
            Warning: This action cannot be undone and will permanently remove this record from the system.
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Admin Password</label>
            <input required type="password" className="glass-input" value={deleteTxnPassword} onChange={e => setDeleteTxnPassword(e.target.value)} placeholder="Enter admin password" />
            {deleteTxnError && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>{deleteTxnError}</p>}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsDeleteTxnModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ background: 'var(--danger)' }}>Confirm Delete</button>
          </div>
        </form>
      </Modal>

    </motion.div>
  );
};

export default StaffProfile;
