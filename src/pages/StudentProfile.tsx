import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, Mail, IndianRupee, Plus, FileText, AlertTriangle, ArrowLeft, Camera, X, Edit, Save } from 'lucide-react';
import { getStudentById, updateStudent, type StudentData } from '../services/studentService';
import { getClasses, type ClassData } from '../services/classService';
import { uploadImageToCloudinary } from '../lib/cloudinary';
import Cropper from 'react-easy-crop';

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
import { getTransactions, addTransaction, type TransactionData } from '../services/financeService';
import Modal from '../components/Modal';

const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [studentClass, setStudentClass] = useState<ClassData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<StudentData>>({});
  const [saving, setSaving] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(4 / 5);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null);

  const [isFineModalOpen, setIsFineModalOpen] = useState(false);
  const [newFine, setNewFine] = useState({ amount: '', description: '', type: 'Late Fine' });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const studentData = await getStudentById(id);
        if (studentData) {
          setStudent(studentData);
          setEditData(studentData);
          
          // Fetch class for fee structure
          const classes = await getClasses();
          const cls = classes.find(c => c.id === studentData.classId);
          if (cls) setStudentClass(cls);

          // Fetch student specific transactions (both payments and fines)
          const txns = await getTransactions({ studentId: id });
          setTransactions(txns);
        }
      } catch (error) {
        console.error("Error fetching student details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddFine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newFine.amount) return;

    try {
      await addTransaction({
        type: 'Income',
        category: 'Custom Fine / Charge',
        amount: -Math.abs(Number(newFine.amount)), // Negative income represents a charge due
        date: new Date().toISOString().split('T')[0],
        description: `[${newFine.type}] ${newFine.description}`,
        paymentMethod: 'Cash', // N/A
        studentId: id
      });
      setIsFineModalOpen(false);
      setNewFine({ amount: '', description: '', type: 'Late Fine' });
      // Refresh txns
      const txns = await getTransactions({ studentId: id });
      setTransactions(txns);
    } catch (error) {
      console.error("Error adding fine", error);
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

  // Calculate Due logic:
  // Base fee from class
  let baseFeeTotal = 0;
  if (studentClass && studentClass.fees) {
    baseFeeTotal = studentClass.fees.reduce((sum, f) => sum + f.amount, 0);
  }

  // Fees paid (+ amount in Income), Fines charged (- amount in Income)
  const totalPaid = transactions
    .filter(t => t.type === 'Income' && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const customCharges = transactions
    .filter(t => t.type === 'Income' && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const pendingDues = (baseFeeTotal + customCharges) - totalPaid;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} className="btn-secondary" style={{ background: 'transparent', border: 'none', padding: 0 }}>
          <ArrowLeft size={20} /> Back to Directory
        </button>
        {isEditing ? (
          <div style={{ display: 'flex', gap: '12px' }}>
             <button className="btn-secondary" onClick={handleEditToggle}>Cancel</button>
             <button className="btn-primary" onClick={handleSaveProfile} disabled={saving}>
               {saving ? 'Saving...' : <><Save size={16}/> Save Changes</>}
             </button>
          </div>
        ) : (
          <button className="btn-primary" onClick={handleEditToggle}>
            <Edit size={16} /> Edit Profile
          </button>
        )}
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
                <input className="glass-input" value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} placeholder="First Name" />
                <input className="glass-input" value={editData.lastName} onChange={e => setEditData({...editData, lastName: e.target.value})} placeholder="Last Name" />
                <select className="glass-input" value={editData.status} onChange={e => setEditData({...editData, status: e.target.value as 'Active' | 'Inactive'})}>
                   <option value="Active">Active</option>
                   <option value="Inactive">Inactive</option>
                </select>
              </div>
            ) : (
              <>
                <h2 style={{ margin: '0 0 8px 0' }}>{student.firstName} {student.lastName}</h2>
                <p style={{ color: 'var(--text-muted)', margin: '0 0 16px 0' }}>{studentClass?.className} - {student.sectionId} | Roll: {student.rollNumber}</p>
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <span className={`badge ${student.status === 'Active' ? 'success' : 'danger'}`}>{student.status}</span>
                  {student.transportRoute && <span className="badge warning">Bus: {student.transportRoute}</span>}
                </div>
              </>
            )}
          </div>

          <div className="glass-panel">
            <h3 style={{ margin: '0 0 16px 0' }}>Contact Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-muted)' }}>
                <User size={18} /> 
                {isEditing ? 
                  <input className="glass-input" style={{flex: 1, padding: '4px 8px'}} value={editData.parentName || ''} onChange={e => setEditData({...editData, parentName: e.target.value})} placeholder="Parent Name" /> 
                  : <span>Parent: {student.parentName || 'N/A'}</span>
                }
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-muted)' }}>
                <Phone size={18} /> 
                {isEditing ? 
                  <input className="glass-input" style={{flex: 1, padding: '4px 8px'}} value={editData.parentPhone || ''} onChange={e => setEditData({...editData, parentPhone: e.target.value})} placeholder="Parent Phone" /> 
                  : <span>{student.parentPhone || 'N/A'}</span>
                }
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-muted)' }}>
                <Mail size={18} /> 
                {isEditing ? 
                  <input className="glass-input" style={{flex: 1, padding: '4px 8px'}} value={editData.email || ''} onChange={e => setEditData({...editData, email: e.target.value})} placeholder="Email Address" /> 
                  : <span>{student.email || 'N/A'}</span>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Ledgers and Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Fee Overview */}
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IndianRupee size={20} className="text-primary" /> Financial Ledger
              </h3>
              <button className="btn-secondary" onClick={() => setIsFineModalOpen(true)}>
                <Plus size={16} /> Add Fine/Charge
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
               <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)' }}>
                 <div style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Base Class Fee</div>
                 <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>₹{baseFeeTotal}</div>
               </div>
               <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)' }}>
                 <div style={{ fontSize: '0.85rem', color: 'var(--success)' }}>Total Paid</div>
                 <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>₹{totalPaid}</div>
               </div>
               <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)' }}>
                 <div style={{ fontSize: '0.85rem', color: 'var(--danger)' }}>Pending Dues</div>
                 <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>₹{pendingDues}</div>
               </div>
            </div>

            <h4 style={{ margin: '0 0 12px 0' }}>Recent Transactions</h4>
            {transactions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No transactions or charges recorded.</p>
            ) : (
              <div className="glass-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Method</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t.id}>
                        <td>{new Date(t.date).toLocaleDateString()}</td>
                        <td>{t.description}</td>
                        <td>{t.amount > 0 ? t.paymentMethod : 'Charge'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: t.amount > 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {t.amount > 0 ? `+ ₹${t.amount}` : `- ₹${Math.abs(t.amount)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

      <Modal isOpen={isFineModalOpen} onClose={() => setIsFineModalOpen(false)} title="Add Custom Charge / Fine">
        <form onSubmit={handleAddFine} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="alert-warning" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', gap: '8px' }}>
            <AlertTriangle size={18} /> This will add to the student's pending dues.
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Charge Type</label>
            <select className="glass-input" value={newFine.type} onChange={e => setNewFine({...newFine, type: e.target.value})}>
              <option>Late Fine</option>
              <option>Damage Fine</option>
              <option>Library Fine</option>
              <option>Custom Charge</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Description</label>
            <input required type="text" className="glass-input" value={newFine.description} onChange={e => setNewFine({...newFine, description: e.target.value})} placeholder="e.g. Broken lab equipment" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Amount (₹)</label>
            <input required type="number" className="glass-input" value={newFine.amount} onChange={e => setNewFine({...newFine, amount: e.target.value})} placeholder="e.g. 500" />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsFineModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ background: 'var(--danger)' }}>Add Charge</button>
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
              <h3 style={{ margin: 0 }}>Crop Photo</h3>
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

    </motion.div>
  );
};

export default StudentProfile;
