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
            grid-template-columns: 1fr 1fr;
            min-height: 100vh;
            background: var(--background);
          }
          .login-left {
            position: relative;
            overflow: hidden;
            background: url('/images/front_view.png') center/cover no-repeat;
          }
          .login-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            padding: 40px;
            text-align: center;
          }
          .login-right {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: #f8fafc;
          }
          .login-card {
            width: 100%;
            max-width: 440px;
            padding: 48px 40px;
            background: white;
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
          }
          @media (max-width: 900px) {
            .login-wrapper {
              grid-template-columns: 1fr;
            }
            .login-left {
              display: none; /* Hide image section on small screens to save space */
            }
            .login-right {
              padding: 16px;
              background: url('/images/front_view.png') center/cover no-repeat;
              position: relative;
            }
            .login-right::before {
              content: '';
              position: absolute;
              inset: 0;
              background: rgba(15, 23, 42, 0.75);
              backdrop-filter: blur(8px);
            }
            .login-card {
              position: relative;
              z-index: 10;
              padding: 32px 24px;
            }
          }
        `}
      </style>

      <div className="login-wrapper">
        {/* Left Side - Showcasing the School (Hidden on Mobile) */}
        <div className="login-left">
          <div className="login-overlay">
            <motion.div 
              initial={{ y: 30, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            >
              <img src="/images/logo.jpeg" alt="Logo" style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', border: '4px solid rgba(255,255,255,0.2)' }} />
              <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-1px', textShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                M.N. Public School
              </h1>
              <p style={{ fontSize: '1.15rem', maxWidth: '420px', margin: '0 auto', opacity: 0.9, lineHeight: 1.6, textShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                Empowering students to achieve excellence. Welcome to the official ERP portal.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-right">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="login-card"
          >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'inline-block', padding: '12px', background: 'var(--primary-color)', borderRadius: '20px', marginBottom: '20px', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>Welcome Back</h1>
              <p style={{ color: '#64748b', fontSize: '15px' }}>Sign in to continue to your dashboard</p>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '14px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '12px', fontSize: '0.9rem', textAlign: 'center', fontWeight: 500 }}>
                  {error}
                </motion.div>
              )}
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Username / ID</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="admin, Custom ID, or SR No" 
                  required 
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px 16px', borderRadius: '12px', width: '100%', fontSize: '15px', color: '#0f172a', transition: 'all 0.2s' }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={(e) => e.target.style.border = '1px solid var(--primary-color)'}
                  onBlur={(e) => e.target.style.border = '1px solid #e2e8f0'}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Password</label>
                <input 
                  type="password" 
                  className="glass-input" 
                  placeholder="Enter your password" 
                  required 
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px 16px', borderRadius: '12px', width: '100%', fontSize: '15px', color: '#0f172a', transition: 'all 0.2s' }} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={(e) => e.target.style.border = '1px solid var(--primary-color)'}
                  onBlur={(e) => e.target.style.border = '1px solid #e2e8f0'}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '4px', marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#64748b', fontWeight: 500 }}>
                  <input type="checkbox" style={{ accentColor: 'var(--primary-color)', width: '16px', height: '16px' }} /> Remember me
                </label>
                <span style={{ color: 'var(--primary-color)', fontWeight: 600, cursor: 'pointer' }}>Forgot Password?</span>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1.05rem', fontWeight: 600, borderRadius: '12px', boxShadow: '0 8px 20px rgba(99, 102, 241, 0.25)' }} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In to ERP'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Login;
