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
    <div className="glass-panel live-clock-panel" style={{ display: 'inline-flex', padding: '8px 16px', borderRadius: '20px', alignItems: 'center', gap: '8px', border: 'none', background: 'rgba(255,255,255,0.4)', boxShadow: 'none' }}>
      <Clock size={16} color="var(--primary-color)" />
      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", whiteSpace: "nowrap" }}>
        <span className="hide-on-mobile">{formattedDate} | </span>
        <span>{formattedTime.toUpperCase()}</span>
      </span>
    </div>
  );
};
