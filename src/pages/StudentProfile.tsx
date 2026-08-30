import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IndianRupee, Plus, FileText, AlertTriangle, ArrowLeft, Camera, X, Edit, Save, Trash2, Printer } from 'lucide-react';
import { getStudentById, updateStudent, type StudentData } from '../services/studentService';
import { getClasses, type ClassData } from '../services/classService';
import { uploadImageToCloudinary } from '../lib/cloudinary';
import FeeReceiptPrintView from '../components/FeeReceiptPrintView';
import Cropper from 'react-easy-crop';
import { getTransactions, addTransaction, deleteTransaction, type TransactionData } from '../services/financeService';
import { getSchoolSettings, saveSchoolSettings } from '../services/settingsService';
import Modal from '../components/Modal';

const getISTDateTimeLocalString = () => {
  const now = new Date();
  const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  const yyyy = istTime.getFullYear();
  const mm = String(istTime.getMonth() + 1).padStart(2, '0');
  const dd = String(istTime.getDate()).padStart(2, '0');
  const hh = String(istTime.getHours()).padStart(2, '0');
  const min = String(istTime.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const getCroppedImg = (imageSrc: string, pixelCrop: any): Promise<File> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No 2d context');

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob((blob) => {
        if (!blob) return reject('Canvas is empty');
        const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg');
    };
    image.onerror = (e) => reject(e);
  });
};

