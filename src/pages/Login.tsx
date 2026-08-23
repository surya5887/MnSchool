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
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const saveSession = (data: any) => {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('authUser', JSON.stringify(data));
    };

    try {
      // 1. Check if Admin
      if (username === 'admin' && password === 'admin123') {
        saveSession({ role: 'Principal', id: 'admin', name: 'Principal / Admin' });
        navigate('/dashboard');
        return;
      }

      // 2. Check Staff (Teacher)
      const staffRef = collection(db, 'staff');
      const staffQ = query(staffRef, where('customId', '==', username), where('password', '==', password));
      const staffSnap = await getDocs(staffQ);
      
      if (!staffSnap.empty) {
        const docData = staffSnap.docs[0].data();
        saveSession({ 
          role: 'Teacher', 
          id: staffSnap.docs[0].id, 
          name: docData.name,
          assignedClass: docData.assignedClass || '' 
        });
        navigate('/dashboard');
        return;
      }

      // 3. Check Student
      const studentRef = collection(db, 'students');
      const studentQ = query(studentRef, where('admissionNo', '==', username), where('password', '==', password));
      const studentSnap = await getDocs(studentQ);
      
      if (!studentSnap.empty) {
        const docData = studentSnap.docs[0].data();
        saveSession({ 
          role: 'Student', 
          id: studentSnap.docs[0].id, 
          name: `${docData.firstName} ${docData.lastName}`
        });
        navigate(`/student/${studentSnap.docs[0].id}`);
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
          inset: -20px; 
          background: url('/images/front_view_compressed.webp') center/cover no-repeat;
          animation: slowPan 30s infinite alternate ease-in-out;
          z-index: 0;
        }
        .bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.45) 0%, rgba(168, 85, 247, 0.45) 50%, rgba(236, 72, 153, 0.45) 100%);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 1;
        }
        .glass-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 440px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 28px;
          padding: 48px 40px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255,255,255,0.1);
          color: white;
          overflow: hidden;
        }
        .glass-card::before {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: skewX(-20deg);
          animation: shine 8s infinite;
        }
        .school-logo-container {
          position: relative;
          width: 110px;
          height: 110px;
          margin: 0 auto 24px auto;
        }
        .floating-logo {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid rgba(255, 255, 255, 0.8);
          padding: 4px;
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 40px rgba(255, 255, 255, 0.3);
          animation: float 5s ease-in-out infinite;
        }
        .input-group {
          margin-bottom: 24px;
          position: relative;
        }
        .input-label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: 0.5px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        .premium-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid transparent;
          padding: 16px 20px;
          border-radius: 16px;
          color: #0f172a;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .premium-input::placeholder {
          color: #94a3b8;
        }
        .premium-input:focus {
          background: #ffffff;
          border-color: #6366f1;
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
          transform: translateY(-2px);
        }
        .premium-btn {
          width: 100%;
          padding: 16px;
          border-radius: 16px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
          border: none;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-top: 15px;
        }
        .premium-btn:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 15px 30px rgba(16, 185, 129, 0.6);
          background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
        }
        .premium-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        @keyframes slowPan {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.08) translate(-1%, 2%); }
          100% { transform: scale(1) translate(1%, -1%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
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
              style={{ fontSize: '30px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px', textShadow: '0 2px 15px rgba(0,0,0,0.4)' }}
            >
              MN Public School
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ color: '#ffffff', fontSize: '16px', fontWeight: 500, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
            >
              Secure ERP Access Portal
            </motion.p>
          </div>

          <form onSubmit={handleLogin}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                style={{ padding: '14px', background: 'rgba(254, 226, 226, 0.9)', border: '1px solid #f87171', color: '#b91c1c', borderRadius: '12px', fontSize: '0.95rem', textAlign: 'center', marginBottom: '24px', fontWeight: 600 }}
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
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.95rem', marginBottom: '20px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#ffffff', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#10b981', width: '18px', height: '18px', cursor: 'pointer' }} 
                /> 
                Keep me logged in
              </label>
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
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In 
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
