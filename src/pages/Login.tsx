import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Check if Admin
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('authUser', JSON.stringify({ role: 'Principal', id: 'admin', name: 'Principal / Admin' }));
        navigate('/dashboard');
        return;
      }

      // 2. Check Staff (Teacher)
      const staffRef = collection(db, 'staff');
      const staffQ = query(staffRef, where('customId', '==', username), where('password', '==', password));
      const staffSnap = await getDocs(staffQ);
      
      if (!staffSnap.empty) {
        const docData = staffSnap.docs[0].data();
        localStorage.setItem('authUser', JSON.stringify({ 
          role: 'Teacher', 
          id: staffSnap.docs[0].id, 
          name: docData.name,
          assignedClass: docData.assignedClass || '' 
        }));
        navigate('/dashboard'); // Will be redirected/handled by Layout or Dashboard
        return;
      }

      // 3. Check Student
      const studentRef = collection(db, 'students');
      const studentQ = query(studentRef, where('admissionNo', '==', username), where('password', '==', password));
      const studentSnap = await getDocs(studentQ);
      
      if (!studentSnap.empty) {
        const docData = studentSnap.docs[0].data();
        localStorage.setItem('authUser', JSON.stringify({ 
          role: 'Student', 
          id: studentSnap.docs[0].id, 
          name: `${docData.firstName} ${docData.lastName}`
        }));
        navigate(`/student/${studentSnap.docs[0].id}`); // direct to their profile
        return;
      }

      // Not found
      setError('Invalid username or password.');
    } catch (err) {
      console.error("Login error", err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: 'var(--background)'
    }}>
      {/* Left Side - Showcasing the School */}
      <div style={{ 
        position: 'relative', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <img src="/images/front_view.png" alt="MN Public School Front" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8))' }}></div>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <img src="/images/side_view.png" alt="MN Public School Campus" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(99, 102, 241, 0.4), rgba(0,0,0,0.6))' }}></div>
        </div>
        
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', padding: '40px', textAlign: 'center' }}>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, textShadow: '0 4px 10px rgba(0,0,0,0.5)', marginBottom: '16px', letterSpacing: '-1px' }}>MN Public School</h1>
            <p style={{ fontSize: '1.2rem', maxWidth: '400px', margin: '0 auto', opacity: 0.9, lineHeight: 1.6, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              Empowering students to achieve excellence. Welcome to the official ERP portal.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-panel"
          style={{ width: '100%', maxWidth: '420px', padding: '48px', border: 'none', background: 'rgba(255,255,255,0.7)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <img src="/images/logo.jpeg" alt="School Logo" style={{ width: '80px', height: '80px', borderRadius: '20px', objectFit: 'cover', margin: '0 auto 24px auto', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }} />
            <h1 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--text-main)' }}>Welcome Back</h1>
            <p style={{ color: 'var(--text-muted)' }}>Sign in to MN Public School ERP</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
              <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center' }}>
                {error}
              </div>
            )}
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>Username / ID</label>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="'admin', Custom ID, or SR No" 
                required 
                style={{ background: 'white' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>Password</label>
              <input 
                type="password" 
                className="glass-input" 
                placeholder="Enter password" 
                required 
                style={{ background: 'white' }} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-main)' }}>
                <input type="checkbox" /> Remember me
              </label>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px', padding: '14px', fontSize: '1rem', fontWeight: 600 }} disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
