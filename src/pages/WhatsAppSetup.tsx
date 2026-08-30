import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Lock, CheckCircle2, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const WhatsAppIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const WhatsAppSetup: React.FC = () => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const initiateConnection = async () => {
    if (passwordInput !== '790077Aa@') {
      setPasswordError('Incorrect security password.');
      return;
    }

    setShowPasswordModal(false);
    setPasswordInput('');
    setPasswordError('');
    setLoading(true);
    setError('');
    setQrCode(null);
    setConnected(false);
    setStatusMsg('Preparing secure connection...');

    try {
      const source = new EventSource('/api/whatsapp-link');
      
      source.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.status === 'info') {
          setStatusMsg(data.message);
        } else if (data.status === 'qr') {
          setQrCode(data.qr);
          setLoading(false);
        } else if (data.status === 'success') {
          setConnected(true);
          setLoading(false);
          setQrCode(null);
          source.close();
        } else if (data.status === 'timeout' || data.status === 'error') {
          setError(data.message);
          setLoading(false);
          source.close();
        }
      };

      source.onerror = () => {
        setError('Connection to server interrupted. Please try again.');
        setLoading(false);
        source.close();
      };
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '30px' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '24px' }}>
          <div style={{ background: '#25D366', padding: '14px', borderRadius: '16px', color: 'white', boxShadow: '0 8px 20px rgba(37, 211, 102, 0.3)' }}>
            <WhatsAppIcon size={28} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              WhatsApp Integration
              <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '100px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Active Module</span>
            </h2>
            <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Automatically send fee reminders, receipts, and school updates to parents.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px' }}>
          
          {/* Instructions Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} color="#25D366" /> How to link your account
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>1</div>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: 1.5 }}>Click the <strong>Generate QR Code</strong> button on the right to start a secure session.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>2</div>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: 1.5 }}>Open WhatsApp on your school's official mobile phone.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>3</div>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: 1.5 }}>Tap <strong>Menu</strong> (Android) or <strong>Settings</strong> (iPhone) and select <strong>Linked Devices</strong>.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>4</div>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: 1.5 }}>Tap <strong>Link a Device</strong> and point your camera at the QR code.</p>
                </div>
              </div>
            </div>

            <div style={{ background: '#fffbeb', padding: '16px 20px', borderRadius: '16px', border: '1px solid #fde68a', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <AlertCircle size={20} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#92400e', display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Important Security Note</strong>
                <span style={{ color: '#b45309', fontSize: '0.85rem', lineHeight: 1.5 }}>Linking a new WhatsApp account will automatically disconnect any previously linked numbers. Keep your phone connected to the internet.</span>
              </div>
            </div>
          </div>

          {/* Action Column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'white', padding: '48px 32px', borderRadius: '24px', minHeight: '400px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
            
            {/* Background Decoration */}
            <div style={{ position: 'absolute', top: -50, right: -50, opacity: 0.03, pointerEvents: 'none' }}>
              <WhatsAppIcon size={200} />
            </div>

            {connected ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', zIndex: 1 }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
                  <div style={{ position: 'absolute', inset: -10, background: '#25D366', opacity: 0.2, borderRadius: '50%', filter: 'blur(10px)', animation: 'pulse 2s infinite' }} />
                  <div style={{ background: '#25D366', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <CheckCircle2 size={40} color="white" />
                  </div>
                </div>
                <h3 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '1.4rem' }}>Successfully Linked</h3>
                <p style={{ color: '#64748b', margin: '0 0 24px 0', fontSize: '0.95rem' }}>Your WhatsApp account is active and ready to automate notifications.</p>
                <button className="btn-secondary" onClick={() => setShowPasswordModal(true)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}>
                  Link a Different Number
                </button>
              </motion.div>
            ) : qrCode ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', zIndex: 1, width: '100%' }}>
                <div style={{ display: 'inline-block', padding: '16px', background: 'white', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', marginBottom: '24px' }}>
                   <QRCodeSVG value={qrCode} size={260} level="H" />
                </div>
                <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '1.1rem' }}>Scan Code</h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Open WhatsApp on your phone to link.</p>
              </motion.div>
            ) : loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', zIndex: 1 }}>
                <Loader2 size={48} color="#25D366" style={{ margin: '0 auto 24px', animation: 'spin 1.5s linear infinite' }} />
                <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '1.1rem' }}>Generating Secure QR</h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{statusMsg || 'Please wait...'}</p>
              </motion.div>
            ) : (
              <div style={{ textAlign: 'center', zIndex: 1, width: '100%' }}>
                <div style={{ background: '#f1f5f9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <QrCode size={36} color="#94a3b8" />
                </div>
                <h3 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '1.2rem' }}>Not Connected</h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 32px 0', padding: '0 20px' }}>
                  Generate a QR code to link your school's WhatsApp account to the ERP.
                </p>
                <button 
                  onClick={() => setShowPasswordModal(true)} 
                  style={{ 
                    background: '#25D366', color: 'white', border: 'none', padding: '14px 28px', 
                    borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto',
                    boxShadow: '0 8px 20px rgba(37, 211, 102, 0.3)', transition: 'transform 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <WhatsAppIcon size={20} color="white" />
                  Generate QR Code
                </button>
              </div>
            )}

            {error && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '12px', marginTop: '24px', display: 'flex', alignItems: 'flex-start', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
                <AlertCircle size={18} color="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                <p style={{ margin: 0, color: '#b91c1c', fontSize: '0.85rem', lineHeight: 1.5 }}>{error}</p>
              </motion.div>
            )}

          </div>
        </div>
      </motion.div>

      {/* Password Modal Overlay */}
      <AnimatePresence>
        {showPasswordModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }} onClick={() => setShowPasswordModal(false)} />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px', zIndex: 1, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '12px', color: '#334155' }}>
                  <Lock size={24} />
                </div>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.3rem' }}>Security Verification</h3>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px', marginTop: '8px' }}>Please enter your security password to authorize a new WhatsApp connection.</p>
              
              <div style={{ marginBottom: '24px' }}>
                <input 
                  type="password" 
                  placeholder="Enter Password" 
                  value={passwordInput} 
                  onChange={e => setPasswordInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && initiateConnection()}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: `1px solid ${passwordError ? '#ef4444' : '#cbd5e1'}`, fontSize: '1rem', boxSizing: 'border-box', outline: 'none', transition: 'border 0.2s', background: '#f8fafc' }}
                  autoFocus
                />
                {passwordError && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '8px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12}/> {passwordError}</p>}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowPasswordModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={initiateConnection} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#25D366', border: 'none', color: 'white', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.2)' }}>
                  Verify & Proceed
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default WhatsAppSetup;
