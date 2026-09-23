import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const LiveClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
  
  const formattedTime = time.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });

  return (
    <div style={{ display: 'inline-flex', padding: '6px 16px', borderRadius: '100px', alignItems: 'center', gap: '10px', background: 'linear-gradient(to right, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.08))', border: '1px solid rgba(99, 102, 241, 0.2)', boxShadow: '0 2px 10px rgba(99, 102, 241, 0.05)' }}>
      <div style={{ background: 'white', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <Clock size={14} style={{ color: '#6366f1' }} />
      </div>
      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569", whiteSpace: "nowrap", letterSpacing: '0.2px' }}>
        <span className="hide-on-mobile">{formattedDate} <span style={{ color: '#cbd5e1', margin: '0 4px' }}>•</span> </span>
        <span style={{ color: '#1e293b' }}>{formattedTime.toUpperCase()}</span>
      </span>
    </div>
  );
};
