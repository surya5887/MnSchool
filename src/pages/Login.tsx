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
    <>
      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 20px;
          background: #0f172a;
        }
        .bg-image {
          position: absolute;
          inset: -20px; /* Slight bleed for zoom */
          background: url('/images/front_view.png') center/cover no-repeat;
          animation: slowPan 30s infinite alternate ease-in-out;
          z-index: 0;
        }
        .bg-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.85) 100%);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 1;
        }
        .glass-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 440px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 28px;
          padding: 48px 40px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255,255,255,0.05);
          color: white;
          overflow: hidden;
        }
        .glass-card::before {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: skewX(-20deg);
          animation: shine 8s infinite;
        }
        .school-logo-container {
          position: relative;
          width: 100px;
          height: 100px;
          margin: 0 auto 24px auto;
        }
        .floating-logo {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid rgba(255, 255, 255, 0.4);
          padding: 4px;
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.2);
          animation: float 6s ease-in-out infinite;
        }
        .input-group {
          margin-bottom: 24px;
          position: relative;
        }
        .input-label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          color: rgba(255,255,255,0.9);
          letter-spacing: 0.5px;
        }
        .premium-input {
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 16px 20px;
          border-radius: 16px;
          color: white;
          font-size: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }
        .premium-input::placeholder {
          color: rgba(255,255,255,0.4);
        }
        .premium-input:focus {
          background: rgba(0, 0, 0, 0.4);
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 0 20px rgba(255,255,255,0.1);
          transform: translateY(-2px);
        }
        .premium-btn {
          width: 100%;
          padding: 16px;
          border-radius: 16px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          font-weight: 600;
          font-size: 1.05rem;
          border: none;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(37, 99, 235, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
        }
        .premium-btn:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 15px 30px rgba(37, 99, 235, 0.6);
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
        }
        .premium-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .forgot-link {
          color: #93c5fd;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
        }
        .forgot-link:hover {
          color: #ffffff;
          text-decoration: underline;
        }
        
        @keyframes slowPan {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.08) translate(-1%, 2%); }
          100% { transform: scale(1) translate(1%, -1%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shine {
          0% { left: -100%; }
          20% { left: 200%; }
          100% { left: 200%; }
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>

      <div className="login-container">
        {/* Animated Background */}
        <div className="bg-image"></div>
        <div className="bg-overlay"></div>

        {/* Floating Glass Card */}
        <motion.div 
          className="glass-card"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <motion.div 
              className="school-logo-container"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
            >
              <img src="/images/logo.jpeg" alt="School Logo" className="floating-logo" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.5px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
            >
              MN Public School
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}
            >
              Secure ERP Access Portal
            </motion.p>
          </div>

          <form onSubmit={handleLogin}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                style={{ padding: '14px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', borderRadius: '12px', fontSize: '0.9rem', textAlign: 'center', marginBottom: '24px' }}
              >
                {error}
              </motion.div>
            )}
            
            <motion.div 
              className="input-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="input-label">Username / ID</label>
              <input 
                type="text" 
                className="premium-input"
                placeholder="Admin, Custom ID, or SR No" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </motion.div>
            
            <motion.div 
              className="input-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="input-label">Password</label>
              <input 
                type="password" 
                className="premium-input"
                placeholder="Enter your password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </motion.div>
            
            <motion.div 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', marginBottom: '16px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}>
                <input type="checkbox" style={{ accentColor: '#3b82f6', width: '16px', height: '16px', cursor: 'pointer' }} /> 
                Remember session
              </label>
              <span className="forgot-link">Forgot Password?</span>
            </motion.div>

            <motion.button 
              type="submit" 
              className="premium-btn"
              disabled={isLoading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, type: "spring" }}
            >
              {isLoading ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In 
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
