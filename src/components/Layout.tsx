import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, LogOut, Bell, GraduationCap, Settings, BookOpen, Database, UserPlus, CalendarCheck, ShieldAlert, FileText, Bus, Clock, Library as LibraryIcon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSchoolSettings } from '../services/settingsService';
import { runAutomatedBilling } from '../services/billingService';
import { migrateMissingSessions } from '../services/migrationService';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(localStorage.getItem('activeSession') || 'Loading...');
  const [billingNotification, setBillingNotification] = useState('');

  useEffect(() => {
    const fetchSessionAndRunBilling = async () => {
      try {
        const settings = await getSchoolSettings();
        if (settings && settings.activeSession) {
          setActiveSession(settings.activeSession);
          localStorage.setItem('activeSession', settings.activeSession);
          
          // Run migration to attach session tags
          const migratedCount = await migrateMissingSessions();
          if (migratedCount > 0) {
            console.log(`Migrated ${migratedCount} legacy records to session ${settings.activeSession}`);
            // Fire event so lists refresh
            window.dispatchEvent(new Event('settingsUpdated'));
          }
        }
        
        // Run automated billing in background
        setTimeout(async () => {
          const generatedCount = await runAutomatedBilling();
          if (generatedCount > 0) {
            setBillingNotification(`Generated monthly fees for ${generatedCount} student(s)`);
            setTimeout(() => setBillingNotification(''), 5000);
          }
        }, 2000);

      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };
    fetchSessionAndRunBilling();

    const handleSettingsUpdate = () => {
      fetchSessionAndRunBilling();
    };
    
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdate);
  }, []);

  const handleLogout = () => {
    navigate('/login');
  };

  const navLinkStyle = ({isActive}: {isActive: boolean}) => ({
    padding: '12px 16px', borderRadius: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px',
    color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
    background: isActive ? 'rgba(255,255,255,0.8)' : 'transparent',
    fontWeight: isActive ? 600 : 500,
    transition: 'var(--transition)'
  });

  return (
    <div className="app-container">
      {/* Mobile Overlay */}
      <div className={`mobile-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)}></div>

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`glass-panel sidebar-container ${mobileMenuOpen ? 'open' : ''}`}
        style={{ 
          width: '280px', 
          height: '100vh', 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          borderRadius: 0,
          borderRight: '1px solid var(--glass-border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '32px 24px',
          zIndex: 100
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <img src="/images/logo.jpeg" alt="School Logo" style={{ width: '45px', height: '45px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>MN Public School</h2>
          </div>
          <button className="mobile-menu-btn" style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }} onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }} onClick={() => setMobileMenuOpen(false)}>
          <NavLink to="/dashboard" style={navLinkStyle}><LayoutDashboard size={20} /> Dashboard</NavLink>
          
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '12px', paddingLeft: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Core System</div>
          <NavLink to="/admission" style={navLinkStyle}><UserPlus size={20} /> New Admission</NavLink>
          <NavLink to="/students" style={navLinkStyle}><Users size={20} /> Students Directory</NavLink>
          <NavLink to="/attendance" style={navLinkStyle}><CalendarCheck size={20} /> Daily Attendance</NavLink>
          
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '12px', paddingLeft: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Academics & Operations</div>
          <NavLink to="/classes" style={navLinkStyle}><BookOpen size={20} /> Classes & Sections</NavLink>
          <NavLink to="/exam" style={navLinkStyle}><FileText size={20} /> Exams & Results</NavLink>
          <NavLink to="/timetable" style={navLinkStyle}><Clock size={20} /> Class Timetable</NavLink>
          <NavLink to="/transport" style={navLinkStyle}><Bus size={20} /> Transport Fleet</NavLink>
          <NavLink to="/library" style={navLinkStyle}><LibraryIcon size={20} /> Library Management</NavLink>

          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '12px', paddingLeft: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Financials</div>
          <NavLink to="/fees" style={navLinkStyle}><CreditCard size={20} /> Fee Collection</NavLink>
          <NavLink to="/ledger" style={navLinkStyle}><BookOpen size={20} /> Master Ledger</NavLink>
          <NavLink to="/legacy" style={navLinkStyle}><Database size={20} /> Legacy Data Entry</NavLink>
          <NavLink to="/staff" style={navLinkStyle}><GraduationCap size={20} /> Staff & Payroll</NavLink>
          
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '12px', paddingLeft: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Security & Config</div>
          <NavLink to="/audit" style={navLinkStyle}><ShieldAlert size={20} /> Audit Logs</NavLink>
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <NavLink to="/settings" style={navLinkStyle}><Settings size={20} /> System Settings</NavLink>
          <button onClick={handleLogout} className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'transparent', color: 'var(--danger)' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </motion.aside>

      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <button className="mobile-menu-btn" style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.4)' }} onClick={() => setMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="glass-panel" style={{ display: 'inline-flex', padding: '8px 16px', borderRadius: '20px', alignItems: 'center', gap: '8px', border: 'none', background: 'rgba(255,255,255,0.4)' }}>
               <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
               <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Session: {activeSession}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button className="glass-panel" style={{ padding: '8px', borderRadius: '50%', display: 'flex', border: 'none', cursor: 'pointer', position: 'relative' }}>
              <Bell size={20} color="var(--text-main)" />
              <div style={{ position: 'absolute', top: '0', right: '0', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--danger)', border: '2px solid white' }}></div>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Admin User</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Principal</div>
              </div>
              <img src="https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff" alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
            </div>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ flex: 1, paddingBottom: '40px' }}
        >
          <Outlet />
        </motion.div>
      </main>

      <AnimatePresence>
        {billingNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            style={{
              position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: 'var(--success)', color: 'white',
              padding: '12px 24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '8px',
              fontWeight: 600, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <Bell size={18} /> {billingNotification}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Layout;
