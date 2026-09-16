import React, { useState, useEffect } from "react";
import { ShieldAlert, MapPin } from "lucide-react";

export const LocationEnforcer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let watchId: number;
    
    const startWatching = () => {
      if (!navigator.geolocation) {
        setDenied(true);
        setLoading(false);
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setDenied(false);
          setLoading(false);
          (window as any).latestLocation = `GPS: ${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`;
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            setDenied(true);
            setLoading(false);
          }
        },
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    };

    // Force an immediate request to prompt the user
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDenied(false);
        setLoading(false);
        (window as any).latestLocation = `GPS: ${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`;
        startWatching();
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setDenied(true);
          setLoading(false);
        } else {
          // If timeout or other error, still try to watch
          startWatching();
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  if (denied) {
    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "var(--background-gradient, linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%))", color: "var(--text-main)", zIndex: 99999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", textAlign: "center", fontFamily: "sans-serif" }}>
        <div className="glass-panel" style={{ padding: "40px", maxWidth: "400px", borderRadius: "24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <MapPin size={40} color="#ef4444" />
          </div>
          <h2 style={{ margin: "0 0 16px 0", fontSize: "1.5rem" }}>Location Access Required</h2>
          <p style={{ margin: "0 0 24px 0", color: "var(--text-muted)", lineHeight: "1.6" }}>
            For security reasons, this application requires live location access to verify staff activity. 
            <br/><br/>
            <strong>Please allow Location permissions in your browser settings and reload.</strong>
          </p>
          <button 
            onClick={() => {
              setLoading(true);
              setTimeout(() => window.location.reload(), 500);
            }} 
            className="btn-primary"
            style={{ width: "100%", padding: "16px", fontSize: "1.1rem" }}
            disabled={loading}
          >
            {loading ? "Checking permissions..." : "I have enabled it, Reload"}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

