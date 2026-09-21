import { verifyAdminPassword } from '../services/authService';
import React, { useEffect, useState, useRef } from 'react';
import Loader from '../components/Loader';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IndianRupee, Plus, FileText, AlertTriangle, ArrowLeft, Camera, X, Edit, Save, Trash2, Printer, GraduationCap, User, Phone, Calendar, Activity, MapPin, Mail, Hash, Shield, Bus, Heart, Users, CheckCircle, Droplet, Clock, Send, Circle, XCircle, CreditCard } from 'lucide-react';
import { getStudentById, updateStudent, type StudentData } from '../services/studentService';
import { getClasses, type ClassData } from '../services/classService';
import { uploadImageToCloudinary } from '../lib/cloudinary';
import { generateNativePdfReceiptBase64 } from '../lib/pdfGenerator';
import { QRCodeSVG } from 'qrcode.react';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Cropper from 'react-easy-crop';
import { getTransactions, addTransaction, deleteTransaction, updateTransaction, type TransactionData } from '../services/financeService';
import { getSchoolSettings, saveSchoolSettings } from '../services/settingsService';
import { getAllAttendanceForClass, type AttendanceRecord } from '../services/attendanceService';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const getISTDateTimeLocalString = () => {
  const now = new Date();
  const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
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


const InfoBadge = ({ icon, bg, label, value, wrapText = false }: { icon: React.ReactNode, bg: string, label: string, value: string | number | undefined, wrapText?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icon}
    </div>
    <div style={{ overflow: 'hidden', minWidth: 0 }}>
      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={label}>{label}</div>
      <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 700, whiteSpace: wrapText ? 'normal' : 'nowrap', overflow: wrapText ? 'visible' : 'hidden', textOverflow: wrapText ? 'clip' : 'ellipsis', wordBreak: wrapText ? 'break-word' : 'normal' }} title={typeof value === 'string' ? value : undefined}>{value || 'N/A'}</div>
    </div>
  </div>
);

