import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Upload, Save, FileText, Camera, Check, Plus, Trash2, X } from 'lucide-react';
import { addStudent, type StudentData } from '../services/studentService';
import { getClasses, type ClassData, getSequenceIndex } from '../services/classService';
import { getVehicles } from '../services/transportService';
import { getSchoolSettings, saveSchoolSettings } from '../services/settingsService';
import { uploadImageToCloudinary } from '../lib/cloudinary';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import PhoneInputModule from 'react-phone-input-2';
const PhoneInput = (PhoneInputModule as any).default || PhoneInputModule;
import 'react-phone-input-2/lib/style.css';

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

const INITIAL_FORM_DATA: Partial<StudentData> = {
  admissionType: 'New',
  originalAdmissionDate: '',
  previousDues: 0,
  previousPaidAmount: 0,
  previousSession: '',
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
  motherName: '',
  parentPhone: '',
  email: '',
  status: 'Active',
  admissionNo: '',
  rollNumber: '' as any,
  address: '',
  fatherOccupation: '',
};

const NewAdmission: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const birthCertInputRef = useRef<HTMLInputElement>(null);
  const aadharInputRef = useRef<HTMLInputElement>(null);
  const tcInputRef = useRef<HTMLInputElement>(null);
  const [admissionType, setAdmissionType] = useState<'New' | 'Old'>('New');
  const [formData, setFormData] = useState<Partial<StudentData>>(INITIAL_FORM_DATA);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [birthCertFile, setBirthCertFile] = useState<File | null>(null);
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [tcFile, setTcFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [transportVehicles, setTransportVehicles] = useState<any[]>([]);
  
  // Aggregate sections for classes with the same name
  const uniqueClasses = useMemo(() => {
    const list: { className: string; sections: string[] }[] = [];
    classes.forEach(c => {
      let existing = list.find(x => x.className === c.className);
      if (!existing) {
        existing = { className: c.className, sections: [] };
        list.push(existing);
      }
      c.sections.forEach(s => {
        if (!existing?.sections.includes(s)) existing?.sections.push(s);
      });
    });
    return list.sort((a, b) => getSequenceIndex(a.className) - getSequenceIndex(b.className));
  }, [classes]);
  
  // Custom Docs State
  const [customDocs, setCustomDocs] = useState<{id: string, name: string, file: File | null}[]>([]);
  const [newDocName, setNewDocName] = useState('');
  const [showNewDocInput, setShowNewDocInput] = useState(false);
  const [activeCustomDocId, setActiveCustomDocId] = useState<string | null>(null);
  const customDocInputRef = useRef<HTMLInputElement>(null);

  // Cropper state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(4 / 5);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);

  // Drafts state
  const [draftId, setDraftId] = useState<string>(Date.now().toString());
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasData = Object.keys(formData).some(key => {
          // Ignore fields that have default values or are auto-populated
          if (['status', 'admissionType', 'gender', 'feeGroup', 'transportRoute', 'classId', 'sectionId'].includes(key)) return false;
          
          const val = formData[key as keyof typeof formData];
          
          // Ignore empty strings, 0, or boolean false
          if (!val) return false;
          
          // Specifically ignore if phone is just the country code auto-inserted
          if (key === 'parentPhone' && (val === '+' || val === '+91' || val === '91')) return false;
          
          // Ignore if the value hasn't changed from the initial state
          const initialVal = INITIAL_FORM_DATA[key as keyof typeof INITIAL_FORM_DATA];
          if (val === initialVal) return false;

          return true;
        });
      if (hasData) {
        const existingStr = localStorage.getItem('admission_drafts');
        let drafts = existingStr ? JSON.parse(existingStr) : {};
        drafts[draftId] = {
          timestamp: Date.now(),
          data: formData
        };
        localStorage.setItem('admission_drafts', JSON.stringify(drafts));
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData, draftId]);

  const loadDrafts = () => {
    const existingStr = localStorage.getItem('admission_drafts');
    if (existingStr) {
      const draftsObj = JSON.parse(existingStr);
      const draftsArray = Object.keys(draftsObj).map(key => ({
        id: key,
        ...draftsObj[key]
      })).sort((a, b) => b.timestamp - a.timestamp);
      setSavedDrafts(draftsArray);
    } else {
      setSavedDrafts([]);
    }
  };

  useEffect(() => {
    if (showDraftsModal) {
      loadDrafts();
    }
  }, [showDraftsModal]);

  const applyDraft = (draft: any) => {
    setFormData(draft.data);
    setDraftId(draft.id);
    if (draft.data.admissionType) setAdmissionType(draft.data.admissionType);
    setShowDraftsModal(false);
  };

  const deleteDraft = (id: string) => {
    const existingStr = localStorage.getItem('admission_drafts');
    if (existingStr) {
      const draftsObj = JSON.parse(existingStr);
      delete draftsObj[id];
      localStorage.setItem('admission_drafts', JSON.stringify(draftsObj));
      loadDrafts();
    }
  };

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
        setTransportVehicles(vehicles);
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
    const selectedClass = uniqueClasses.find(c => c.className === selectedClassName);
    setFormData(prev => ({
      ...prev,
      classId: selectedClassName,
      sectionId: selectedClass?.sections[0] || ''
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    
    if (['firstName', 'lastName', 'parentName', 'motherName'].includes(name)) {
      value = value.toUpperCase();
    }
    
    if (['aadharNumber', 'fatherAadhar', 'motherAadhar'].includes(name)) {
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      // Force uppercase for names before submitting
      const sanitizedFormData = {
        ...formData,
        firstName: formData.firstName?.toUpperCase() || '',
        lastName: formData.lastName?.toUpperCase() || '',
        parentName: formData.parentName?.toUpperCase() || '',
        motherName: formData.motherName?.toUpperCase() || ''
      };

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

      const rollNumber = parseInt(formData.rollNumber as any) || 0;

      const newStudent: Omit<StudentData, 'id'> = {
        ...sanitizedFormData as Omit<StudentData, 'id'>,
        photoUrl,
        documents,
        rollNumber,
        admissionDate: admissionType === 'Old' && formData.originalAdmissionDate ? formData.originalAdmissionDate : new Date().toISOString(),
        admissionType: admissionType,
        originalAdmissionDate: admissionType === 'Old' ? formData.originalAdmissionDate : new Date().toISOString().split('T')[0],
        previousDues: admissionType === 'Old' ? (formData.previousDues || 0) : 0,
        previousPaidAmount: admissionType === 'Old' ? (formData.previousPaidAmount || 0) : 0,
        previousSession: admissionType === 'Old' ? (formData.previousSession || '') : '',
      };

      await addStudent(newStudent);
      
      // Clear draft on success
      const existingStr = localStorage.getItem('admission_drafts');
      if (existingStr) {
        const draftsObj = JSON.parse(existingStr);
        delete draftsObj[draftId];
        localStorage.setItem('admission_drafts', JSON.stringify(draftsObj));
      }
      
      // Reset form so the useEffect doesn't immediately save a ghost draft
      setFormData(INITIAL_FORM_DATA);
      setPhotoFile(null);
      setPhotoPreview('');
      setBirthCertFile(null);
      setAadharFile(null);
      setTcFile(null);
      setCustomDocs([]);
      
      setDraftId(Date.now().toString());

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title"><UserPlus size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> New Admission</h1>
          <p className="page-subtitle" style={{ fontSize: '1.1rem', marginTop: '4px' }}>Enroll a new student into the system with full digital records.</p>
        </div>
        <button className="btn-secondary hover-scale" onClick={() => setShowDraftsModal(true)} style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <FileText size={18} color="var(--primary-color)" /> Saved Drafts
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
          
          {/* Main Form Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Student Type Selection */}
            <div className="glass-panel" style={{ padding: '32px', borderTop: '4px solid #3b82f6' }}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                <Check size={20} color="#3b82f6" /> Admission Type
              </h3>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button
                  type="button"
                  style={{
                    flex: 1, padding: '16px', fontSize: '1.1rem', fontWeight: 600, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s',
                    background: admissionType === 'New' ? 'rgba(59,130,246,0.1)' : 'var(--glass-bg)',
                    color: admissionType === 'New' ? '#2563eb' : '#64748b',
                    border: admissionType === 'New' ? '2px solid #3b82f6' : '1px solid var(--glass-border)',
                    boxShadow: admissionType === 'New' ? '0 4px 12px rgba(59,130,246,0.1)' : 'none'
                  }}
                  onClick={() => { setAdmissionType('New'); setFormData(prev => ({...prev, admissionType: 'New', previousDues: 0, previousPaidAmount: 0, previousSession: '', originalAdmissionDate: ''})); }}
                >
                  <UserPlus size={20} /> Fresh Admission
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1, padding: '16px', fontSize: '1.1rem', fontWeight: 600, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s',
                    background: admissionType === 'Old' ? 'rgba(22,163,74,0.1)' : 'var(--glass-bg)',
                    color: admissionType === 'Old' ? '#16a34a' : '#64748b',
                    border: admissionType === 'Old' ? '2px solid #16a34a' : '1px solid var(--glass-border)',
                    boxShadow: admissionType === 'Old' ? '0 4px 12px rgba(22,163,74,0.1)' : 'none'
                  }}
                  onClick={() => { setAdmissionType('Old'); setFormData(prev => ({...prev, admissionType: 'Old'})); }}
                >
                  <FileText size={20} /> Old / Continuing Student
                </button>
              </div>

              <AnimatePresence>
                {admissionType === 'Old' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ marginTop: '24px', background: 'rgba(255,255,255,0.3)', padding: '24px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                      <h4 style={{ margin: '0 0 16px 0', color: '#16a34a' }}>Continuing Student Details</h4>
                      <div className="form-grid">
                        <div>
                          <label>Original Admission Date</label>
                          <input type="date" name="originalAdmissionDate" value={formData.originalAdmissionDate || ''} onChange={handleInputChange} className="glass-input" />
                        </div>
                        <div>
                          <label>Previous Session (e.g. 2025-2026)</label>
                          <input type="text" name="previousSession" value={formData.previousSession || ''} onChange={handleInputChange} className="glass-input" placeholder="2025-2026" />
                        </div>
                        <div>
                          <label>Pending Dues (Carry forward)</label>
                          <input type="number" name="previousDues" value={formData.previousDues || ''} onChange={handleInputChange} className="glass-input" placeholder="0" />
                        </div>
                        <div>
                          <label>Advance Paid (Carry forward)</label>
                          <input type="number" name="previousPaidAmount" value={formData.previousPaidAmount || ''} onChange={handleInputChange} className="glass-input" placeholder="0" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Academic Details */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                <div style={{ background: '#e0e7ff', padding: '8px', borderRadius: '8px' }}><Check size={18} color="#4f46e5" /></div> Academic Details
              </h3>
              <div className="form-grid">
                <div>
                  <label>Class *</label>
                  <select name="classId" value={formData.classId || ''} onChange={handleInputChange} className="glass-input" required>
                    <option value="">Select Class</option>
                    {uniqueClasses.map(c => <option key={c.className} value={c.className}>{c.className}</option>)}
                  </select>
                </div>
                <div>
                  <label>Section *</label>
                  <select name="sectionId" value={formData.sectionId || ''} onChange={handleInputChange} className="glass-input" required disabled={!formData.classId}>
                    <option value="">Select Section</option>
                    {uniqueClasses.find(c => c.className === formData.classId)?.sections.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label>Roll Number</label>
                  <input type="number" name="rollNumber" value={formData.rollNumber || ''} onChange={handleInputChange} className="glass-input" placeholder="e.g. 1" />
                </div>
                <div>
                  <label>Admission Number</label>
                  <input type="text" name="admissionNo" value={formData.admissionNo || ''} onChange={handleInputChange} className="glass-input" placeholder="Leave blank for auto-generate" />
                </div>
                <div>
                  <label>Session</label>
                  <input type="text" name="session" value={formData.session || '2026-2027'} onChange={handleInputChange} className="glass-input" />
                </div>
                <div>
                  <label>Admission Date</label>
                  <input type="date" name="admissionDate" value={formData.admissionDate || ''} onChange={handleInputChange} className="glass-input" />
                </div>
                <div>
                  <label>Fee Group & Discount (%)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '8px' }}>
                    <select name="feeGroup" value={formData.feeGroup || 'General Fee Category'} onChange={handleInputChange} className="glass-input">
                      <option value="General Fee Category">General Fee Category</option>
                      <option value="Staff Child">Staff Child</option>
                      <option value="RTE">RTE (Right to Education)</option>
                      <option value="Scholarship">Scholarship</option>
                      <option value="Management Quota">Management Quota</option>
                    </select>
                    <input 
                      type="number" 
                      name="discountPercent" 
                      value={formData.discountPercent === 0 ? '' : formData.discountPercent} 
                      onChange={(e) => setFormData(prev => ({...prev, discountPercent: Math.min(100, Math.max(0, Number(e.target.value))) }))} 
                      className="glass-input" 
                      placeholder="%" 
                      min="0" max="100"
                    />
                  </div>
                </div>
                <div>
                  <label>Transport Route</label>
                    <select name="transportRoute" value={formData.transportRoute || 'Not Required'} onChange={handleInputChange} className="glass-input">
                      <option value="Not Required">Not Required</option>
                      {transportVehicles.map(v => <option key={v.id} value={v.route}>{v.route} (₹{v.monthlyFee}/mo)</option>)}
                    </select>
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                <div style={{ background: '#fae8ff', padding: '8px', borderRadius: '8px' }}><Check size={18} color="#c026d3" /></div> Personal Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
                  <div>
                    <label>First Name *</label>
                    <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleInputChange} className="glass-input" required placeholder="e.g. Rahul" />
                  </div>
                  <div>
                    <label>Last Name *</label>
                    <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleInputChange} className="glass-input" required placeholder="e.g. Kumar" />
                  </div>
                </div>
                <div className="form-grid">
                  <div>
                    <label>Date of Birth</label>
                    <input type="date" name="dob" value={formData.dob || ''} onChange={handleInputChange} className="glass-input" />
                  </div>
                  <div>
                    <label>Gender</label>
                    <select name="gender" value={formData.gender || 'Male'} onChange={handleInputChange} className="glass-input">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label>Religion</label>
                    <input type="text" name="religion" value={formData.religion || ''} onChange={handleInputChange} className="glass-input" placeholder="e.g. Hindu, Muslim, Sikh" />
                  </div>
                  <div>
                    <label>Caste / Category</label>
                    <input type="text" name="caste" value={formData.caste || ''} onChange={handleInputChange} className="glass-input" placeholder="e.g. General, OBC, SC, ST" />
                  </div>
                  <div>
                    <label>Aadhar Number</label>
                    <input type="text" name="aadharNumber" value={formData.aadharNumber || ''} onChange={handleInputChange} className="glass-input" placeholder="0000 0000 0000" />
                  </div>
                  <div>
                    <label>Blood Group</label>
                    <select name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleInputChange} className="glass-input">
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Parent Details */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                <div style={{ background: '#dbeafe', padding: '8px', borderRadius: '8px' }}><Check size={18} color="#2563eb" /></div> Father & Mother Details
              </h3>
              
              <h4 style={{ margin: '0 0 16px 0', color: '#2563eb', borderBottom: '1px dashed var(--glass-border)', paddingBottom: '8px' }}>Father's Details</h4>
              <div className="form-grid" style={{ marginBottom: '32px' }}>
                <div><label>Father's Name</label><input type="text" name="parentName" value={formData.parentName || ''} onChange={handleInputChange} className="glass-input" placeholder="e.g. Ramesh Kumar" /></div>
                <div><label>Father Aadhar</label><input type="text" name="fatherAadhar" value={formData.fatherAadhar || ''} onChange={handleInputChange} className="glass-input" placeholder="0000 0000 0000" /></div>
                <div><label>Qualification</label><input type="text" name="fatherQualification" value={formData.fatherQualification || ''} onChange={handleInputChange} className="glass-input" placeholder="e.g. B.Tech" /></div>
                <div><label>Occupation</label><input type="text" name="fatherOccupation" value={formData.fatherOccupation || ''} onChange={handleInputChange} className="glass-input" placeholder="e.g. Business" /></div>
              </div>

              <h4 style={{ margin: '0 0 16px 0', color: '#db2777', borderBottom: '1px dashed var(--glass-border)', paddingBottom: '8px' }}>Mother's Details</h4>
              <div className="form-grid">
                <div><label>Mother's Name</label><input type="text" name="motherName" value={formData.motherName || ''} onChange={handleInputChange} className="glass-input" placeholder="e.g. Sunita Devi" /></div>
                <div><label>Mother Aadhar</label><input type="text" name="motherAadhar" value={formData.motherAadhar || ''} onChange={handleInputChange} className="glass-input" placeholder="0000 0000 0000" /></div>
                <div><label>Qualification</label><input type="text" name="motherQualification" value={formData.motherQualification || ''} onChange={handleInputChange} className="glass-input" placeholder="e.g. B.A." /></div>
                <div><label>Occupation</label><input type="text" name="motherOccupation" value={formData.motherOccupation || ''} onChange={handleInputChange} className="glass-input" placeholder="e.g. Homemaker" /></div>
              </div>
            </div>

            {/* Contact Details with Country Code Dropdowns */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                <div style={{ background: '#dcfce7', padding: '8px', borderRadius: '8px' }}><Check size={18} color="#16a34a" /></div> Contact Details
              </h3>
              
              <div className="form-grid">
                <div>
                  <label>Primary Phone (Father)</label>
                  <PhoneInput 
                    country={'in'} 
                    value={formData.parentPhone || ''} 
                    onChange={(val) => setFormData(prev => ({...prev, parentPhone: '+' + val.replace('+', '')}))}
                    inputStyle={{ width: '100%', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '12px', height: '44px', color: '#1e293b', fontSize: '1rem', paddingLeft: '48px' }}
                    buttonStyle={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '12px 0 0 12px' }}
                    dropdownStyle={{ background: '#f8fafc', color: '#1e293b', zIndex: 9999, borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  />
                </div>
                <div>
                  <label>Mother Phone</label>
                  <PhoneInput 
                    country={'in'} 
                    value={formData.motherPhone || ''} 
                    onChange={(val) => setFormData(prev => ({...prev, motherPhone: '+' + val.replace('+', '')}))}
                    inputStyle={{ width: '100%', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '12px', height: '44px', color: '#1e293b', fontSize: '1rem', paddingLeft: '48px' }}
                    buttonStyle={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '12px 0 0 12px' }}
                    dropdownStyle={{ background: '#f8fafc', color: '#1e293b', zIndex: 9999, borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  />
                </div>
                <div>
                  <label>Student Phone (Optional)</label>
                  <PhoneInput 
                    country={'in'} 
                    value={formData.phone || ''} 
                    onChange={(val) => setFormData(prev => ({...prev, phone: '+' + val.replace('+', '')}))}
                    inputStyle={{ width: '100%', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '12px', height: '44px', color: '#1e293b', fontSize: '1rem', paddingLeft: '48px' }}
                    buttonStyle={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '12px 0 0 12px' }}
                    dropdownStyle={{ background: '#f8fafc', color: '#1e293b', zIndex: 9999, borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  />
                </div>
                <div>
                  <label>Emergency Contact</label>
                  <PhoneInput 
                    country={'in'} 
                    value={formData.emergencyContact || ''} 
                    onChange={(val) => setFormData(prev => ({...prev, emergencyContact: '+' + val.replace('+', '')}))}
                    inputStyle={{ width: '100%', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '12px', height: '44px', color: '#1e293b', fontSize: '1rem', paddingLeft: '48px' }}
                    buttonStyle={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '12px 0 0 12px' }}
                    dropdownStyle={{ background: '#f8fafc', color: '#1e293b', zIndex: 9999, borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className="glass-input" placeholder="e.g. email@example.com" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label>Full Residential Address</label>
                  <textarea name="address" value={formData.address || ''} onChange={handleInputChange} className="glass-input" style={{ width: '100%', minHeight: '80px', resize: 'vertical' }} placeholder="Enter complete address"></textarea>
                </div>
              </div>
            </div>
            
            {/* Photo & Documents Upload Array */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                <div style={{ background: '#fef3c7', padding: '8px', borderRadius: '8px' }}><Check size={18} color="#d97706" /></div> Student Photo & Documents
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                {/* Photo Upload */}
                <div>
                  <h4 style={{ margin: '0 0 16px 0', color: '#475569' }}>Student Photo</h4>
                  <div 
                    onClick={handlePhotoClick}
                    style={{ 
                      width: '100%', height: '240px', border: '2px dashed var(--glass-border)', borderRadius: '20px', 
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                      cursor: 'pointer', background: 'rgba(255,255,255,0.2)', overflow: 'hidden', position: 'relative', transition: 'all 0.2s'
                    }}
                    className="hover-scale"
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#64748b' }}>
                        <Camera size={48} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                        <p style={{ margin: 0, fontWeight: 600 }}>Click to upload photo</p>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" style={{ display: 'none' }} />
                  </div>
                  {photoPreview && (
                    <button type="button" onClick={handleRemovePhoto} style={{ margin: '12px auto 0 auto', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
                      <Trash2 size={16} /> Remove Photo
                    </button>
                  )}
                </div>

                {/* Documents Upload */}
                <div>
                  <h4 style={{ margin: '0 0 16px 0', color: '#475569' }}>Required Documents</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.3)', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <div style={{ background: '#e0e7ff', padding: '10px', borderRadius: '10px' }}><FileText size={20} color="#4f46e5" /></div>
                         <div>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>Birth Certificate</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{birthCertFile ? birthCertFile.name : 'Not uploaded'}</div>
                         </div>
                      </div>
                      <input type="file" ref={birthCertInputRef} onChange={(e) => { if(e.target.files) setBirthCertFile(e.target.files[0]); }} style={{ display: 'none' }} />
                      <button type="button" className="btn-secondary" onClick={() => birthCertInputRef.current?.click()} style={{ padding: '8px 16px' }}>{birthCertFile ? 'Change' : 'Upload'}</button>
                    </div>

                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.3)', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <div style={{ background: '#dbeafe', padding: '10px', borderRadius: '10px' }}><FileText size={20} color="#2563eb" /></div>
                         <div>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>Transfer Certificate (TC)</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{tcFile ? tcFile.name : 'Not uploaded'}</div>
                         </div>
                      </div>
                      <input type="file" ref={tcInputRef} onChange={(e) => { if(e.target.files) setTcFile(e.target.files[0]); }} style={{ display: 'none' }} />
                      <button type="button" className="btn-secondary" onClick={() => tcInputRef.current?.click()} style={{ padding: '8px 16px' }}>{tcFile ? 'Change' : 'Upload'}</button>
                    </div>

                    
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.3)', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <div style={{ background: '#fce7f3', padding: '10px', borderRadius: '10px' }}><FileText size={20} color="#db2777" /></div>
                         <div>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>Aadhar Card</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{aadharFile ? aadharFile.name : 'Not uploaded'}</div>
                         </div>
                      </div>
                      <input type="file" ref={aadharInputRef} onChange={(e) => { if(e.target.files) setAadharFile(e.target.files[0]); }} style={{ display: 'none' }} />
                      <button type="button" className="btn-secondary" onClick={() => aadharInputRef.current?.click()} style={{ padding: '8px 16px' }}>{aadharFile ? 'Change' : 'Upload'}</button>
                    </div>

                    {customDocs.map(doc => (
                      <div key={doc.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.3)', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ background: '#f3e8ff', padding: '10px', borderRadius: '10px' }}><FileText size={20} color="#a855f7" /></div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{doc.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{doc.file ? doc.file.name : 'Not uploaded'}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button type="button" className="btn-secondary" onClick={() => { setActiveCustomDocId(doc.id); setTimeout(() => customDocInputRef.current?.click(), 0); }} style={{ padding: '8px 16px' }}>{doc.file ? 'Change' : 'Upload'}</button>
                          <button type="button" onClick={() => handleDeleteCustomDoc(doc.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                        </div>
                      </div>
                    ))}

                    <input type="file" ref={customDocInputRef} onChange={handleCustomDocChange} style={{ display: 'none' }} />
                    
                    {showNewDocInput ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="text" className="glass-input" value={newDocName} onChange={e => setNewDocName(e.target.value)} placeholder="e.g. Previous Marksheet" style={{ flex: 1 }} />
                        <button type="button" className="btn-primary" onClick={handleAddCustomDoc} style={{ padding: '8px 16px' }}>Add</button>
                        <button type="button" className="btn-secondary" onClick={() => { setShowNewDocInput(false); setNewDocName(''); }} style={{ padding: '8px' }}><X size={18} /></button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setShowNewDocInput(true)} style={{ background: 'rgba(255,255,255,0.2)', border: '1px dashed var(--glass-border)', padding: '12px', borderRadius: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                        <Plus size={18} /> Add Document
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Submit Bar */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end', gap: '16px', position: 'sticky', bottom: '24px', zIndex: 100, borderTop: '1px solid var(--glass-border)' }}>
               <button type="button" onClick={() => setFormData(INITIAL_FORM_DATA)} className="btn-secondary" style={{ padding: '12px 24px', fontSize: '1.1rem', borderRadius: '12px' }}>
                 Reset Form
               </button>
               <button type="submit" disabled={loading} className="btn-primary hover-scale" style={{ padding: '12px 32px', fontSize: '1.1rem', fontWeight: 700, borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 15px rgba(16,185,129,0.2)' }}>
                 {loading ? 'Saving Records...' : <><Save size={20} /> Enroll Student</>}
               </button>
            </div>
          </div>
        </div>
      </form>

      {/* Modals for Drafts & Success message */}
      <AnimatePresence>
        {showDraftsModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: 'white', width: '90%', maxWidth: '500px', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Saved Drafts</h3>
                <button onClick={() => setShowDraftsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {savedDrafts.length === 0 ? <p style={{ color: '#666' }}>No saved drafts.</p> : savedDrafts.map(draft => (
                  <div key={draft.id} style={{ borderBottom: '1px solid #eee', padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{draft.data.firstName || 'Unknown'} {draft.data.lastName || ''}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(draft.timestamp).toLocaleString()}</div>
                    </div>
                    <button onClick={() => { setFormData(draft.data); setDraftId(draft.id); setShowDraftsModal(false); }} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.9rem' }}>Load</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            style={{
              position: 'fixed', bottom: '100px', right: '40px',
              background: '#10b981', color: 'white', padding: '16px 24px',
              borderRadius: '16px',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
              display: 'flex', alignItems: 'center', gap: '12px',
              fontWeight: 600, zIndex: 1000
            }}
          >
            <Check size={24} /> Student admitted successfully!
          </motion.div>
        )}
      </AnimatePresence>
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
                aspect={aspect}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
                <button className="btn-secondary" style={{ padding: '4px 12px', background: aspect === 1 ? 'var(--primary-color)' : '', color: aspect === 1 ? 'white' : '' }} onClick={() => setAspect(1)}>1:1</button>
                <button className="btn-secondary" style={{ padding: '4px 12px', background: aspect === 3/4 ? 'var(--primary-color)' : '', color: aspect === 3/4 ? 'white' : '' }} onClick={() => setAspect(3/4)}>3:4</button>
                <button className="btn-secondary" style={{ padding: '4px 12px', background: aspect === 4/3 ? 'var(--primary-color)' : '', color: aspect === 4/3 ? 'white' : '' }} onClick={() => setAspect(4/3)}>4:3</button>
                <button className="btn-secondary" style={{ padding: '4px 12px', background: aspect === 4/5 ? 'var(--primary-color)' : '', color: aspect === 4/5 ? 'white' : '' }} onClick={() => setAspect(4/5)}>4:5</button>
                <button className="btn-secondary" style={{ padding: '4px 12px', background: aspect === 16/9 ? 'var(--primary-color)' : '', color: aspect === 16/9 ? 'white' : '' }} onClick={() => setAspect(16/9)}>16:9</button>
              </div>

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

      {/* Drafts Modal */}
      {showDraftsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
            <button 
              onClick={() => setShowDraftsModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={24} color="var(--primary-color)" /> Saved Drafts
            </h2>
            {savedDrafts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No saved drafts available.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {savedDrafts.map(draft => (
                  <div key={draft.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                    <div 
                      style={{ flex: 1, cursor: 'pointer' }} 
                      onClick={() => applyDraft(draft)}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                        {draft.data.firstName || 'Unknown'} {draft.data.lastName || ''}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Saved: {new Date(draft.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteDraft(draft.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '8px' }}
                      title="Delete Draft"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </motion.div>
  );
};

export default NewAdmission;
