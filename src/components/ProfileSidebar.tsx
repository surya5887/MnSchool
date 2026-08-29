import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Phone, Camera } from 'lucide-react';
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
    if (['Principal', 'Manager', 'Super Admin'].includes(role)) return 'admins';
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
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(8px)',
              zIndex: 99998
            }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 250 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '420px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '-10px 0 40px rgba(0,0,0,0.2)',
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid rgba(255,255,255,0.5)'
            }}
          >
            {/* Header */}
            <div style={{ 
              padding: '24px', 
              background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)',
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontWeight: 600 }}>
                <User size={22} color="white" /> My Profile
              </h2>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}>
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Avatar Section */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div 
                  style={{ position: 'relative', cursor: 'pointer' }}
                  onClick={() => fileInputRef.current?.click()}
                  className="profile-avatar-container"
                >
                  <img 
                    src={profileData.photoUrl || `https://ui-avatars.com/api/?name=${profileData.name || 'U'}&background=6366f1&color=fff&size=150`}
                    alt="Profile" 
                    style={{ 
                      width: '120px', 
                      height: '120px', 
                      borderRadius: '50%', 
                      objectFit: 'cover', 
                      border: '4px solid white', 
                      boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                  <div style={{ 
                    position: 'absolute', bottom: '4px', right: '4px', 
                    background: 'linear-gradient(135deg, var(--primary), #a855f7)', 
                    color: 'white', padding: '10px', borderRadius: '50%', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid white'
                  }}>
                    <Camera size={16} />
                  </div>
                </div>
                <h3 style={{ margin: '20px 0 6px 0', fontSize: '1.4rem', color: '#1e293b', fontWeight: 700 }}>{profileData.name || authUser.name}</h3>
                <span style={{ 
                  background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', 
                  padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
                  border: '1px solid rgba(99, 102, 241, 0.2)'
                }}>
                  {authUser.role}
                </span>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/jpeg, image/png, image/webp" 
                  onChange={handleImageUpload}
                />
              </div>

              {/* Form Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={16} color="var(--primary)" /> Full Name
                  </label>
                  <input 
                    type="text" 
                    style={{ 
                      width: '100%', padding: '12px 16px', borderRadius: '12px', 
                      border: '1px solid #cbd5e1', background: 'white', fontSize: '1rem',
                      color: '#334155', transition: 'border-color 0.2s', outline: 'none'
                    }}
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                  />
                </div>
                
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={16} color="var(--primary)" /> Phone Number
                  </label>
                  <input 
                    type="text" 
                    style={{ 
                      width: '100%', padding: '12px 16px', borderRadius: '12px', 
                      border: '1px solid #cbd5e1', background: 'white', fontSize: '1rem',
                      color: '#334155', transition: 'border-color 0.2s', outline: 'none'
                    }}
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="e.g. +91 9876543210"
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.8)' }}>
              <button 
                style={{ 
                  width: '100%', padding: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', 
                  fontSize: '1.05rem', fontWeight: 600, color: 'white', border: 'none', borderRadius: '14px',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)',
                  boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1, transition: 'transform 0.1s, box-shadow 0.1s'
                }}
                onMouseOver={e => { if(!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(99, 102, 241, 0.4)'; } }}
                onMouseOut={e => { if(!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.3)'; } }}
                onClick={handleSave}
                disabled={loading}
              >
                <Save size={20} /> {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileSidebar;