const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authUser = JSON.parse(sessionStorage.getItem('authUser') || localStorage.getItem('authUser') || '{}');
  const role = authUser.role || '';
  const [student, setStudent] = useState<StudentData | null>(null);
  const [studentClass, setStudentClass] = useState<ClassData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<StudentData>>({});
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(4 / 5);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null);

  // Payment modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({ amount: '', description: '', paymentMethod: 'Cash' as 'Cash' | 'Bank Transfer' | 'UPI', date: getISTDateTimeLocalString() });

  // Charge modal
  const [isFineModalOpen, setIsFineModalOpen] = useState(false);
  const [printTransaction, setPrintTransaction] = useState<any>(null);
  const [newFine, setNewFine] = useState({ amount: '', description: '', type: 'Late Fine', date: getISTDateTimeLocalString() });


  // Month Filter
  const [filterMonth, setFilterMonth] = useState('All');

  // Delete transaction
  const [deleteTxnId, setDeleteTxnId] = useState<string | null>(null);
  const [isDeleteTxnModalOpen, setIsDeleteTxnModalOpen] = useState(false);
  const [deleteTxnPassword, setDeleteTxnPassword] = useState('');
  const [deleteTxnError, setDeleteTxnError] = useState('');

  // Custom charge types
  const [customChargeTypes, setCustomChargeTypes] = useState<string[]>([]);
  const [showNewChargeTypeInput, setShowNewChargeTypeInput] = useState(false);
  const [newChargeTypeName, setNewChargeTypeName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const studentData = await getStudentById(id);
        if (studentData) {
          setStudent(studentData);
          setEditData(studentData);
          
          const classes = await getClasses();
          const cls = classes.find(c => c.id === studentData.classId);
          if (cls) setStudentClass(cls);

          const txns = await getTransactions({ studentId: id });
          setTransactions(txns);
          
          const settings = await getSchoolSettings();
          if (settings?.customChargeTypes) setCustomChargeTypes(settings.customChargeTypes);
        }
      } catch (error) {
        console.error("Error fetching student details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  
  const handlePrintReceipt = (txn: any) => {
    setPrintTransaction(txn);
    setTimeout(() => {
      window.print();
      setPrintTransaction(null);
    }, 500);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newPayment.amount) return;
    try {
      await addTransaction({
        type: 'Income',
        category: 'Fee Collection',
        amount: Math.abs(Number(newPayment.amount)),
        date: newPayment.date,
        description: newPayment.description || 'Fee Payment',
        paymentMethod: newPayment.paymentMethod,
        studentId: id
      });
      setIsPaymentModalOpen(false);
      setNewPayment({ amount: '', description: '', paymentMethod: 'Cash', date: getISTDateTimeLocalString() });
      const txns = await getTransactions({ studentId: id });
      setTransactions(txns);
    } catch (error) {
      console.error("Error recording payment", error);
    }
  };

  const handleAddChargeType = async () => {
    if (newChargeTypeName.trim()) {
      const updated = [...customChargeTypes, newChargeTypeName.trim()];
      setCustomChargeTypes(updated);
      setNewChargeTypeName('');
      setShowNewChargeTypeInput(false);
      try {
        let settings = await getSchoolSettings();
        if (!settings) settings = { schoolName: 'Public School', shortName: 'School', email: '', phone: '', address: '' };
        await saveSchoolSettings({ ...settings, customChargeTypes: updated });
      } catch (e) {
        console.error("Error saving charge type", e);
      }
    }
  };

  const handleAddCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newFine.amount) return;

    try {
      await addTransaction({
        type: newFine.type === 'Discount' ? 'Discount' : 'Charge',
        category: newFine.type === 'Discount' ? 'Discount' : 'Custom Fine / Charge',
        amount: Math.abs(Number(newFine.amount)),
        date: newFine.date,
        description: `[${newFine.type}] ${newFine.description}`,
        studentId: id
      });
      setIsFineModalOpen(false);
      setNewFine({ amount: '', description: '', type: 'Late Fine', date: getISTDateTimeLocalString() });
      const txns = await getTransactions({ studentId: id });
      setTransactions(txns);
    } catch (error) {
      console.error("Error adding charge", error);
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
      const txns = await getTransactions({ studentId: id! });
      setTransactions(txns);
    } catch (error) {
      console.error("Error deleting transaction", error);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditData(student || {});
      setNewPhotoFile(null);
      setNewPhotoPreview(null);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    if (!id || !student) return;
    setSaving(true);
    try {
      let finalPhotoUrl = editData.photoUrl;
      
      if (newPhotoFile) {
        finalPhotoUrl = await uploadImageToCloudinary(newPhotoFile);
      } 
      else if (editData.photoUrl === '') {
         finalPhotoUrl = '';
      }

      const updatedData = { ...editData, photoUrl: finalPhotoUrl };
      if (!updatedData.password || updatedData.password.startsWith('$2a$') || updatedData.password.startsWith('$2b$')) {
        delete updatedData.password;
      }

      await updateStudent(id, updatedData);
      setStudent(updatedData as StudentData);
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setRawImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onCropComplete = (_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSaveCrop = async () => {
    if (rawImage && croppedAreaPixels) {
      try {
        const croppedImageFile = await getCroppedImg(rawImage, croppedAreaPixels);
        setNewPhotoFile(croppedImageFile);
        setNewPhotoPreview(URL.createObjectURL(croppedImageFile));
        setShowCropper(false);
        setRawImage(null);
      } catch (e) {
        console.error("Error cropping image", e);
      }
    }
  };

  const handleRemovePhoto = () => {
    setNewPhotoFile(null);
    setNewPhotoPreview(null);
    setEditData({ ...editData, photoUrl: '' });
  };

  if (loading) return <div>Loading Profile...</div>;
  if (!student) return <div>Student not found.</div>;

  const previousDues = student.previousDues || 0;
  const previousPaidAmount = student.previousPaidAmount || 0;
  const previousPending = previousDues - previousPaidAmount;

  // Filter out any transaction that has 'Previous' in it if we want, but since they are added manually,
  // we just use the transactions array.
  
  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const ledgerRows = sortedTransactions;
  
  const availableMonths = Array.from(new Set(ledgerRows.map(t => t.date.substring(0, 7)))).sort().reverse();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex-responsive" style={{ marginBottom: "24px" }}>
        <button onClick={() => navigate(-1)} className="btn-secondary" style={{ background: 'transparent', border: 'none', padding: 0 }}>
          <ArrowLeft size={20} /> Back to Directory
        </button>
        {isEditing ? (
          <div className="staff-action-buttons">
             <button className="btn-secondary" onClick={handleEditToggle}>Cancel</button>
             <button className="btn-primary" onClick={handleSaveProfile} disabled={saving}>
               {saving ? 'Saving...' : <><Save size={16}/> Save Changes</>}
             </button>
          </div>
        ) : ['Principal', 'Manager', 'Super Admin'].includes(role) && (
          <button className="btn-primary" onClick={handleEditToggle}>
            <Edit size={16} /> Edit Profile
          </button>
        )}
      </div>

      <div className="profile-layout">
        
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
                  <img src={newPhotoPreview || editData.photoUrl} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {isEditing && (
                    <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.5)', padding: '4px', fontSize: '0.7rem' }}>
                       <Camera size={14} /> Change
                    </div>
                  )}
                </>
              ) : (
                isEditing ? <Camera size={32} /> : (student.firstName?.[0] || 'U')
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
                <input className="glass-input" value={editData.firstName || ''} onChange={e => setEditData({...editData, firstName: e.target.value})} placeholder="First Name" />
                <input className="glass-input" value={editData.lastName || ''} onChange={e => setEditData({...editData, lastName: e.target.value})} placeholder="Last Name" />
                <select className="glass-input" value={editData.status} onChange={e => setEditData({...editData, status: e.target.value as 'Active' | 'Inactive'})}>
                   <option value="Active">Active</option>
                   <option value="Inactive">Inactive</option>
                </select>
              </div>
            ) : (
              <>
                <h2 style={{ margin: '0 0 8px 0' }}>{student.firstName} {student.lastName}</h2>
                <p style={{ color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
                  {studentClass?.className} - {student.sectionId} | Roll: {student.rollNumber} 
                  {student.admissionNo ? ` | Adm No: ${student.admissionNo}` : ''}
                </p>
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <span className={`badge ${student.status === 'Active' ? 'success' : 'danger'}`}>{student.status}</span>
                  {student.transportRoute && <span className="badge warning">Bus: {student.transportRoute}</span>}
                  {student.admissionType && (
                    <span className={`badge ${student.admissionType === 'New' ? 'warning' : 'success'}`}>
                      {student.admissionType === 'New' ? '🆕 New' : '🔄 Old'}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="glass-panel">
            <h3 style={{ margin: '0 0 16px 0' }}>Detailed Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="info-row" style={{ display: "flex", gap: "12px", alignItems: "center", color: "var(--text-muted)" }}>
                <span style={{ width: '120px', fontWeight: 500 }}>Admission No</span>
                {isEditing ? 
                  <input className="glass-input" style={{flex: 1, padding: '4px 8px'}} value={editData.admissionNo || ''} onChange={e => setEditData({...editData, admissionNo: e.target.value})} placeholder="Admission No" /> 
                  : <span>{student.admissionNo || 'N/A'}</span>
                }
              </div>
              <div className="info-row" style={{ display: "flex", gap: "12px", alignItems: "center", color: "var(--text-muted)" }}>
                <span style={{ width: '120px', fontWeight: 500 }}>Father Name</span>
                {isEditing ? 
                  <input className="glass-input" style={{flex: 1, padding: '4px 8px'}} value={editData.parentName || ''} onChange={e => setEditData({...editData, parentName: e.target.value})} placeholder="Father's Name" /> 
                  : <span>{student.parentName || 'N/A'}</span>
                }
              </div>
              <div className="info-row" style={{ display: "flex", gap: "12px", alignItems: "center", color: "var(--text-muted)" }}>
                <span style={{ width: '120px', fontWeight: 500 }}>Mother Name</span>
                {isEditing ? 
                  <input className="glass-input" style={{flex: 1, padding: '4px 8px'}} value={editData.motherName || ''} onChange={e => setEditData({...editData, motherName: e.target.value})} placeholder="Mother's Name" /> 
                  : <span>{student.motherName || 'N/A'}</span>
                }
              </div>
              <div className="info-row" style={{ display: "flex", gap: "12px", alignItems: "center", color: "var(--text-muted)" }}>
                <span style={{ width: '120px', fontWeight: 500 }}>Primary Phone</span>
                {isEditing ? 
                  <input className="glass-input" style={{flex: 1, padding: '4px 8px'}} value={editData.parentPhone || ''} onChange={e => setEditData({...editData, parentPhone: e.target.value})} placeholder="Parent Phone" /> 
                  : <span>{student.parentPhone || 'N/A'}</span>
                }
              </div>
              <div className="info-row" style={{ display: "flex", gap: "12px", alignItems: "center", color: "var(--text-muted)" }}>
                <span style={{ width: '120px', fontWeight: 500 }}>Emergency Contact</span>
                {isEditing ? 
                  <input className="glass-input" style={{flex: 1, padding: '4px 8px'}} value={editData.emergencyContact || ''} onChange={e => setEditData({...editData, emergencyContact: e.target.value})} placeholder="Emergency Contact" /> 
                  : <span>{student.emergencyContact || 'N/A'}</span>
                }
              </div>
              <div className="info-row" style={{ display: "flex", gap: "12px", alignItems: "center", color: "var(--text-muted)" }}>
                <span style={{ width: '120px', fontWeight: 500 }}>Email Address</span>
                {isEditing ? 
                  <input type="email" className="glass-input" style={{flex: 1, padding: '4px 8px'}} value={editData.email || ''} onChange={e => setEditData({...editData, email: e.target.value})} placeholder="Email Address" /> 
                  : <span>{student.email || 'N/A'}</span>
                }
              </div>
              <div className="info-row" style={{ display: "flex", gap: "12px", alignItems: "center", color: "var(--text-muted)" }}>
                <span style={{ width: '120px', fontWeight: 500 }}>Address</span>
                {isEditing ? 
                  <input className="glass-input" style={{flex: 1, padding: '4px 8px'}} value={editData.address || ''} onChange={e => setEditData({...editData, address: e.target.value})} placeholder="Address" /> 
                  : <span>{student.address || 'N/A'}</span>
                }
              </div>
              <div className="info-row" style={{ display: "flex", gap: "12px", alignItems: "center", color: "var(--text-muted)" }}>
                <span style={{ width: '120px', fontWeight: 500 }}>Aadhar Number</span>
                {isEditing ? 
                  <input className="glass-input" style={{flex: 1, padding: '4px 8px'}} value={editData.aadharNumber || ''} onChange={e => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length > 12) val = val.substring(0, 12);
                    val = val.match(/.{1,4}/g)?.join(' ') || val;
                    setEditData({...editData, aadharNumber: val});
                  }} placeholder="Aadhar Number" /> 
                  : <span>{student.aadharNumber || 'N/A'}</span>
                }
              </div>
              
              {role === 'Super Admin' && (
                <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '16px', borderRadius: '12px', marginTop: '16px' }}>
                  <div style={{ color: 'var(--primary-color)', fontWeight: 600, marginBottom: '12px' }}>System Credentials (Admin Only)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ width: '120px', fontWeight: 500, color: 'var(--text-muted)' }}>Login ID (Email)</span>
                      {isEditing ? (
                        <input type="email" className="glass-input" style={{ flex: 1, padding: '4px 8px' }} value={editData.email || ''} onChange={e => setEditData({...editData, email: e.target.value})} placeholder="Email ID" />
                      ) : (
                        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{student.email || 'N/A'}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ width: '120px', fontWeight: 500, color: 'var(--text-muted)' }}>Password</span>
                      {isEditing ? (
                        <input type="text" className="glass-input" style={{ flex: 1, padding: '4px 8px' }} placeholder="******** (Type to change)" value={editData.password && !editData.password.startsWith('$2a$') && !editData.password.startsWith('$2b$') ? editData.password : ''} onChange={e => setEditData({...editData, password: e.target.value})} />
                      ) : (
                        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>********</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Ledgers and Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {(student.admissionType === 'Old' || previousDues > 0 || previousPaidAmount > 0) && (
            <div className="glass-panel" style={{ background: 'rgba(99?02,241,0.05)', border: '1px solid rgba(99?02,241,0.2)' }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--primary-color)' }}>📋 Previous Session History</h4>
              <div className="dashboard-grid" style={{ gap: '12px' }}>
                <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Session</span><br/><strong>{student.previousSession || 'N/A'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Previous Dues</span><br/><strong style={{ color: 'var(--danger)' }}>₹{previousDues}</strong></div>
                <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Previous Paid</span><br/><strong style={{ color: 'var(--success)' }}>₹{previousPaidAmount}</strong></div>
                <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Net Old Pending</span><br/><strong style={{ color: previousPending > 0 ? 'var(--danger)' : (previousPending < 0 ? 'var(--success)' : 'inherit') }}>
                  {previousPending > 0 ? `₹${previousPending}` : (previousPending < 0 ? `Advance: ₹${Math.abs(previousPending)}` : '₹0')}
                </strong></div>
              </div>
            </div>
          )}

          {/* Fee Overview */}
          <div className="glass-panel">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IndianRupee size={20} className="text-primary" /> Financial Ledger
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
                {['Principal', 'Manager', 'Super Admin'].includes(role) && (
                  <>
                    <button className="btn-primary" style={{ background: 'var(--success)' }} onClick={() => setIsPaymentModalOpen(true)}>
                      <Plus size={16} /> Record Payment
                    </button>
                    <button className="btn-primary" style={{ background: 'var(--danger)' }} onClick={() => setIsFineModalOpen(true)}>
                      <Plus size={16} /> Add Charge
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {(() => {
              const displayedRows = filterMonth === 'All' 
                ? ledgerRows.slice().reverse() 
                : ledgerRows.slice().reverse().filter(t => t.date.startsWith(filterMonth));

              if (displayedRows.length === 0) {
                return <p style={{ color: 'var(--text-muted)' }}>No transactions or charges found for this period.</p>;
              }

              return (
                <div className="glass-table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '600px' }}>
                    <thead>
                      <tr>
                        <th style={{ whiteSpace: 'nowrap' }}>Date</th>
                        <th>Description</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Charge</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Paid</th>
                          <th style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>Balance</th>
                        {['Principal', 'Manager', 'Super Admin'].includes(role) && <th style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {displayedRows.map(t => (
                      <tr key={t.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>{new Date(t.date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        <td>
                          {t.description}
                          {t.type === 'Discount' && <span className="badge success" style={{marginLeft: '8px', fontSize: '0.7rem'}}>Discount</span>}
                        </td>
                        <td style={{ color: 'var(--danger)', fontWeight: 500 }}>
                          {t.type === 'Charge' ? `₹${t.amount}` : '-'}
                        </td>
                        <td style={{ color: 'var(--success)', fontWeight: 500 }}>
                          {t.type === 'Income' || t.type === 'Discount' ? `₹${t.amount}` : '-'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            {t.type === 'Income' && (
                                <button className="icon-btn" onClick={() => handlePrintReceipt(t)} style={{ color: 'var(--primary-color)', background: 'transparent', border: 'none', cursor: 'pointer' }} title="Print Receipt">
                                  <Printer size={16} />
                                </button>
                              )}
                              {['Principal', 'Manager', 'Super Admin'].includes(role) && (
                                <button className="icon-btn" onClick={() => { setDeleteTxnId(t.id || null); setIsDeleteTxnModalOpen(true); }} style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                  <Trash2 size={16} />
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              );
            })()}
          </div>

          {/* Documents */}
          <div className="glass-panel">
            <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} className="text-primary" /> Documents
            </h3>
            {student.documents && student.documents.length > 0 ? (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {student.documents.map((doc, idx) => (
                  <a key={idx} href={doc.url} target="_blank" rel="noreferrer" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} /> {doc.name}
                  </a>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No documents uploaded.</p>
            )}
          </div>

        </div>
      </div>

      {/* Payment Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Payment">
        <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Amount (₹)</label>
            <input required type="number" className="glass-input" value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} placeholder="e.g. 1500" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Description</label>
            <input type="text" className="glass-input" value={newPayment.description} onChange={e => setNewPayment({...newPayment, description: e.target.value})} placeholder="e.g. Term 1 Fee" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Payment Method</label>
            <select className="glass-input" value={newPayment.paymentMethod} onChange={e => setNewPayment({...newPayment, paymentMethod: e.target.value as any})}>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Date</label>
            <input required type="datetime-local" className="glass-input" value={newPayment.date} onChange={e => setNewPayment({...newPayment, date: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsPaymentModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ background: 'var(--success)' }}>Record Payment</button>
          </div>
        </form>
      </Modal>

      {/* Charge / Fine / Discount Modal */}
      <Modal isOpen={isFineModalOpen} onClose={() => setIsFineModalOpen(false)} title="Add Charge or Discount">
        <form onSubmit={handleAddCharge} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="alert-warning" style={{ background: 'rgba(245?58?1,0.1)', color: 'var(--warning)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', gap: '8px' }}>
            <AlertTriangle size={18} /> Charges increase pending dues. Discounts decrease pending dues.
          </div>
          
          {!showNewChargeTypeInput ? (
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Type</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select className="glass-input" style={{ flex: 1 }} value={newFine.type} onChange={e => setNewFine({...newFine, type: e.target.value})}>
                  <option>Base Class Fee</option>
                  <option>Previous Dues</option>
                  <option>Late Fine</option>
                  <option>Damage Fine</option>
                  <option>Library Fine</option>
                  <option>Discount</option>
                  {customChargeTypes.map(c => <option key={c}>{c}</option>)}
                </select>
                <button type="button" className="btn-secondary" onClick={() => setShowNewChargeTypeInput(true)}>+</button>
              </div>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>New Custom Type</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" className="glass-input" style={{ flex: 1 }} value={newChargeTypeName} onChange={e => setNewChargeTypeName(e.target.value)} placeholder="e.g. Bus Fee" />
                <button type="button" className="btn-primary" onClick={handleAddChargeType}>Add</button>
                <button type="button" className="btn-secondary" onClick={() => setShowNewChargeTypeInput(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Description</label>
            <input required type="text" className="glass-input" value={newFine.description} onChange={e => setNewFine({...newFine, description: e.target.value})} placeholder="e.g. September Fee / Books" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Amount (₹)</label>
            <input required type="number" className="glass-input" value={newFine.amount} onChange={e => setNewFine({...newFine, amount: e.target.value})} placeholder="e.g. 500" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Date</label>
            <input required type="datetime-local" className="glass-input" value={newFine.date} onChange={e => setNewFine({...newFine, date: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsFineModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ background: 'var(--danger)' }}>Record Entry</button>
          </div>
        </form>
      </Modal>


      {/* Delete Transaction Modal */}
      <Modal isOpen={isDeleteTxnModalOpen} onClose={() => { setIsDeleteTxnModalOpen(false); setDeleteTxnId(null); setDeleteTxnError(''); }} title="Delete Transaction">
        <form onSubmit={handleDeleteTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="alert-warning" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
            Warning: This action cannot be undone and will affect financial reports.
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Admin Password</label>
            <input required type="password" className="glass-input" value={deleteTxnPassword} onChange={e => setDeleteTxnPassword(e.target.value)} placeholder="Enter admin password" />
            {deleteTxnError && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>{deleteTxnError}</p>}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsDeleteTxnModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ background: 'var(--danger)' }}>Delete Transaction</button>
          </div>
        </form>
      </Modal>

      {/* Cropper Modal */}
      {showCropper && rawImage && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ width: '90%', maxWidth: '500px', background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#333' }}>Crop Photo</h3>
              <button onClick={() => { setShowCropper(false); setRawImage(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><X size={20} /></button>
            </div>
            
            <div style={{ position: 'relative', width: '100%', height: '350px', background: '#333' }}>
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
                <button className="btn-secondary" style={{ padding: '4px 12px', background: aspect === 1 ? 'var(--primary)' : '', color: aspect === 1 ? 'white' : '' }} onClick={() => setAspect(1)}>1:1</button>
                <button className="btn-secondary" style={{ padding: '4px 12px', background: aspect === 3/4 ? 'var(--primary)' : '', color: aspect === 3/4 ? 'white' : '' }} onClick={() => setAspect(3/4)}>3:4</button>
                <button className="btn-secondary" style={{ padding: '4px 12px', background: aspect === 4/3 ? 'var(--primary)' : '', color: aspect === 4/3 ? 'white' : '' }} onClick={() => setAspect(4/3)}>4:3</button>
                <button className="btn-secondary" style={{ padding: '4px 12px', background: aspect === 4/5 ? 'var(--primary)' : '', color: aspect === 4/5 ? 'white' : '' }} onClick={() => setAspect(4/5)}>4:5</button>
                <button className="btn-secondary" style={{ padding: '4px 12px', background: aspect === 16/9 ? 'var(--primary)' : '', color: aspect === 16/9 ? 'white' : '' }} onClick={() => setAspect(16/9)}>16:9</button>
              </div>

              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: '#555' }}>Zoom</label>
              <input 
                type="range" 
                value={zoom} 
                min={1} 
                max={3} 
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))} 
                style={{ width: '100%', marginBottom: '16px' }} 
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={() => { setShowCropper(false); setRawImage(null); }}>Cancel</button>
                <button className="btn-primary" onClick={handleSaveCrop}>Save Crop</button>
              </div>
            </div>
          </div>
        </div>
      )}

          {printTransaction && (
        <FeeReceiptPrintView 
          student={student} 
          transaction={printTransaction} 
          classNameStr={studentClass?.className || 'Unknown'} 
        />
      )}
    </motion.div>
  );
};

export default StudentProfile;
