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
  const tcInputRef = useRef<HTMLInputElement>(null);
  const [admissionType, setAdmissionType] = useState<'New' | 'Old'>('New');
  const [formData, setFormData] = useState<Partial<StudentData>>(INITIAL_FORM_DATA);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [birthCertFile, setBirthCertFile] = useState<File | null>(null);
  const [tcFile, setTcFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [routes, setRoutes] = useState<string[]>([]);
  
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
          // Ignore fields that have default values
          if (['status', 'admissionType', 'gender', 'feeGroup', 'transportRoute'].includes(key)) return false;
          
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
        const uniqueRoutes = Array.from(new Set(vehicles.map(v => v.route).filter(Boolean)));
        setRoutes(uniqueRoutes as string[]);
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

  const handleSubmit = async () => {

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
          <p className="page-subtitle">Enroll a new student into the system with full digital records.</p>
        </div>
        <button className="btn-secondary" onClick={() => setShowDraftsModal(true)} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} /> Saved Drafts
        </button>
      </div>

      {/* Student Type Toggle */}
      <div className="glass-panel" style={{ marginBottom: '24px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0' }}>Student Type</h3>
        <div className="filter-bar">
          <button
            type="button"
            className={admissionType === 'New' ? 'btn-primary' : 'btn-secondary'}
            style={{ flex: 1, padding: '16px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={() => { setAdmissionType('New'); setFormData(prev => ({...prev, admissionType: 'New', previousDues: 0, previousPaidAmount: 0, previousSession: '', originalAdmissionDate: ''})); }}
          >
            🆕 New Admission
          </button>
          <button
            type="button"
            className={admissionType === 'Old' ? 'btn-primary' : 'btn-secondary'}
            style={{ flex: 1, padding: '16px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={() => { setAdmissionType('Old'); setFormData(prev => ({...prev, admissionType: 'Old'})); }}
          >
            🔄 Old / Continuing Student
          </button>
        </div>
      </div>

      <div className="form-layout">
        
        {/* Left Column - Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel">
            <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={18} /> Student Details</h3>
            <div className="form-grid">
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
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Student Aadhar Number</label>
                <input type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleInputChange} className="glass-input" placeholder="0000 0000 0000" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Religion</label>
                <input type="text" name="religion" value={formData.religion} onChange={handleInputChange} className="glass-input" placeholder="e.g. Hindu, Muslim, Sikh" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Caste / Category</label>
                <input type="text" name="caste" value={formData.caste} onChange={handleInputChange} className="glass-input" placeholder="e.g. General, OBC, SC, ST" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Student Email ID</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="glass-input" placeholder="student@example.com" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="glass-input" placeholder="Complete residential address" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="glass-input">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
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

          <div className="glass-panel">
            <h3 style={{ margin: '0 0 20px 0' }}>Academic & Fee Details</h3>
            <div className="form-grid">
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Admission No. (Optional)</label>
                <input type="text" name="admissionNo" value={formData.admissionNo} onChange={handleInputChange} className="glass-input" placeholder="e.g. ADM-2023-001" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Roll Number (Optional)</label>
                <input type="number" name="rollNumber" value={formData.rollNumber} onChange={handleInputChange} className="glass-input" placeholder="e.g. 45" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Admission to Class *</label>
                <select name="classId" value={formData.classId} onChange={handleClassChange} className="glass-input">
                  {uniqueClasses.map(c => <option key={c.className} value={c.className}>{c.className}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Section *</label>
                <select name="sectionId" value={formData.sectionId} onChange={handleInputChange} className="glass-input">
                  {uniqueClasses.find(c => c.className === formData.classId)?.sections.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Fee Group & Discount (%)</label>
                <div className="fee-group-grid" style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: "8px" }}>
                  <select name="feeGroup" value={formData.feeGroup} onChange={handleInputChange} className="glass-input">
                    <option>General Fee Category</option>
                    <option>RTE Quota (Free)</option>
                    <option>Staff Child</option>
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
              {routes.length > 0 && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Transport Route</label>
                  <select name="transportRoute" value={formData.transportRoute} onChange={handleInputChange} className="glass-input">
                    <option>Not Required</option>
                    {routes.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              )}
              {admissionType === 'Old' && (
                <>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ borderTop: '1px dashed var(--glass-border)', margin: '8px 0 16px', paddingTop: '16px' }}>
                      <h4 style={{ margin: '0 0 16px 0', color: 'var(--primary-color)' }}>📋 Previous Session Details</h4>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Original Admission Date *</label>
                    <input type="date" name="originalAdmissionDate" value={formData.originalAdmissionDate} onChange={handleInputChange} className="glass-input" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Previous Session</label>
                    <input type="text" name="previousSession" value={formData.previousSession} onChange={handleInputChange} className="glass-input" placeholder="e.g. 2022-2023" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Previous Dues (₹)</label>
                    <input type="number" name="previousDues" value={formData.previousDues || ''} onChange={e => setFormData(prev => ({...prev, previousDues: Number(e.target.value)}))} className="glass-input" placeholder="e.g. 5000" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Previous Amount Paid (₹)</label>
                    <input type="number" name="previousPaidAmount" value={formData.previousPaidAmount || ''} onChange={e => setFormData(prev => ({...prev, previousPaidAmount: Number(e.target.value)}))} className="glass-input" placeholder="e.g. 10000" />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="glass-panel">
            <h3 style={{ margin: '0 0 20px 0' }}>Parents / Guardian Details</h3>
            
            {/* Father Details */}
            <div style={{ borderTop: '1px dashed var(--glass-border)', margin: '8px 0 16px', paddingTop: '16px' }}>
              <h4 style={{ margin: '0 0 16px 0', color: 'var(--primary-color)' }}>👨 Father's Details</h4>
            </div>
            <div className="form-grid" style={{ marginBottom: "24px" }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Father's Name</label>
                <input type="text" name="parentName" value={formData.parentName} onChange={handleInputChange} className="glass-input" placeholder="e.g. Ramesh Kumar" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Aadhar Number</label>
                <input type="text" name="fatherAadhar" value={formData.fatherAadhar} onChange={handleInputChange} className="glass-input" placeholder="0000 0000 0000" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Qualification</label>
                <input type="text" name="fatherQualification" value={formData.fatherQualification} onChange={handleInputChange} className="glass-input" placeholder="e.g. B.Tech, 12th Pass" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Occupation</label>
                <input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleInputChange} className="glass-input" placeholder="e.g. Business, Service" />
              </div>
              <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Contact Number (Country Code)</label>
                  <PhoneInput
                    country={'in'}
                    value={formData.parentPhone}
                    onChange={(phone) => setFormData({ ...formData, parentPhone: phone ? '+' + phone : '' })}
                    inputClass="glass-input"
                    containerStyle={{ width: '100%' }}
                    inputStyle={{ width: '100%', background: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', paddingLeft: '48px', height: '42px', borderRadius: '8px' }}
                    buttonStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px 0 0 8px' }}
                  />
              </div>
            </div>

            {/* Mother Details */}
            <div style={{ borderTop: '1px dashed var(--glass-border)', margin: '8px 0 16px', paddingTop: '16px' }}>
              <h4 style={{ margin: '0 0 16px 0', color: 'var(--primary-color)' }}>👩 Mother's Details</h4>
            </div>
            <div className="form-grid" style={{ marginBottom: "24px" }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Mother's Name</label>
                <input type="text" name="motherName" value={formData.motherName} onChange={handleInputChange} className="glass-input" placeholder="e.g. Sunita Devi" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Aadhar Number</label>
                <input type="text" name="motherAadhar" value={formData.motherAadhar} onChange={handleInputChange} className="glass-input" placeholder="0000 0000 0000" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Qualification</label>
                <input type="text" name="motherQualification" value={formData.motherQualification} onChange={handleInputChange} className="glass-input" placeholder="e.g. B.A., 10th Pass" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Occupation</label>
                <input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleInputChange} className="glass-input" placeholder="e.g. Homemaker, Teacher" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Contact Number</label>
                <input type="text" name="motherPhone" value={formData.motherPhone} onChange={handleInputChange} className="glass-input" placeholder="+91 9876543211" />
              </div>
            </div>

            {/* Emergency Contact */}
            <div style={{ borderTop: '2px dashed var(--text-muted)', margin: '16px 0 16px', paddingTop: '24px' }}>
              <div className="form-grid">
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Emergency Contact</label>
                  <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} className="glass-input" placeholder="+91 8765432109" />
                </div>
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
