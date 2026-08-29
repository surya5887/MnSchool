import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Mail, Phone, Lock, Camera } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import bcrypt from 'bcryptjs';

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  authUser: any;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ isOpen, onClose, authUser }) => {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    photoUrl: '',
    password: ''
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
            email: data.email || '',
            phone: data.phone || data.mobile || '',
            photoUrl: data.photoUrl || data.photo || '',
            password: ''
          });
        }
      } catch (error) {
        console.error("Error fetching profile", error);
      }
    };
    fetchProfile();
  }, [isOpen, authUser]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const collectionName = getCollectionName(authUser.role);
      const docRef = doc(db, collectionName, authUser.id);
      
      const updatePayload: any = {
        email: profileData.email,
        phone: profileData.phone,
      };

      if (profileData.photoUrl) {
         updatePayload.photoUrl = profileData.photoUrl;
      }

      // Handle name splitting for students if needed, but for admins/staff it's just 'name'
      if (collectionName === 'students') {
        const parts = profileData.name.split(' ');
        updatePayload.firstName = parts[0] || '';
        updatePayload.lastName = parts.slice(1).join(' ') || '';
      } else {
        updatePayload.name = profileData.name;
      }

      if (profileData.password) {
        updatePayload.password = bcrypt.hashSync(profileData.password, 10);
      }

      await updateDoc(docRef, updatePayload);

      // Update local storage
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
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 99998
            }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '400px',
              background: 'var(--bg-main)',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass-bg)' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="var(--primary)" /> My Profile
              </h2>
              <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ position: 'relative' }}>
                  <img 
                    src={profileData.photoUrl || `https://ui-avatars.com/api/?name=${profileData.name || 'U'}&background=6366f1&color=fff&size=120`}
                    alt="Profile" 
                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', color: 'white', padding: '6px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                    <Camera size={16} />
                  </div>
                </div>
                <h3 style={{ margin: '16px 0 4px 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>{profileData.name || authUser.name}</h3>
                <span className="badge primary" style={{ fontSize: '0.75rem' }}>{authUser.role}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} /> Full Name
                  </label>
                  <input 
                    type="text" 
                    className="glass-input" 
                    style={{ width: '100%', padding: '10px 16px' }}
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} /> Email Address
                  </label>
                  <input 
                    type="email" 
                    className="glass-input" 
                    style={{ width: '100%', padding: '10px 16px' }}
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} /> Phone Number
                  </label>
                  <input 
                    type="text" 
                    className="glass-input" 
                    style={{ width: '100%', padding: '10px 16px' }}
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="e.g. +91 9876543210"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Camera size={14} /> Photo URL (Optional)
                  </label>
                  <input 
                    type="text" 
                    className="glass-input" 
                    style={{ width: '100%', padding: '10px 16px' }}
                    value={profileData.photoUrl}
                    onChange={(e) => setProfileData({...profileData, photoUrl: e.target.value})}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={14} /> New Password
                  </label>
                  <input 
                    type="text" 
                    className="glass-input" 
                    style={{ width: '100%', padding: '10px 16px' }}
                    value={profileData.password}
                    onChange={(e) => setProfileData({...profileData, password: e.target.value})}
                    placeholder="Leave blank to keep current"
                  />
                </div>
              </div>
            </div>

            <div style={{ padding: '20px 24px', borderTop: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '1rem' }}
                onClick={handleSave}
                disabled={loading}
              >
                <Save size={18} /> {loading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileSidebar;
