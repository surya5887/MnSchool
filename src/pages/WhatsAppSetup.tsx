import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, QrCode, Zap, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const WhatsAppSetup: React.FC = () => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');

  const generateQR = async () => {
    const pwd = prompt("Enter security password to generate QR:");
    if (pwd !== '790077Aa@') {
      if (pwd !== null) alert("Incorrect password.");
      return;
    }

    setLoading(true);
    setError('');
    setQrCode(null);
    setConnected(false);

    try {
      const source = new EventSource('/api/whatsapp-link');
      
      source.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.status === 'qr') {
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
        setError('Connection interrupted.');
        setLoading(false);
        source.close();
      };
      
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: '#25D366', padding: '12px', borderRadius: '12px', color: 'white' }}>
          <Smartphone size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b' }}>WhatsApp Connectivity (Beta)</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Serverless "Jugaad" Architecture (Baileys + Firestore)</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={18} color="#f59e0b"/> How this works</h3>
          <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
            This system uses a highly advanced 10-second Serverless execution to connect to WhatsApp.
            Instead of saving your authentication to a server's hard drive, it encrypts and saves your keys directly into <strong>Firebase Firestore</strong>.
          </p>
          <ul style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, paddingLeft: '20px' }}>
            <li>Click Generate QR.</li>
            <li>Scan it from your School's WhatsApp.</li>
            <li>The system will save the encrypted keys.</li>
            <li>Whenever a fee is paid, Vercel will wake up, fetch keys, send the message, and sleep.</li>
          </ul>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'white', padding: '24px', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          {connected ? (
            <div style={{ textAlign: 'center' }}>
              <CheckCircle2 size={64} color="#25D366" style={{ marginBottom: '16px' }} />
              <h3 style={{ margin: 0, color: '#1e293b' }}>WhatsApp Connected</h3>
              <p style={{ color: '#64748b' }}>Your number is actively linked to the ERP.</p>
            </div>
          ) : qrCode ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ padding: '16px', background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                 <QRCodeSVG value={qrCode} size={200} />
              </div>
              <p style={{ color: '#64748b', marginTop: '16px' }}>Scan this code from WhatsApp</p>
              <button className="btn-secondary" onClick={() => setConnected(true)}>Simulate Scan</button>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <QrCode size={64} color="#94a3b8" style={{ marginBottom: '16px' }} />
              <button className="btn-primary" style={{ background: '#25D366', border: 'none' }} onClick={generateQR} disabled={loading}>
                {loading ? 'Generating...' : 'Generate QR Code'}
              </button>
            </div>
          )}
          {error && <p style={{ color: 'var(--danger)', marginTop: '12px' }}>{error}</p>}
        </div>
      </div>
    </motion.div>
  );
};

export default WhatsAppSetup;
