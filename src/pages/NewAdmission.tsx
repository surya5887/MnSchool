import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Upload, Save, FileText, Camera, Check, Plus, Trash2, X } from 'lucide-react';
import { addStudent, type StudentData } from '../services/studentService';
import { getClasses, type ClassData } from '../services/classService';
import { getVehicles } from '../services/transportService';
import { getSchoolSettings, saveSchoolSettings } from '../services/settingsService';
import { uploadImageToCloudinary } from '../lib/cloudinary';
import { useNavigate } from 'react-router-dom';
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

const NewAdmission: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const birthCertInputRef = useRef<HTMLInputElement>(null);
  const tcInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<StudentData>>({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Male',
    classId: '',
    sectionId: '',
    feeGroup: 'General Fee Category',
    transportRoute: 'Not Required',
    aadharNumber: '',
    bloodGroup: '',
    parentName: '',
    parentPhone: '',
    email: '',
    status: 'Active'
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [birthCertFile, setBirthCertFile] = useState<File | null>(null);
  const [tcFile, setTcFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [routes, setRoutes] = useState<string[]>([]);
  
  // Custom Docs State
  const [customDocs, setCustomDocs] = useState<{id: string, name: string, file: File | null}[]>([]);
  const [newDocName, setNewDocName] = useState('');
  const [showNewDocInput, setShowNewDocInput] = useState(false);
  const [activeCustomDocId, setActiveCustomDocId] = useState<string | null>(null);
  const customDocInputRef = useRef<HTMLInputElement>(null);

  // Cropper state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getClasses();
        setClasses(data);
        if (data.length > 0 && !formData.classId) {
          setFormData(prev => ({
            ...prev, 
            classId: data[0].className,
            sectionId: data[0].sections[0] || ''
          }));
        }
      } catch (error) {
        console.error("Error fetching classes", error);
      }
    };
    const fetchRoutes = async () => {
      try {
        const vehicles = await getVehicles();
        const uniqueRoutes = Array.from(new Set(vehicles.map(v => v.route).filter(Boolean)));
        setRoutes(uniqueRoutes);
      } catch (error) {
        console.error("Error fetching routes", error);
      }
    };
    const fetchSettings = async () => {
      try {
        const settings = await getSchoolSettings();
        if (settings?.admissionDocuments) {
          setCustomDocs(settings.admissionDocuments.map(name => ({ id: Date.now().toString() + Math.random(), name, file: null })));
        }
      } catch(error) {
        console.error("Error fetching settings", error);
      }
    };
    fetchClasses();
    fetchRoutes();
    fetchSettings();
  }, []);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClassName = e.target.value;
    const selectedClass = classes.find(c => c.className === selectedClassName);
    setFormData(prev => ({
      ...prev,
      classId: selectedClassName,
      sectionId: selectedClass?.sections[0] || ''
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    
    if (name === 'aadharNumber') {
      let val = value.replace(/\D/g, '');
      if (val.length > 12) val = val.substring(0, 12);
      value = val.match(/.{1,4}/g)?.join(' ') || val;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
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
    // reset input value so selecting the same file again triggers change
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const onCropComplete = (_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSaveCrop = async () => {
    if (rawImage && croppedAreaPixels) {
      try {
        const croppedImageFile = await getCroppedImg(rawImage, croppedAreaPixels);
        setPhotoFile(croppedImageFile);
        setPhotoPreview(URL.createObjectURL(croppedImageFile));
        setShowCropper(false);
        setRawImage(null);
      } catch (e) {
        console.error("Error cropping image", e);
      }
    }
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    setRawImage(null);
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleCustomDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeCustomDocId) {
      const file = e.target.files[0];
      setCustomDocs(customDocs.map(doc => doc.id === activeCustomDocId ? {...doc, file} : doc));
    }
    setActiveCustomDocId(null);
    if(customDocInputRef.current) customDocInputRef.current.value = '';
  };

  const handleAddCustomDoc = async () => {
    if(newDocName.trim()){
      const newDocs = [...customDocs, {id: Date.now().toString(), name: newDocName, file: null}];
      setCustomDocs(newDocs);
      setNewDocName('');
      setShowNewDocInput(false);
      
      try {
        let settings = await getSchoolSettings();
        if (!settings) settings = { schoolName: 'Public School', shortName: 'School', email: '', phone: '', address: '' };
        await saveSchoolSettings({ ...settings, admissionDocuments: newDocs.map(d => d.name) });
      } catch (e) {
        console.error("Error saving global document setting", e);
      }
    }
  };

  const handleDeleteCustomDoc = async (id: string) => {
    const newDocs = customDocs.filter(d => d.id !== id);
    setCustomDocs(newDocs);
    try {
      let settings = await getSchoolSettings();
      if (!settings) settings = { schoolName: 'Public School', shortName: 'School', email: '', phone: '', address: '' };
      await saveSchoolSettings({ ...settings, admissionDocuments: newDocs.map(d => d.name) });
    } catch (e) {
      console.error("Error deleting global document setting", e);
    }
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.classId || !formData.sectionId) {
      alert("Please fill in the required fields (First Name, Last Name, Class, Section)");
      return;
    }

    setLoading(true);
    try {
      let photoUrl = '';
      if (photoFile) {
        photoUrl = await uploadImageToCloudinary(photoFile);
      }

      const documents: { name: string; url: string }[] = [];
      if (birthCertFile) {
        const url = await uploadImageToCloudinary(birthCertFile);
        documents.push({ name: 'Birth Certificate', url });
      }
      if (tcFile) {
        const url = await uploadImageToCloudinary(tcFile);
        documents.push({ name: 'TC / Marksheet', url });
      }
      
      for (const doc of customDocs) {
        if (doc.file) {
          const url = await uploadImageToCloudinary(doc.file);
          documents.push({ name: doc.name, url });
        }
      }

      const rollNumber = Math.floor(Math.random() * 100) + 1;

      const newStudent: Omit<StudentData, 'id'> = {
        ...formData as Omit<StudentData, 'id'>,
        photoUrl,
        documents,
        rollNumber,
        admissionDate: new Date().toISOString(),
      };

      await addStudent(newStudent);
      
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        navigate('/students');
      }, 2000);

    } catch (error) {
      console.error("Error adding student:", error);
      alert("Failed to add student. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title"><UserPlus size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> New Admission</h1>
        <p className="page-subtitle">Enroll a new student into the system with full digital records.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        
        {/* Left Column - Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel">
            <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={18} /> Basic Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="glass-input" placeholder="e.g. Rahul" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="glass-input" placeholder="e.g. Kumar" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="glass-input" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="glass-input">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="glass-panel">
            <h3 style={{ margin: '0 0 20px 0' }}>Academic & Fee Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Admission to Class *</label>
                <select name="classId" value={formData.classId} onChange={handleClassChange} className="glass-input">
                  {classes.map(c => <option key={c.id} value={c.className}>{c.className}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Section *</label>
                <select name="sectionId" value={formData.sectionId} onChange={handleInputChange} className="glass-input">
                  {classes.find(c => c.className === formData.classId)?.sections.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Fee Group Assignment</label>
                <select name="feeGroup" value={formData.feeGroup} onChange={handleInputChange} className="glass-input">
                  <option>General Fee Category</option>
                  <option>RTE Quota (Free)</option>
                  <option>Staff Child (50% Off)</option>
                </select>
              </div>
              {routes.length > 0 && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Transport Route</label>
                  <select name="transportRoute" value={formData.transportRoute} onChange={handleInputChange} className="glass-input">
                    <option>Not Required</option>
                    {routes.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel">
            <h3 style={{ margin: '0 0 20px 0' }}>Parent & Custom Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Parent Name</label>
                <input type="text" name="parentName" value={formData.parentName} onChange={handleInputChange} className="glass-input" placeholder="e.g. Ramesh Kumar" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Parent Phone</label>
                <input type="text" name="parentPhone" value={formData.parentPhone} onChange={handleInputChange} className="glass-input" placeholder="+91 9876543210" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Student Aadhar Number</label>
                <input type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleInputChange} className="glass-input" placeholder="0000 0000 0000" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Blood Group</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="glass-input">
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Photo & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 16px 0', alignSelf: 'flex-start' }}>Student Photo</h3>
            
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handlePhotoChange} 
            />
            
            <div 
              onClick={handlePhotoClick}
              style={{ 
                position: 'relative',
                width: '150px', height: '150px', borderRadius: '12px', border: '2px dashed var(--glass-border)', 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                color: 'var(--text-muted)', marginBottom: '16px', background: 'rgba(255,255,255,0.3)', 
                cursor: 'pointer', overflow: 'hidden'
              }}
            >
              {photoPreview ? (
                <>
                  <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    onClick={handleRemovePhoto}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                    title="Remove Photo"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <Camera size={32} style={{ marginBottom: '8px' }} />
                  <span style={{ fontSize: '0.85rem' }}>Upload Photo</span>
                </>
              )}
            </div>
            
            <h3 style={{ margin: '16px 0', alignSelf: 'flex-start' }}>Documents</h3>
            
            <input type="file" accept="image/*,.pdf" ref={birthCertInputRef} style={{ display: 'none' }} onChange={(e) => { if(e.target.files && e.target.files[0]) setBirthCertFile(e.target.files[0]) }} />
            <input type="file" accept="image/*,.pdf" ref={tcInputRef} style={{ display: 'none' }} onChange={(e) => { if(e.target.files && e.target.files[0]) setTcFile(e.target.files[0]) }} />
            
            <button className="btn-secondary" style={{ width: '100%', marginBottom: '12px', background: birthCertFile ? 'var(--success)' : '', color: birthCertFile ? 'white' : '' }} onClick={() => birthCertInputRef.current?.click()}>
              {birthCertFile ? <Check size={16} /> : <Upload size={16} />} 
              {birthCertFile ? 'Birth Certificate Selected' : 'Upload Birth Certificate'}
            </button>
            <button className="btn-secondary" style={{ width: '100%', marginBottom: '16px', background: tcFile ? 'var(--success)' : '', color: tcFile ? 'white' : '' }} onClick={() => tcInputRef.current?.click()}>
              {tcFile ? <Check size={16} /> : <Upload size={16} />} 
              {tcFile ? 'TC / Marksheet Selected' : 'Upload TC / Marksheet'}
            </button>
            
            <input type="file" accept="image/*,.pdf" ref={customDocInputRef} style={{ display: 'none' }} onChange={handleCustomDocChange} />
            
            {customDocs.map(doc => (
              <div key={doc.id} style={{ display: 'flex', gap: '8px', marginBottom: '12px', width: '100%' }}>
                <button 
                  className="btn-secondary" 
                  style={{ flex: 1, background: doc.file ? 'var(--success)' : '', color: doc.file ? 'white' : '', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} 
                  onClick={() => { setActiveCustomDocId(doc.id); customDocInputRef.current?.click(); }}
                  title={doc.name}
                >
                  {doc.file ? <Check size={16} /> : <Upload size={16} />} 
                  {doc.name}
                </button>
                <button className="btn-secondary" style={{ padding: '0 12px', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDeleteCustomDoc(doc.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {showNewDocInput ? (
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <input type="text" className="glass-input" placeholder="Document Name" value={newDocName} onChange={e => setNewDocName(e.target.value)} autoFocus />
                <button className="btn-primary" style={{ padding: '0 12px' }} onClick={handleAddCustomDoc}><Check size={16} /></button>
                <button className="btn-secondary" style={{ padding: '0 12px' }} onClick={() => setShowNewDocInput(false)}><X size={16} /></button>
              </div>
            ) : (
              <button className="btn-secondary" style={{ width: '100%', borderStyle: 'dashed' }} onClick={() => setShowNewDocInput(true)}>
                <Plus size={16} /> Add Other Document
              </button>
            )}
          </div>

          <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.5))' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Finalize</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Please verify all details before submitting. An SMS will be automatically sent to the parents upon admission.</p>
            <button className="btn-primary" style={{ width: '100%', padding: '12px' }} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Processing...' : <><Save size={18} /> Confirm Admission</>}
            </button>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {saved && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed', bottom: '40px', right: '40px',
              background: 'var(--success)', color: 'white',
              padding: '16px 24px', borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
              display: 'flex', alignItems: 'center', gap: '12px',
              fontWeight: 600, zIndex: 1000
            }}
          >
            <Check size={24} /> Student admitted successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cropper Modal */}
      {showCropper && rawImage && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ width: '90%', maxWidth: '500px', background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Crop Photo</h3>
              <button onClick={handleCancelCrop} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><X size={20} /></button>
            </div>
            
            <div style={{ position: 'relative', width: '100%', height: '350px', background: '#333' }}>
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={4 / 5}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div style={{ padding: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: '#555' }}>Zoom</label>
              <input 
                type="range" 
                value={zoom} 
                min={1} 
                max={3} 
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))} 
                style={{ width: '100%', marginBottom: '16px' }} 
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={handleCancelCrop}>Cancel</button>
                <button className="btn-primary" onClick={handleSaveCrop}>Save Crop</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default NewAdmission;
