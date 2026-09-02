import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Phone, Camera, Edit3 } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  authUser: any;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ isOpen, onClose, authUser }) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    photoUrl: ''
  });

  const getCollectionName = (role: string) => {
    if (['Admin', 'Principal', 'Manager', 'Super Admin'].includes(role)) return 'admins';
    if (role === 'Teacher') return 'staff';
    if (role === 'Student') return 'students';
    return 'admins';
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isOpen || !authUser?.id) return;
      try {
        const collectionName = getCollectionName(authUser.role);
        const docRef = doc(db, collectionName, authUser.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            name: data.name || (data.firstName ? `${data.firstName} ${data.lastName}` : ''),
            phone: data.phone || data.mobile || '',
            photoUrl: data.photoUrl || data.photo || ''
          });
        }
      } catch (error) {
        console.error("Error fetching profile", error);
      }
    };
    fetchProfile();
  }, [isOpen, authUser]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          setProfileData({ ...profileData, photoUrl: base64 });
        }
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const collectionName = getCollectionName(authUser.role);
      const docRef = doc(db, collectionName, authUser.id);
      
      const updatePayload: any = {
        phone: profileData.phone,
      };

      if (profileData.photoUrl) {
         updatePayload.photoUrl = profileData.photoUrl;
      }

      if (collectionName === 'students') {
        const parts = profileData.name.split(' ');
        updatePayload.firstName = parts[0] || '';
        updatePayload.lastName = parts.slice(1).join(' ') || '';
      } else {
        updatePayload.name = profileData.name;
      }

      await updateDoc(docRef, updatePayload);

      const updatedUser = { ...authUser, name: profileData.name };
      if (profileData.photoUrl) updatedUser.photoUrl = profileData.photoUrl;
      
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
      sessionStorage.setItem('authUser', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('storage'));

      onClose();
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 99998
            }}
          />
          <motion.div
            initial={{ x: '100%', opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0, right: 0, bottom: 0,
              width: '100%', maxWidth: '400px',
              background: '#ffffff',
              boxShadow: '-10px 0 40px rgba(0,0,0,0.2)',
              zIndex: 99999,
              display: 'flex', flexDirection: 'column'
            }}
          >
            {/* Simple Clean Header */}
            <div style={{ 
              padding: '24px', 
              borderBottom: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontWeight: 600 }}>
                <User size={22} color="var(--primary-color)" /> My Profile
              </h2>
              <button 
                onClick={onClose} 
                style={{ 
                  background: 'var(--glass-bg)', border: 'none', 
                  cursor: 'pointer', color: 'var(--text-muted)', borderRadius: '50%', width: '32px', height: '32px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' 
                }} 
                onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'} 
                onMouseOut={e => e.currentTarget.style.background = 'var(--glass-bg)'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px', display: 'flex', flexDirection: 'column' }} className="hide-scrollbar">
              
              {/* Avatar Section */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                <div 
                  style={{ position: 'relative', cursor: 'pointer', borderRadius: '50%', padding: '4px', background: 'var(--primary-gradient)', transition: 'transform 0.2s' }}
                  onClick={() => fileInputRef.current?.click()}
                  onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <img 
                    src={profileData.photoUrl || `https://ui-avatars.com/api/?name=${profileData.name || 'U'}&background=ffffff&color=6366f1&size=150`}
                    alt="Profile" 
                    style={{ 
                      width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '4px solid white'
                    }}
                  />
                  <div style={{ 
                    position: 'absolute', bottom: '0px', right: '0px', 
                    background: 'var(--primary-color)', color: 'white', 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <Camera size={14} />
                  </div>
                </div>
                <h3 style={{ margin: '16px 0 4px 0', fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: 700 }}>
                  {profileData.name || authUser.name}
                </h3>
                <span style={{ 
                  color: 'var(--primary-color)', 
                  background: 'rgba(99, 102, 241, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '0.85rem', fontWeight: 600
                }}>
                  {authUser.role}
                </span>
                
                <input 
                  type="file" ref={fileInputRef} style={{ display: 'none' }} 
                  accept="image/jpeg, image/png, image/webp" onChange={handleImageUpload}
                />
              </div>

              {/* Form Fields container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Edit3 size={16} color="var(--primary-color)" /> Full Name
                  </label>
                  <input 
                    type="text" 
                    style={{ 
                      width: '100%', padding: '14px 16px', borderRadius: '12px', 
                      border: '1px solid #cbd5e1', background: 'white', fontSize: '1rem',
                      color: 'var(--text-main)', transition: 'all 0.2s', outline: 'none'
                    }}
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    onFocus={e => { e.target.style.borderColor = 'var(--primary-color)'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                
                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={16} color="var(--primary-color)" /> Phone Number
                  </label>
                  <input 
                    type="text" 
                    style={{ 
                      width: '100%', padding: '14px 16px', borderRadius: '12px', 
                      border: '1px solid #cbd5e1', background: 'white', fontSize: '1rem',
                      color: 'var(--text-main)', transition: 'all 0.2s', outline: 'none'
                    }}
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="e.g. +91 9876543210"
                    onFocus={e => { e.target.style.borderColor = 'var(--primary-color)'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <button 
                style={{ 
                  width: '100%', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', 
                  fontSize: '1.05rem', fontWeight: 600, color: 'white', border: 'none', borderRadius: '14px',
                  background: 'var(--primary-gradient)', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.8 : 1, transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                }}
                onMouseOver={e => { if(!loading) e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)'; }}
                onMouseOut={e => { if(!loading) e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)'; }}
                onClick={handleSave}
                disabled={loading}
              >
                <Save size={20} /> {loading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileSidebar;
