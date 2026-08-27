import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Ensure we prompt every time for PWA installation (if not installed yet)
      const lastDismissed = localStorage.getItem('pwa_prompt_dismissed_date');
      const today = new Date().toDateString();
      if (lastDismissed !== today) {
        setShowPrompt(true);
      }
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed_date', new Date().toDateString());
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            right: '24px',
            margin: '0 auto',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--glass-border)',
            padding: '16px 20px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            zIndex: 9999,
            maxWidth: '400px'
          }}
        >
          <img src="/images/logo_circular.png" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 600 }}>Install App</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Get the app for a faster experience.</p>
          </div>
          <button onClick={handleInstall} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
            <Download size={14} /> Install
          </button>
          <button onClick={handleDismiss} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default InstallPrompt;