const calculateAge = (dobString: string | undefined) => {
  if (!dobString) return '';
  const birthDate = new Date(dobString);
  const difference = Date.now() - birthDate.getTime();
  const ageDate = new Date(difference);
  return ` (${Math.abs(ageDate.getUTCFullYear() - 1970)} Yrs)`;
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
  const [activeTab, setActiveTab] = useState<'profile' | 'finance' | 'documents' | 'attendance' | 'id-card'>('profile');
  const [newDocs, setNewDocs] = useState<{ name: string, file: File | null }[]>([]);
  const [docsToRemove, setDocsToRemove] = useState<string[]>([]);
  const [newDocName, setNewDocName] = useState('');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);

  const [studentMonth, setStudentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [schoolSettings, setSchoolSettings] = useState<any>(null);

  useEffect(() => {
    if (student && studentClass?.id && student.sectionId) {
      const fetchStudentAtt = async () => {
        const activeSession = localStorage.getItem('activeSession') || '2026-2027';
        try {
          const allAtt = await getAllAttendanceForClass(studentClass.id, student.sectionId, activeSession);
          const filtered = allAtt.filter(r => r.date.startsWith(studentMonth));
          setAttendanceRecords(filtered);
        } catch (e) {
          console.error("Error fetching student attendance", e);
        }
      };
      fetchStudentAtt();
    }
  }, [student, studentClass, studentMonth]);

  const handleAddDoc = () => {
    if (newDocName && newDocFile) {
      setNewDocs([...newDocs, { name: newDocName, file: newDocFile }]);
      setNewDocName('');
      setNewDocFile(null);
    }
  };

  const handleRemoveNewDoc = (idx: number) => {
    setNewDocs(newDocs.filter((_, i) => i !== idx));
  };


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
  const [newFine, setNewFine] = useState({ amount: '', description: '', type: 'Late Fine', date: getISTDateTimeLocalString() });


  // Month Filter
  const [filterMonth, setFilterMonth] = useState('All');

  // Delete transaction
  const [deleteTxnId, setDeleteTxnId] = useState<string | null>(null);
  const [isDeleteTxnModalOpen, setIsDeleteTxnModalOpen] = useState(false);
  const [deleteTxnPassword, setDeleteTxnPassword] = useState('');
  const [deleteTxnError, setDeleteTxnError] = useState('');
  const [isEditTxnModalOpen, setIsEditTxnModalOpen] = useState(false);
  const [editTxnPassword, setEditTxnPassword] = useState('');
  const [editTxnError, setEditTxnError] = useState('');
  const [editTxnData, setEditTxnData] = useState<any>(null);


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
          const cls = classes.find(c => c.id === studentData.classId || (c.className && studentData.classId && c.className.trim().toLowerCase() === studentData.classId.trim().toLowerCase()));
          if (cls) setStudentClass(cls);

          const txns = await getTransactions({ studentId: id });
          setTransactions(txns);

          const settings = await getSchoolSettings();
          if (settings) {
            setSchoolSettings(settings);
            if (settings.customChargeTypes) setCustomChargeTypes(settings.customChargeTypes);
          }
        }
      } catch (error) {
        console.error("Error fetching student details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);


  const [sendingTxnId, setSendingTxnId] = useState<string | null>(null);

  const generatePdfBase64 = async (txn: any): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const base64 = await generateNativePdfReceiptBase64(student, txn, studentClass?.className || student.classId || 'Unknown', await getSchoolSettings());
        resolve(base64);
      } catch (err) {
        console.error("PDF Gen Error:", err);
        reject(err);
      }
    });
  };

  const handleSendWhatsAppReceipt = async (txn: any) => {
    const phone = student.parentPhone || student.phone || student.motherPhone || student.emergencyContact;
    if (!phone) {
      toast.error('No contact number available for student.');
      return;
    }

    setSendingTxnId(txn.id);
    try {
      const settings = await getSchoolSettings();
      let template = settings?.feeReceiptTemplate || `Dear Parent,\nWe have received a fee payment of Rs. {{amount}} for your ward {{name}}.\nPlease find the attached receipt.\nThank you.\nMN Public School`;

      let message = template
        .replace(/{{amount}}/g, txn.amount.toString())
        .replace(/{{name}}/g, `${student.firstName} ${student.lastName}`);

      message += `\n\n*Receipt Details:*`;
      message += `\nDate: ${new Date(txn.date).toLocaleDateString()}`;
      message += `\nDescription: ${txn.description}`;
      message += `\nPaid: ₹${txn.amount}`;
      if (txn.runningBalance !== undefined && txn.runningBalance > 0) {
        message += `\nPending Dues: ₹${txn.runningBalance}`;
      } else if (txn.runningBalance !== undefined && txn.runningBalance < 0) {
        message += `\nAdvance Balance: ₹${Math.abs(txn.runningBalance)}`;
      }

      let cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
      const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

      // Generate PDF
      const base64Pdf = await generatePdfBase64(txn);

      const schoolName = settings?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'School';
      const studentName = `${student.firstName}_${student.lastName}`.replace(/[^a-zA-Z0-9]/g, '_');
      const receiptNo = txn.receiptNo || txn.id?.substring(0, 8);
      const properPdfName = `${schoolName}_FeeReceipt_${studentName}_${receiptNo}.pdf`;

      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formattedPhone,
          message: message,
          base64Pdf: base64Pdf,
          pdfName: properPdfName
        })
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(response.status === 413 ? 'PDF is too large to send' : 'Server error: Invalid JSON response');
      }

      if (!response.ok) throw new Error(data?.error || 'Failed to send WhatsApp message');

      toast.success('Receipt sent via WhatsApp successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSendingTxnId(null);
    }
  };

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string>('Receipt.pdf');

  const handlePrintReceipt = async (txn: any) => {
    try {
      const toastId = toast.loading("Generating receipt...");
      const settings = await getSchoolSettings();
      const base64 = await generateNativePdfReceiptBase64(student, txn, studentClass?.className || student.classId || 'Unknown', settings);

      const schoolName = settings?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'School';
      const studentName = `${student.firstName}_${student.lastName}`.replace(/[^a-zA-Z0-9]/g, '_');
      const receiptNo = txn.receiptNo || txn.id?.substring(0, 8);
      const properPdfName = `${schoolName}_FeeReceipt_${studentName}_${receiptNo}.pdf`;

      const byteCharacters = atob(base64.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      toast.dismiss(toastId);
      setPdfFilename(properPdfName);
      setPdfPreviewUrl(blobUrl);
    } catch (error) {
      console.error("Print Error:", error);
      toast.error("Failed to generate PDF for printing");
    }
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



  const handleEditTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await verifyAdminPassword(editTxnPassword);
    if (!isValid) {
      setEditTxnError('Incorrect admin password.');
      return;
    }
    if (!editTxnData || !editTxnData.id) return;

    try {
      await updateTransaction(editTxnData.id, {
        amount: Number(editTxnData.amount),
        description: editTxnData.description,
        date: editTxnData.date
      });
      setIsEditTxnModalOpen(false);
      setEditTxnData(null);
      setEditTxnPassword('');
      setEditTxnError('');
      const txns = await getTransactions({ studentId: id! });
      setTransactions(txns);
    } catch (error) {
      console.error(error);
      setEditTxnError('Failed to update transaction.');
    }
  };

  const handleDeleteTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await verifyAdminPassword(deleteTxnPassword);
    if (!isValid) {
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

  const handleToggleStatus = async () => {
    if (!id || !student || !['Admin', 'Principal', 'Manager', 'Super Admin'].includes(role)) return;
    try {
      const newStatus = student.status === 'Active' ? 'Inactive' : 'Active';
      await updateStudent(id, { status: newStatus });
      setStudent({ ...student, status: newStatus });
    } catch (e) {
      console.error("Error toggling status", e);
    }
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

  if (loading) return <Loader message="Loading data..." />;
  if (!student) return <div>Student not found.</div>;

  const studentSpecificRecords = attendanceRecords.filter(r => r.records[id!] === 'Present' || r.records[id!] === 'Absent');

  const previousDues = student.previousDues || 0;
  const previousPaidAmount = student.previousPaidAmount || 0;
  const previousPending = previousDues - previousPaidAmount;

  // Filter out any transaction that has 'Previous' in it if we want, but since they are added manually,
  // we just use the transactions array.

  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let currentBal = 0;
  const ledgerRows = sortedTransactions.map(t => {
    if (t.type === 'Charge') currentBal += t.amount;
    else if (t.type === 'Income' || t.type === 'Discount') currentBal -= t.amount;
    return { ...t, runningBalance: currentBal };
  });

  const currentDue = currentBal > 0 ? currentBal : 0;
  const currentAdvance = currentBal < 0 ? Math.abs(currentBal) : 0;

  const availableMonths = Array.from(new Set(ledgerRows.map(t => t.date.substring(0, 7)))).sort().reverse();

  const displayedRows = filterMonth === 'All'
    ? ledgerRows.slice().reverse()
    : ledgerRows.slice().reverse().filter(t => t.date.startsWith(filterMonth));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex-responsive" style={{ marginBottom: "20px" }}>
        <button onClick={() => navigate(-1)} className="btn-secondary" style={{ background: 'transparent', border: 'none', padding: 0, color: '#64748b', fontWeight: 600 }}>
          <ArrowLeft size={18} style={{ marginRight: '6px' }} /> Back to Directory
        </button>
      </div>

      {/* Modern, Beautiful, Colorful Header */}
      <div className="glass-panel" style={{
        padding: '32px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
        flexWrap: 'wrap',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        borderTop: '5px solid #6366f1',
        boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
      }}>
        <div style={{ position: 'relative' }}>
          <img
            src={student.photoUrl || `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=6366f1&color=ffffff`}
            alt="Profile"
            style={{ width: '130px', height: '130px', borderRadius: '50%', border: '6px solid white', boxShadow: '0 8px 20px rgba(99,102,241,0.15)', objectFit: 'cover' }}
          />
        </div>

        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, color: '#0f172a' }}>{student.firstName} {student.lastName}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: student.status === 'Active' ? '#dcfce7' : '#fee2e2', color: student.status === 'Active' ? '#166534' : '#991b1b', padding: '6px 14px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 700, userSelect: 'none' }}>
                {student.status === 'Active' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />} {student.status || 'Active'}
              </span>

              {['Admin', 'Principal', 'Manager', 'Super Admin'].includes(role) && (
                <div
                  onClick={handleToggleStatus}
                  style={{ width: '44px', height: '24px', background: student.status === 'Active' ? '#16a34a' : '#cbd5e1', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}
                  title={student.status === 'Active' ? 'Click to Deactivate' : 'Click to Activate'}
                >
                  <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: student.status === 'Active' ? '22px' : '2px', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '6px 16px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GraduationCap size={16} /> Class {studentClass?.className || student.classId} {student.sectionId}
            </span>
            <span style={{ background: '#fef3c7', color: '#92400e', padding: '6px 16px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Hash size={16} /> Roll: {student.rollNumber || 'N/A'}
            </span>
            <span style={{ background: '#f3e8ff', color: '#6b21a8', padding: '6px 16px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={16} /> Adm: {student.admissionNo || 'N/A'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {['Admin', 'Principal', 'Manager', 'Super Admin'].includes(role) && (
            <button className="btn-primary hover-scale" onClick={() => setIsEditing(true)} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: 'none', fontWeight: 700, padding: '14px 28px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 15px rgba(99,102,241,0.2)' }}>
              <Edit size={18} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Elegant Underline Tabs */}
      <div style={{ display: 'flex', gap: '32px', marginBottom: '24px', overflowX: 'auto', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px' }}>
        <div onClick={() => setActiveTab('profile')} style={{ padding: '0 0 12px 0', borderBottom: activeTab === 'profile' ? '3px solid #6366f1' : '3px solid transparent', color: activeTab === 'profile' ? '#4f46e5' : '#64748b', fontWeight: 700, cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} /> Profile Overview
        </div>
        <div onClick={() => setActiveTab('id-card')} style={{ padding: '0 0 12px 0', borderBottom: activeTab === 'id-card' ? '3px solid #6366f1' : '3px solid transparent', color: activeTab === 'id-card' ? '#4f46e5' : '#64748b', fontWeight: 700, cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={18} /> Smart ID Card
        </div>
        <div onClick={() => setActiveTab('attendance')} style={{ padding: '0 0 12px 0', borderBottom: activeTab === 'attendance' ? '3px solid #6366f1' : '3px solid transparent', color: activeTab === 'attendance' ? '#4f46e5' : '#64748b', fontWeight: 700, cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} /> Attendance
        </div>
        {role !== 'Teacher' && (
          <div onClick={() => setActiveTab('finance')} style={{ padding: '0 0 12px 0', borderBottom: activeTab === 'finance' ? '3px solid #6366f1' : '3px solid transparent', color: activeTab === 'finance' ? '#4f46e5' : '#64748b', fontWeight: 700, cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IndianRupee size={18} /> Financial Ledger
          </div>
        )}
        {role !== 'Teacher' && (
          <div onClick={() => setActiveTab('documents')} style={{ padding: '0 0 12px 0', borderBottom: activeTab === 'documents' ? '3px solid #6366f1' : '3px solid transparent', color: activeTab === 'documents' ? '#4f46e5' : '#64748b', fontWeight: 700, cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} /> Documents
          </div>
        )}
      </div>

      {/* TAB CONTENT: PROFILE */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '40px' }}>

          {/* Academic Info */}
          <div className="glass-panel" style={{ padding: '24px', background: 'white' }}>
            <h3 style={{ margin: '0 0 24px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
              <div style={{ background: '#e0e7ff', padding: '8px', borderRadius: '10px' }}><GraduationCap size={20} color="#4f46e5" /></div> Academic Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
              <InfoBadge icon={<Calendar size={20} color="#0284c7" />} bg="#e0f2fe" label="Admission Date" value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : ''} />
              <InfoBadge icon={<CheckCircle size={20} color="#16a34a" />} bg="#dcfce7" label="Admission Type" value={student.admissionType} />
              <InfoBadge icon={<Clock size={20} color="#d946ef" />} bg="#fae8ff" label="Session" value={student.session} />
              <InfoBadge icon={<Bus size={20} color="#ea580c" />} bg="#ffedd5" label="Transport Route" value={student.transportRoute} />
              <InfoBadge icon={<IndianRupee size={20} color="#059669" />} bg="#d1fae5" label="Fee Group" value={student.feeGroup} />
            </div>
          </div>

          {/* Personal Info */}
          <div className="glass-panel" style={{ padding: '24px', background: 'white' }}>
            <h3 style={{ margin: '0 0 24px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
              <div style={{ background: '#fae8ff', padding: '8px', borderRadius: '10px' }}><User size={20} color="#c026d3" /></div> Personal Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
              <InfoBadge icon={<Calendar size={20} color="#f59e0b" />} bg="#fef3c7" label="Date of Birth" value={student.dob ? new Date(student.dob).toLocaleDateString() + calculateAge(student.dob) : ''} />
              <InfoBadge icon={<Users size={20} color="#8b5cf6" />} bg="#ede9fe" label="Gender" value={student.gender} />
              <InfoBadge icon={<Shield size={20} color="#10b981" />} bg="#d1fae5" label="Religion" value={student.religion} />
              <InfoBadge icon={<Users size={20} color="#f43f5e" />} bg="#ffe4e6" label="Category/Caste" value={student.category ? `${student.category} / ${student.caste || ''}` : student.caste} />
              <InfoBadge icon={<Droplet size={20} color="#e11d48" />} bg="#ffe4e6" label="Blood Group" value={student.bloodGroup} />
              <InfoBadge icon={<FileText size={20} color="#3b82f6" />} bg="#dbeafe" label="Aadhar Number" value={student.aadharNumber || student.nationalIdNumber} />
            </div>
          </div>

          {/* Parent/Contact Info */}
          <div className="glass-panel" style={{ padding: '24px', background: 'white', gridColumn: '1 / -1' }}>
            <h3 style={{ margin: '0 0 24px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
              <div style={{ background: '#ccfbf1', padding: '8px', borderRadius: '10px' }}><Phone size={20} color="#0d9488" /></div> Parent & Contact Info
            </h3>
            {/* Father Sub-section */}
            <h4 style={{ margin: '0 0 16px 0', color: '#2563eb', fontSize: '1rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px', display: 'inline-block' }}>Father's Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              <InfoBadge icon={<User size={20} color="#2563eb" />} bg="#dbeafe" label="Father's Name" value={student.parentName} />
              <InfoBadge icon={<Shield size={20} color="#2563eb" />} bg="#dbeafe" label="Father Aadhar" value={student.fatherAadhar || student.parentAadhar} />
              <InfoBadge icon={<GraduationCap size={20} color="#2563eb" />} bg="#dbeafe" label="Father Qual." value={student.fatherQualification} />
              <InfoBadge icon={<Activity size={20} color="#2563eb" />} bg="#dbeafe" label="Father Occ." value={student.fatherOccupation} />
            </div>

            {/* Mother Sub-section */}
            <h4 style={{ margin: '0 0 16px 0', color: '#db2777', fontSize: '1rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px', display: 'inline-block' }}>Mother's Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              <InfoBadge icon={<User size={20} color="#db2777" />} bg="#fce7f3" label="Mother's Name" value={student.motherName} />
              <InfoBadge icon={<Shield size={20} color="#db2777" />} bg="#fce7f3" label="Mother Aadhar" value={student.motherAadhar} />
              <InfoBadge icon={<GraduationCap size={20} color="#db2777" />} bg="#fce7f3" label="Mother Qual." value={student.motherQualification} />
              <InfoBadge icon={<Activity size={20} color="#db2777" />} bg="#fce7f3" label="Mother Occ." value={student.motherOccupation} />
            </div>

            {/* Contact Sub-section */}
            <h4 style={{ margin: '0 0 16px 0', color: '#0d9488', fontSize: '1rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px', display: 'inline-block' }}>Contact Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              <InfoBadge icon={<Phone size={20} color="#16a34a" />} bg="#dcfce7" label="Primary Phone" value={student.parentPhone || student.phone} />
              <InfoBadge icon={<AlertTriangle size={20} color="#ea580c" />} bg="#ffedd5" label="Emergency Contact" value={student.emergencyContact} />
              <InfoBadge icon={<Mail size={20} color="#8b5cf6" />} bg="#ede9fe" label="Email Address" value={student.email} />
              <div style={{ gridColumn: '1 / -1' }}>
                <InfoBadge icon={<MapPin size={20} color="#0284c7" />} bg="#e0f2fe" label="Full Address" value={student.address} wrapText={true} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: FINANCE */}
      {activeTab === 'finance' && (
        <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px', background: 'white' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: "32px" }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem' }}>
              <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '12px' }}><IndianRupee size={24} color="#16a34a" /></div> Financial Ledger
            </h3>
            {['Admin', 'Principal', 'Manager', 'Super Admin'].includes(role) && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-primary" onClick={() => setIsPaymentModalOpen(true)} style={{ padding: '10px 20px', borderRadius: '12px', background: '#10b981', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={18} /> Receive Payment
                </button>
                <button className="btn-primary" onClick={() => setIsFineModalOpen(true)} style={{ padding: '10px 20px', borderRadius: '12px', background: '#ef4444', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={18} /> Add Manual Dues
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{ padding: '24px', borderRadius: '20px', background: currentBal > 0 ? '#fef2f2' : '#f8fafc', border: '1px solid', borderColor: currentBal > 0 ? '#fecaca' : '#e2e8f0', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ background: currentBal > 0 ? '#fee2e2' : '#f1f5f9', padding: '16px', borderRadius: '16px' }}>
                <AlertTriangle size={32} color={currentBal > 0 ? '#ef4444' : '#94a3b8'} />
              </div>
              <div>
                <div style={{ color: currentBal > 0 ? '#ef4444' : '#64748b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Pending Dues</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: currentBal > 0 ? '#ef4444' : '#1e293b' }}>₹{currentDue}</div>
              </div>
            </div>
            <div style={{ padding: '24px', borderRadius: '20px', background: currentAdvance > 0 ? '#f0fdf4' : '#f8fafc', border: '1px solid', borderColor: currentAdvance > 0 ? '#bbf7d0' : '#e2e8f0', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ background: currentAdvance > 0 ? '#dcfce7' : '#f1f5f9', padding: '16px', borderRadius: '16px' }}>
                <CheckCircle size={32} color={currentAdvance > 0 ? '#10b981' : '#94a3b8'} />
              </div>
              <div>
                <div style={{ color: currentAdvance > 0 ? '#10b981' : '#64748b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Advance Paid</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: currentAdvance > 0 ? '#10b981' : '#1e293b' }}>₹{currentAdvance}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontWeight: 600, color: '#334155' }}>Transaction History</div>
            <select className="glass-input" style={{ width: '250px', background: '#f8fafc' }} value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
              <option value="All">All Months</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>{new Date(m + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}</option>
              ))}
            </select>
          </div>

          <div className="glass-table-container" style={{ maxHeight: '400px', overflowY: 'auto', overflowX: 'auto', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <table style={{ width: '100%', minWidth: '700px' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                <tr>
                  <th style={{ padding: '16px' }}>Date</th>
                  <th style={{ padding: '16px' }}>Description</th>
                  <th style={{ color: '#ef4444', padding: '16px' }}>Charge (Due)</th>
                  <th style={{ color: '#10b981', padding: '16px' }}>Payment (Paid)</th>
                  <th style={{ padding: '16px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                      <FileText size={40} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                      No financial records found.
                    </td>
                  </tr>
                ) : (
                  displayedRows.map(row => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ whiteSpace: 'nowrap', padding: '16px' }}>{new Date(row.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td style={{ padding: '16px', fontWeight: 500 }}>{row.description || row.category}</td>
                      <td style={{ color: '#ef4444', fontWeight: row.type === 'Charge' ? 700 : 400, padding: '16px' }}>{row.type === 'Charge' ? `₹${row.amount}` : '-'}</td>
                      <td style={{ color: '#10b981', fontWeight: row.type !== 'Charge' ? 700 : 400, padding: '16px' }}>{row.type !== 'Charge' ? `₹${row.amount}` : '-'}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {row.type !== 'Charge' && (
                            <>
                              <button onClick={() => handlePrintReceipt(row)} style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                                <Printer size={14} /> Receipt
                              </button>
                              {['Admin', 'Principal', 'Manager', 'Super Admin'].includes(role) && (
                                <button onClick={() => handleSendWhatsAppReceipt(row)} disabled={sendingTxnId === row.id} style={{ background: '#dcfce7', color: '#16a34a', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: sendingTxnId === row.id ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, opacity: sendingTxnId === row.id ? 0.7 : 1 }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.47-1.761-1.643-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51h-.57c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.416z" /></svg> {sendingTxnId === row.id ? 'Sending...' : 'Send'}
                                </button>
                              )}
                            </>
                          )}
                          {['Admin', 'Principal', 'Manager', 'Super Admin'].includes(role) && row && (
                            <>
                              <button onClick={() => { setEditTxnData(row); setIsEditTxnModalOpen(true); }} style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Edit">
                                <Edit size={14} />
                              </button>
                              <button onClick={() => { setDeleteTxnId(row.id || null); setIsDeleteTxnModalOpen(true); }} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px', background: 'white' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: "32px" }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem' }}>
              <div style={{ background: '#e0e7ff', padding: '10px', borderRadius: '12px' }}><Calendar size={24} color="#4f46e5" /></div> Attendance History
            </h3>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <label style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Month:</label>
              <input type="month" className="glass-input" style={{ marginBottom: 0 }} value={studentMonth} onChange={e => setStudentMonth(e.target.value)} />
            </div>
          </div>

          <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div style={{ fontSize: '0.85rem', color: '#6366f1', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Total Working Days</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6366f1' }}>{studentSpecificRecords.length}</div>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ fontSize: '0.85rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Present</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{studentSpecificRecords.filter(r => r.records[id!] === 'Present').length}</div>
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div style={{ fontSize: '0.85rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Absent</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>{studentSpecificRecords.filter(r => r.records[id!] === 'Absent').length}</div>
            </div>
          </div>

          {studentSpecificRecords.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No attendance records found for this month.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...studentSpecificRecords].sort((a, b) => a.date.localeCompare(b.date)).map(r => {
                    const status = r.records[id!] || 'Unmarked';
                    return (
                      <tr key={r.date} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <td style={{ padding: '12px', color: 'var(--text-main)', fontWeight: 500 }}>
                          {new Date(r.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {status === 'Present' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--success)', background: 'rgba(16,185,129,0.1)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}><CheckCircle size={14} /> Present</span>}
                          {status === 'Absent' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--danger)', background: 'rgba(239,68,68,0.1)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}><XCircle size={14} /> Absent</span>}
                          {status === 'Unmarked' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', background: 'var(--glass-bg)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}><Circle size={14} /> Not Marked</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ID CARD */}
      {activeTab === 'id-card' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
          <div className="no-print" style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
            <button className="btn-primary" onClick={() => window.print()}><Printer size={18} /> Print ID Card</button>
          </div>

          <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '20px', display: 'flex', justifyContent: 'center' }}>
            <div className="id-card-print-container" style={{ position: 'relative', width: '520px', minWidth: '520px', height: '330px', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
              {/* Top Header / School branding */}
              <div style={{ background: 'linear-gradient(135deg, #6c3505ff 0%, #8a370eff 100%)', color: 'white', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                <img src={schoolSettings?.logoUrl || "/images/logo_circular.png"} alt="School Logo" style={{ width: '56px', height: '56px', objectFit: 'contain', background: 'white', borderRadius: '8px', padding: '2px' }} />
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontWeight: 900, fontSize: '1.4rem', lineHeight: '1.1', letterSpacing: '0.5px' }}>{schoolSettings?.schoolName || 'School Name Not Set'}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.95, marginTop: '2px', lineHeight: '1.2' }}>{schoolSettings?.address || 'School Address Not Set'}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.95, lineHeight: '1.2' }}>{schoolSettings?.phone || 'N/A'}, {schoolSettings?.email || 'N/A'}</div>
                </div>
              </div>

              {/* Identity Text */}
              <div style={{ background: '#ffe9e0ff', color: '#8a370eff', textAlign: 'center', fontSize: '0.7rem', fontWeight: 800, padding: '3px 0', textTransform: 'uppercase', letterSpacing: '3px', borderBottom: '1px solid #c7d2fe' }}>
                Identity Card
              </div>

              {/* Body */}
              <div style={{ display: 'flex', flex: 1, padding: '12px 16px', gap: '16px', position: 'relative', zIndex: 1 }}>
                {/* Left Column (Photo) */}
                <div style={{ width: '90px' }}>
                  <div style={{ width: '90px', height: '110px', borderRadius: '8px', border: '2px solid #6d2d08ff', overflow: 'hidden', background: '#f1f5f9', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <img src={student.photoUrl || `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=4f46e5&color=fff&size=150`} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>

                {/* Middle Column (Details) */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontWeight: 900, fontSize: '1.3rem', color: '#1e293b', lineHeight: '1.1', textTransform: 'uppercase' }}>
                    {student.firstName} {student.lastName}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '4px 0 8px 0' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff', background: '#8a370eff', padding: '2px 8px', borderRadius: '12px' }}>Class: {studentClass?.className || 'N/A'}{student.sectionId ? ` - ${student.sectionId}` : ''}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>Roll: {student.rollNumber || 'N/A'}</span>
                  </div>

                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex' }}><span style={{ width: '70px', fontWeight: 700, color: '#64748b' }}>F. Name:</span> <span style={{ fontWeight: 800, color: '#1e293b', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.parentName || 'N/A'}</span></div>
                    <div style={{ display: 'flex' }}><span style={{ width: '70px', fontWeight: 700, color: '#64748b' }}>DOB:</span> <span style={{ fontWeight: 800, color: '#1e293b', flex: 1 }}>{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'}</span></div>
                    <div style={{ display: 'flex' }}><span style={{ width: '70px', fontWeight: 700, color: '#64748b' }}>Blood Grp:</span> <span style={{ fontWeight: 900, color: '#ef4444', flex: 1 }}>{student.bloodGroup || 'N/A'}</span></div>
                    <div style={{ display: 'flex' }}><span style={{ width: '70px', fontWeight: 700, color: '#64748b' }}>Contact:</span> <span style={{ fontWeight: 800, color: '#1e293b', flex: 1 }}>{student.parentPhone || student.phone || 'N/A'}</span></div>
                    <div style={{ display: 'flex' }}><span style={{ width: '70px', fontWeight: 700, color: '#64748b' }}>Address:</span> <span style={{ fontWeight: 700, color: '#334155', flex: 1, lineHeight: '1.2', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{student.address || 'N/A'}</span></div>
                    <div style={{ display: 'flex' }}><span style={{ width: '70px', fontWeight: 700, color: '#64748b' }}>Website:</span> <span style={{ fontWeight: 700, color: '#334155', flex: 1, lineHeight: '1.2', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{schoolSettings?.website || 'Website Not Set'}</span></div>
                  </div>
                </div>

                {/* Right Column (QR & Signature) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', width: '80px' }}>
                  <div style={{ padding: '4px', background: 'white', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex' }}>
                    <QRCodeSVG value={`Student ID: ${student.id}\nName: ${student.firstName} ${student.lastName}\nClass: ${studentClass?.className}\nPhone: ${student.parentPhone}`} size={64} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto' }}>
                    {schoolSettings?.signatureUrl ? (
                      <img src={schoolSettings.signatureUrl} alt="Signature" style={{ height: '30px', objectFit: 'contain', marginBottom: '2px' }} />
                    ) : (
                      <div style={{ height: '30px', borderBottom: '1px solid #cbd5e1', width: '70px', marginBottom: '2px' }}></div>
                    )}
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Principal</span>
                  </div>
                </div>
              </div>

              {/* Background pattern overlay */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%234f46e5\' fill-opacity=\'0.03\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")', pointerEvents: 'none', zIndex: 0 }}></div>
            </div>
          </div>
          <style>{`
            @media print {
              body * { visibility: hidden; }
              .id-card-print-container, .id-card-print-container * { visibility: visible; }
              .id-card-print-container {
                position: absolute !important;
                left: 50% !important;
                top: 50px !important;
                transform: translateX(-50%) !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: 1px solid #ccc !important;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
          `}</style>
        </div>
      )}

      {/* TAB CONTENT: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px', background: 'white' }}>
          <h3 style={{ margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem' }}>
            <div style={{ background: '#e0e7ff', padding: '10px', borderRadius: '12px' }}><FileText size={24} color="#4f46e5" /></div> Uploaded Documents
          </h3>

          {student.documents && student.documents.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {student.documents.map((doc, idx) => (
                <a key={idx} href={doc.url} target="_blank" rel="noreferrer" style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '20px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textDecoration: 'none',
                  color: '#1e293b', transition: '0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                }} className="hover-scale">
                  <div style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <FileText size={40} color="#6366f1" />
                  </div>
                  <span style={{ fontWeight: 700, textAlign: 'center', fontSize: '1.1rem' }}>{doc.name}</span>
                </a>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #cbd5e1' }}>
              <div style={{ background: 'white', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                <FileText size={40} color="#cbd5e1" />
              </div>
              <h4 style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '1.2rem' }}>No Documents</h4>
              <p style={{ color: '#94a3b8', margin: 0, fontWeight: 500 }}>This student hasn't uploaded any documents yet.</p>
            </div>
          )}
        </div>
      )}

      {/* FULL SCREEN EDIT MODAL */}
      {isEditing && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="edit-modal-container" style={{
            background: '#ffffff', width: '90%', maxWidth: '1000px', height: '90vh',
            borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <style>{`
              .edit-modal-container .glass-input {
                width: 100%;
                padding: 10px 14px !important;
                border: 1px solid #cbd5e1 !important;
                border-radius: 8px !important;
                background: #f8fafc !important;
                font-size: 0.95rem !important;
                color: #1e293b !important;
                box-shadow: none !important;
              }
              .edit-modal-container .glass-input:focus {
                border-color: #6366f1 !important;
                box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important;
                outline: none !important;
                background: #ffffff !important;
              }
              .edit-modal-container label {
                display: block !important;
                font-size: 0.85rem !important;
                font-weight: 600 !important;
                color: #64748b !important;
                margin-bottom: 6px !important;
              }
            `}</style>
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem', color: '#1e293b' }}>
                <Edit size={24} className="text-primary" /> Edit Profile
              </h2>
              <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}>
                <X size={24} color="#64748b" />
              </button>
            </div>

            <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>

                {/* Academic Section */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: 'var(--primary)', borderBottom: '2px solid var(--primary)', paddingBottom: '8px', display: 'inline-block' }}>Academic Details</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    <div><label>Class ID</label><input className="glass-input" value={editData.classId || ''} onChange={e => setEditData({ ...editData, classId: e.target.value })} /></div>
                    <div><label>Section</label><input className="glass-input" value={editData.sectionId || ''} onChange={e => setEditData({ ...editData, sectionId: e.target.value })} /></div>
                    <div><label>Roll Number</label><input type="number" className="glass-input" value={editData.rollNumber || ''} onChange={e => setEditData({ ...editData, rollNumber: Number(e.target.value) })} /></div>
                    <div><label>Admission No</label><input className="glass-input" value={editData.admissionNo || ''} onChange={e => setEditData({ ...editData, admissionNo: e.target.value })} /></div>
                    <div><label>Admission Date</label><input type="date" className="glass-input" value={editData.admissionDate || ''} onChange={e => setEditData({ ...editData, admissionDate: e.target.value })} /></div>
                    <div><label>Session</label><input className="glass-input" value={editData.session || ''} onChange={e => setEditData({ ...editData, session: e.target.value })} /></div>
                    <div>
                      <label>Fee Group</label>
                      <select className="glass-input" value={editData.feeGroup || ''} onChange={e => setEditData({ ...editData, feeGroup: e.target.value })}>
                        <option value="General Fee Category">General Fee Category</option>
                        {customChargeTypes.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label>Status</label>
                      <select className="glass-input" value={editData.status || 'Active'} onChange={e => setEditData({ ...editData, status: e.target.value as 'Active' | 'Inactive' })}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Personal Section */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: 'var(--primary)', borderBottom: '2px solid var(--primary)', paddingBottom: '8px', display: 'inline-block' }}>Personal Details</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    <div><label>First Name</label><input className="glass-input" value={editData.firstName || ''} onChange={e => setEditData({ ...editData, firstName: e.target.value })} /></div>
                    <div><label>Last Name</label><input className="glass-input" value={editData.lastName || ''} onChange={e => setEditData({ ...editData, lastName: e.target.value })} /></div>
                    <div><label>Date of Birth</label><input type="date" className="glass-input" value={editData.dob || ''} onChange={e => setEditData({ ...editData, dob: e.target.value })} /></div>
                    <div>
                      <label>Gender</label>
                      <select className="glass-input" value={editData.gender || ''} onChange={e => setEditData({ ...editData, gender: e.target.value })}>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div><label>Religion</label><input className="glass-input" value={editData.religion || ''} onChange={e => setEditData({ ...editData, religion: e.target.value })} /></div>
                    <div><label>Caste</label><input className="glass-input" value={editData.caste || ''} onChange={e => setEditData({ ...editData, caste: e.target.value })} /></div>
                    <div><label>Category</label><input className="glass-input" value={editData.category || ''} onChange={e => setEditData({ ...editData, category: e.target.value })} /></div>
                    <div>
                      <label>Blood Group</label>
                      <select className="glass-input" value={editData.bloodGroup || ''} onChange={e => setEditData({ ...editData, bloodGroup: e.target.value })}>
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
                    <div style={{ gridColumn: '1 / -1' }}><label>Aadhar Number</label><input className="glass-input" value={editData.aadharNumber || ''} onChange={e => setEditData({ ...editData, aadharNumber: e.target.value })} /></div>
                  </div>
                </div>

                {/* Parent Section */}
                <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: 'var(--primary)', borderBottom: '2px solid var(--primary)', paddingBottom: '8px', display: 'inline-block' }}>Parent & Contact Details</h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div><label>Father's Name</label><input className="glass-input" value={editData.parentName || ''} onChange={e => setEditData({ ...editData, parentName: e.target.value })} /></div>
                    <div><label>Father Aadhar</label><input className="glass-input" value={editData.fatherAadhar || ''} onChange={e => setEditData({ ...editData, fatherAadhar: e.target.value })} /></div>
                    <div><label>Father Qualification</label><input className="glass-input" value={editData.fatherQualification || ''} onChange={e => setEditData({ ...editData, fatherQualification: e.target.value })} /></div>
                    <div><label>Father Occupation</label><input className="glass-input" value={editData.fatherOccupation || ''} onChange={e => setEditData({ ...editData, fatherOccupation: e.target.value })} /></div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div><label>Mother's Name</label><input className="glass-input" value={editData.motherName || ''} onChange={e => setEditData({ ...editData, motherName: e.target.value })} /></div>
                    <div><label>Mother Aadhar</label><input className="glass-input" value={editData.motherAadhar || ''} onChange={e => setEditData({ ...editData, motherAadhar: e.target.value })} /></div>
                    <div><label>Mother Qualification</label><input className="glass-input" value={editData.motherQualification || ''} onChange={e => setEditData({ ...editData, motherQualification: e.target.value })} /></div>
                    <div><label>Mother Occupation</label><input className="glass-input" value={editData.motherOccupation || ''} onChange={e => setEditData({ ...editData, motherOccupation: e.target.value })} /></div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    <div><label>Primary Phone</label><input className="glass-input" value={editData.parentPhone || ''} onChange={e => setEditData({ ...editData, parentPhone: e.target.value })} /></div>
                    <div><label>Emergency Contact</label><input className="glass-input" value={editData.emergencyContact || ''} onChange={e => setEditData({ ...editData, emergencyContact: e.target.value })} /></div>
                    <div><label>Email Address</label><input type="email" className="glass-input" value={editData.email || ''} onChange={e => setEditData({ ...editData, email: e.target.value })} /></div>
                    <div style={{ gridColumn: '1 / -1' }}><label>Full Address</label><textarea className="glass-input" style={{ width: '100%', minHeight: '80px' }} value={editData.address || ''} onChange={e => setEditData({ ...editData, address: e.target.value })}></textarea></div>
                  </div>
                </div>

                {/* Profile Photo */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: 'var(--primary)', borderBottom: '2px solid var(--primary)', paddingBottom: '8px', display: 'inline-block' }}>Profile Photo</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img src={newPhotoPreview || editData.photoUrl || 'https://ui-avatars.com/api/?name=U+A'} alt="Preview" style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const reader = new FileReader();
                          reader.onload = () => { setRawImage(reader.result); setShowCropper(true); };
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }} />
                      <button type="button" className="btn-secondary" onClick={() => fileInputRef.current?.click()}><Camera size={16} style={{ display: 'inline', marginRight: '4px' }} /> Upload New</button>
                      {(newPhotoPreview || editData.photoUrl) && <button type="button" onClick={handleRemovePhoto} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontWeight: 600 }}>Remove</button>}
                    </div>
                  </div>
                </div>

                {/* Documents Management */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: 'var(--primary)', borderBottom: '2px solid var(--primary)', paddingBottom: '8px', display: 'inline-block' }}>Manage Documents</h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    {(editData.documents || []).map((doc, idx) => {
                      const isRemoved = docsToRemove.includes(doc.url);
                      return (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: isRemoved ? '#fee2e2' : '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ textDecoration: isRemoved ? 'line-through' : 'none', color: isRemoved ? '#ef4444' : '#1e293b', display: 'flex', alignItems: 'center' }}><FileText size={14} style={{ marginRight: '8px' }} /> {doc.name}</span>
                          <button type="button" onClick={() => {
                            if (isRemoved) setDocsToRemove(docsToRemove.filter(u => u !== doc.url));
                            else setDocsToRemove([...docsToRemove, doc.url]);
                          }} style={{ color: isRemoved ? '#10b981' : '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                            {isRemoved ? 'Restore' : 'Delete'}
                          </button>
                        </div>
                      );
                    })}
                    {newDocs.map((doc, idx) => (
                      <div key={`new-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#dcfce7', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}><FileText size={14} style={{ marginRight: '8px' }} /> {doc.name} (New)</span>
                        <button type="button" onClick={() => handleRemoveNewDoc(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Remove</button>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input type="text" className="glass-input" placeholder="Document Name (e.g. TC)" value={newDocName} onChange={e => setNewDocName(e.target.value)} style={{ flex: 1 }} />
                    <input type="file" id="doc_upload" style={{ display: 'none' }} onChange={e => { if (e.target.files && e.target.files[0]) setNewDocFile(e.target.files[0]); }} />
                    <button type="button" className="btn-secondary" onClick={() => document.getElementById('doc_upload').click()}>
                      {newDocFile ? newDocFile.name : 'Choose File'}
                    </button>
                    <button type="button" className="btn-primary" onClick={handleAddDoc} disabled={!newDocName || !newDocFile}>Add</button>
                  </div>
                </div>

              </div>
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', gap: '16px', background: 'white' }}>
              <button type="button" className="btn-secondary" onClick={() => {
                setIsEditing(false);
                setNewDocs([]);
                setDocsToRemove([]);
              }}>Cancel</button>
              <button type="button" className="btn-primary" onClick={handleSaveProfile} disabled={saving} style={{ padding: '12px 32px', fontSize: '1.1rem' }}>
                {saving ? 'Saving...' : <><Save size={18} style={{ display: 'inline', marginRight: '8px' }} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Receive Payment">
        <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Amount (₹)</label>
            <input required type="number" className="glass-input" value={newPayment.amount} onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })} placeholder="e.g. 1500" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Description</label>
            <input type="text" className="glass-input" value={newPayment.description} onChange={e => setNewPayment({ ...newPayment, description: e.target.value })} placeholder="e.g. Term 1 Fee" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Payment Method</label>
            <select className="glass-input" value={newPayment.paymentMethod} onChange={e => setNewPayment({ ...newPayment, paymentMethod: e.target.value as any })}>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Date</label>
            <input required type="datetime-local" className="glass-input" value={newPayment.date} onChange={e => setNewPayment({ ...newPayment, date: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsPaymentModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ background: 'var(--success)' }}>Receive Payment</button>
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
                <select className="glass-input" style={{ flex: 1 }} value={newFine.type} onChange={e => setNewFine({ ...newFine, type: e.target.value })}>
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
            <input required type="text" className="glass-input" value={newFine.description} onChange={e => setNewFine({ ...newFine, description: e.target.value })} placeholder="e.g. September Fee / Books" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Amount (₹)</label>
            <input required type="number" className="glass-input" value={newFine.amount} onChange={e => setNewFine({ ...newFine, amount: e.target.value })} placeholder="e.g. 500" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Date</label>
            <input required type="datetime-local" className="glass-input" value={newFine.date} onChange={e => setNewFine({ ...newFine, date: e.target.value })} />
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

      {/* EDIT TXN MODAL */}
      <Modal isOpen={isEditTxnModalOpen} onClose={() => { setIsEditTxnModalOpen(false); setEditTxnData(null); setEditTxnError(''); }} title="Edit Transaction">
        {editTxnData && (
          <form onSubmit={handleEditTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Amount</label>
              <input required type="number" className="glass-input" value={editTxnData.amount || ''} onChange={e => setEditTxnData({ ...editTxnData, amount: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Description</label>
              <input required type="text" className="glass-input" value={editTxnData.description || ''} onChange={e => setEditTxnData({ ...editTxnData, description: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Date</label>
              <input required type="datetime-local" className="glass-input" value={editTxnData.date ? editTxnData.date.substring(0, 16) : ''} onChange={e => setEditTxnData({ ...editTxnData, date: e.target.value })} />
            </div>
            <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Admin Password to Save</label>
              <input required type="password" className="glass-input" value={editTxnPassword} onChange={e => setEditTxnPassword(e.target.value)} placeholder="Enter admin password" />
              {editTxnError && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>{editTxnError}</p>}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="button" className="btn-secondary" onClick={() => setIsEditTxnModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ background: '#d97706' }}>Save Changes</button>
            </div>
          </form>
        )}
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
                <button className="btn-secondary" style={{ padding: '4px 12px', background: aspect === 3 / 4 ? 'var(--primary)' : '', color: aspect === 3 / 4 ? 'white' : '' }} onClick={() => setAspect(3 / 4)}>3:4</button>
                <button className="btn-secondary" style={{ padding: '4px 12px', background: aspect === 4 / 3 ? 'var(--primary)' : '', color: aspect === 4 / 3 ? 'white' : '' }} onClick={() => setAspect(4 / 3)}>4:3</button>
                <button className="btn-secondary" style={{ padding: '4px 12px', background: aspect === 4 / 5 ? 'var(--primary)' : '', color: aspect === 4 / 5 ? 'white' : '' }} onClick={() => setAspect(4 / 5)}>4:5</button>
                <button className="btn-secondary" style={{ padding: '4px 12px', background: aspect === 16 / 9 ? 'var(--primary)' : '', color: aspect === 16 / 9 ? 'white' : '' }} onClick={() => setAspect(16 / 9)}>16:9</button>
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


      {pdfPreviewUrl && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#e5e7eb', zIndex: 99999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 24px', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 10 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e3a8a' }}>
              <FileText size={24} color="#1e3a8a" /> Receipt Preview
            </h2>
            <button onClick={() => { URL.revokeObjectURL(pdfPreviewUrl); setPdfPreviewUrl(null); }} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
              <ArrowLeft size={18} /> Back
            </button>
          </div>
          <iframe src={pdfPreviewUrl} style={{ width: '100%', flex: 1, border: 'none' }} title="Receipt Preview" />
        </div>
      )}

    </motion.div>
  );
};

export default StudentProfile;
