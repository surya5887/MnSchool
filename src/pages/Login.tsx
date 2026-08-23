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
      <style>
        {`
          .login-wrapper {
            display: grid;
            grid-template-columns: 1fr 1.2fr;
            min-height: 100vh;
            background: #f8fafc;
          }
          .login-left {
            position: relative;
            background: url('/images/front_view.png') center/cover no-repeat;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: center;
          }
          .login-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.4) 50%, rgba(15, 23, 42, 0.2) 100%);
          }
          .login-left-content {
            position: relative;
            z-index: 10;
            padding: 60px 40px;
            color: #ffffff;
            text-align: center;
            width: 100%;
          }
          .login-right {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
            background: #ffffff;
          }
          .login-card {
            width: 100%;
            max-width: 420px;
          }
          .login-input {
            width: 100%;
            padding: 14px 16px;
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            font-size: 15px;
            color: #0f172a;
            transition: all 0.2s;
            margin-top: 8px;
            outline: none;
          }
          .login-input:focus {
            background: #ffffff;
            border-color: #3b82f6;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          }
          .login-btn {
            width: 100%;
            padding: 14px;
            background: #2563eb; /* Professional solid blue */
            color: white;
            font-weight: 600;
            font-size: 1.05rem;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
          }
          .login-btn:hover:not(:disabled) {
            background: #1d4ed8;
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
          }
          .login-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          
          @media (max-width: 900px) {
            .login-wrapper {
              grid-template-columns: 1fr;
            }
            .login-left {
              display: none;
            }
            .login-right {
              padding: 24px;
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            }
            .login-card {
              background: #ffffff;
              padding: 40px 32px;
              border-radius: 24px;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
            }
          }
        `}
      </style>

      <div className="login-wrapper">
        {/* Left Side - School Image (Hidden on Mobile) */}
        <div className="login-left">
          <div className="login-overlay"></div>
          <div className="login-left-content">
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            >
              <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '12px', letterSpacing: '-0.5px' }}>
                Welcome to MN Public School
              </h2>
              <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6, maxWidth: '400px', margin: '0 auto' }}>
                Official ERP portal for students, staff, and administration.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Clean Login Form */}
        <div className="login-right">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="login-card"
          >
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <img 
                src="/images/logo.jpeg" 
                alt="School Logo" 
                style={{ 
                  width: '90px', 
                  height: '90px', 
                  borderRadius: '50%', 
                  marginBottom: '24px', 
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  border: '4px solid #ffffff'
                }} 
              />
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Account Login
              </h1>
              <p style={{ color: '#64748b', fontSize: '15px' }}>
                Sign in to access your dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {error && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '14px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '12px', fontSize: '0.9rem', textAlign: 'center', fontWeight: 500 }}>
                  {error}
                </motion.div>
              )}
              
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
                  Username / ID
                </label>
                <input 
                  type="text" 
                  className="login-input"
                  placeholder="e.g. admin, Custom ID, or SR No" 
                  required 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
                  Password
                </label>
                <input 
                  type="password" 
                  className="login-input"
                  placeholder="Enter your password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginTop: '-4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#64748b', fontWeight: 500 }}>
                  <input type="checkbox" style={{ accentColor: '#2563eb', width: '16px', height: '16px' }} /> Remember me
                </label>
                <span style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}>Forgot Password?</span>
              </div>

              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="login-btn"
                disabled={isLoading}
                style={{ marginTop: '8px' }}
              >
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                    </svg>
                    Signing in...
                    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                  </span>
                ) : 'Secure Login'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Login;
