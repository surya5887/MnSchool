import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Bell, GraduationCap, Settings, BookOpen, UserPlus, CalendarCheck, ShieldAlert, FileText, Bus, Clock, Library as LibraryIcon, Menu, X, User } from 'lucide-react'; 
import { LiveClock } from './LiveClock';
import { motion, AnimatePresence } from 'framer-motion';
import { getSchoolSettings } from '../services/settingsService';
import ProfileSidebar from './ProfileSidebar';
import { runAutomatedBilling } from '../services/billingService';
import { migrateMissingSessions } from '../services/migrationService';
import { getAuditLogs, clearSpamLogs, autoLog } from '../services/auditService';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    setMobileMenuOpen(false);
  }, [location.pathname]);
  const [activeSession, setActiveSession] = useState(localStorage.getItem('activeSession') || 'Loading...');
  const [billingNotification, setBillingNotification] = useState('');

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
    try {
      let notifs = [];
      
      // Check for Drafts
      const draftStr = localStorage.getItem('admission_drafts');
      if (draftStr) {
        const draftsObj = JSON.parse(draftStr);
        const draftsCount = Object.keys(draftsObj).length;
        if (draftsCount > 0) {
          notifs.push({
            id: 'draft',
            title: 'Draft Forms Pending',
            message: `You have ${draftsCount} admission form(s) saved in draft. Don't forget to complete them.`,
            time: new Date().toISOString(),
            type: 'warning'
          });
        }
      }

      // Fetch Audit Logs (Recent 10)
      if (['Principal', 'Manager', 'Super Admin'].includes(authUser.role)) {
        let logs = await getAuditLogs();
        
        // ROLE-BASED FILTERING: Hide Super Admin activities from everyone else
        if (authUser.role !== 'Super Admin') {
          logs = logs.filter(log => log.role !== 'Super Admin');
        }

        // EXCLUDE Auth (login/logout) from bell notifications
        logs = logs.filter(log => !log.action.toLowerCase().includes('logged'));
        // --- dummy block for brace matching ---
        if(false){
        }

        const recentLogs = logs.slice(0, 10).map(log => ({
          id: log.id,
          title: log.action,
          message: `By ${log.user} (${log.role})`,
          time: log.time,
          type: log.status === 'Success' ? 'info' : 'error'
        }));
        notifs = [...notifs, ...recentLogs];

        // OS PUSH NOTIFICATIONS LOGIC
        if (Notification.permission === 'granted' && logs.length > 0) {
          const lastNotifiedTimeStr = localStorage.getItem('last_os_notification_time') || '0';
          const lastNotifiedTime = new Date(lastNotifiedTimeStr).getTime();
          let latestLogTime = lastNotifiedTime;

          logs.forEach(log => {
            const logTime = new Date(log.time).getTime();
            if (logTime > lastNotifiedTime) {
              // Send native push notification
              new Notification("MN Public School Alert", {
                body: `${log.action} by ${log.user} (${log.role})`,
                icon: '/images/logo_circular.png' // assuming this exists based on the header code
              });
              if (logTime > latestLogTime) {
                latestLogTime = logTime;
              }
            }
          });

          // Update the last notified time if we sent new ones
          if (latestLogTime > lastNotifiedTime) {
            localStorage.setItem('last_os_notification_time', new Date(latestLogTime).toISOString());
          }
        } else if (Notification.permission !== 'denied') {
           // If they haven't explicitly denied, request on mount will handle it, 
           // but we can ensure first run sets the baseline time so we don't spam 50 old logs when they accept.
           if (!localStorage.getItem('last_os_notification_time') && logs.length > 0) {
              localStorage.setItem('last_os_notification_time', new Date(logs[0].time).toISOString());
           }
        }
      }

      setNotifications(notifs);
      setUnreadCount(notifs.length); // simple counter for UI
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    // Temp cleanup
    if (!localStorage.getItem('spam_cleared')) {
      clearSpamLogs().then(() => localStorage.setItem('spam_cleared', 'true'));
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const [authUser, setAuthUser] = useState<any>(
    JSON.parse(localStorage.getItem('authUser') || sessionStorage.getItem('authUser') || '{}')
  );

  useEffect(() => {
    if (!authUser || !authUser.role) {
      navigate('/login');
    }
  }, [authUser, navigate]);

  useEffect(() => {
    const fetchSessionAndRunBilling = async () => {
      try {
        const settings = await getSchoolSettings();
        if (settings && settings.activeSession) {
          setActiveSession(settings.activeSession);
          localStorage.setItem('activeSession', settings.activeSession);
          
          if (['Principal', 'Manager', 'Super Admin'].includes(authUser.role)) {
            const migratedCount = await migrateMissingSessions();
            if (migratedCount > 0) {
              console.log(`Migrated ${migratedCount} entities to active session.`);
            }
            const count = await runAutomatedBilling();
            if (count > 0) {
              setBillingNotification(`Auto-Billing: ${count} invoices generated.`);
              setTimeout(() => setBillingNotification(''), 5000);
            }
          }
        }
      } catch (err) {
        console.error("Error setting up session", err);
      }
    };

    const handleSettingsUpdate = () => {
      fetchSessionAndRunBilling();
    };
    
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    fetchSessionAndRunBilling();
    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdate);
  }, [authUser.role]);

  const handleLogout = async () => {
    await autoLog('User logged out', 'Success');
    localStorage.removeItem('authUser');
    sessionStorage.removeItem('authUser');
    navigate('/login');
  };

  const navLinkStyle = ({isActive}: {isActive: boolean}) => ({
    padding: '12px 16px', borderRadius: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px',
    color: isActive ? 'white' : 'var(--text-main)',
    background: isActive ? 'var(--primary-gradient)' : 'transparent',
    fontWeight: isActive ? 600 : 500,
    boxShadow: isActive ? '0 4px 15px rgba(99, 102, 241, 0.3)' : 'none',
    transition: 'var(--transition)'
  });
  useEffect(() => {
    const handleStorage = () => {
      setAuthUser(JSON.parse(localStorage.getItem('authUser') || sessionStorage.getItem('authUser') || '{}'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);


  const role = authUser.role || '';

  return (
    <div className="app-container">
      {/* Mobile Overlay */}
      <div className={`mobile-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)}></div>

      {/* Sidebar */}
      <aside
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
          zIndex: 9999
        }}
      >
        <button 
          className="mobile-menu-btn" 
          style={{ 
            position: 'absolute', 
            top: '16px', 
            right: '16px', 
            background: 'var(--glass-bg)', 
            border: '1px solid var(--glass-border)', 
            color: 'var(--text-main)', 
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }} 
          onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(false); }}
        >
          <X size={20} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
          <img src="/images/logo_circular.png" alt="School Logo" style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
          <div>
            <h2 style={{ fontSize: "1.1rem", margin: 0, whiteSpace: "nowrap" }}>MN Public School</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }}></div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Session {activeSession}</span>
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }} onClick={() => setMobileMenuOpen(false)}>
          
          {['Principal', 'Manager', 'Super Admin', 'Teacher'].includes(role) && (
            <NavLink to="/dashboard" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><LayoutDashboard size={20} /> Dashboard</NavLink>
          )}
          
          {['Principal', 'Manager', 'Super Admin'].includes(role) && (
            <>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '12px', paddingLeft: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Core System</div>
              <NavLink to="/admission" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><UserPlus size={20} /> New Admission</NavLink>
              <NavLink to="/students" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><Users size={20} /> Students Directory</NavLink>
              <NavLink to="/staff" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><GraduationCap size={20} /> Teachers</NavLink>
              <NavLink to="/attendance" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><CalendarCheck size={20} /> Daily Attendance</NavLink>
              
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '12px', paddingLeft: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Academics & Operations</div>
              <NavLink to="/classes" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><BookOpen size={20} /> Classes & Sections</NavLink>
              <NavLink to="/exam" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><FileText size={20} /> Exams & Results</NavLink>
              <NavLink to="/timetable" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><Clock size={20} /> Class Timetable</NavLink>
              <NavLink to="/transport" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><Bus size={20} /> Transport Fleet</NavLink>
              <NavLink to="/library" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><LibraryIcon size={20} /> Library Management</NavLink>

              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '12px', paddingLeft: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Financials</div>
              <NavLink to="/ledger" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><BookOpen size={20} /> Master Ledger</NavLink>
              
              {role === 'Super Admin' && (
                <>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '12px', paddingLeft: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Security & Config</div>
                  <NavLink to="/audit" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><ShieldAlert size={20} /> Audit Logs</NavLink>
                </>
              )}
            </>
          )}

          {role === 'Teacher' && (
            <>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '12px', paddingLeft: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>My Work</div>
              <NavLink to="/attendance" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><CalendarCheck size={20} /> Daily Attendance</NavLink>
              <NavLink to="/timetable" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><Clock size={20} /> Class Timetable</NavLink>
              <NavLink to="/students" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><Users size={20} /> Students Directory</NavLink>
              <NavLink to={`/staff/${authUser.id}`} style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><User size={20} /> My Profile & Ledger</NavLink>
            </>
          )}

          {role === 'Student' && (
            <>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '12px', paddingLeft: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>My Dashboard</div>
              <NavLink to={`/student/${authUser.id}`} style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><User size={20} /> My Profile & Ledger</NavLink>
              <NavLink to="/attendance" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><CalendarCheck size={20} /> My Attendance</NavLink>
              <NavLink to="/timetable" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><Clock size={20} /> Class Timetable</NavLink>
            </>
          )}
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }} onClick={() => setMobileMenuOpen(false)}>
          {['Principal', 'Manager', 'Super Admin'].includes(role) && (
            <NavLink to="/settings" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}><Settings size={20} /> System Settings</NavLink>
          )}
          <button onClick={handleLogout} className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'transparent', color: 'var(--danger)' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <button className="mobile-menu-btn" style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.4)' }} onClick={() => setMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>
             
              <LiveClock />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <button 
                className="glass-panel" 
                onClick={() => { setShowNotifications(!showNotifications); if(!showNotifications) fetchNotifications(); }}
                style={{ padding: '10px', borderRadius: '50%', display: 'flex', border: 'none', cursor: 'pointer', position: 'relative', background: showNotifications ? 'rgba(99, 102, 241, 0.1)' : 'var(--glass-bg)' }}
              >
                <Bell size={20} color={showNotifications ? "var(--primary)" : "var(--text-main)"} />
                {unreadCount > 0 && (
                  <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '18px', height: '18px', borderRadius: '50%', background: 'var(--danger)', border: '2px solid white', color: 'white', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} onClick={() => setShowNotifications(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      style={{ 
                        position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: '340px', 
                        background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)',
                        borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)',
                        zIndex: 999, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '80vh'
                      }}
                    >
                      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(99, 102, 241, 0.05)' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}><Bell size={18} color="var(--primary)"/> Notifications</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setUnreadCount(0)}>Mark all read</span>
                      </div>
                      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
                        {notifications.length === 0 ? (
                          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ background: 'var(--glass-bg)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                              <Bell size={24} color="var(--text-muted)" opacity={0.5} />
                            </div>
                            No new notifications
                          </div>
                        ) : (
                          notifications.map((notif, idx) => (
                            <div key={idx} style={{ padding: '12px 20px', borderBottom: idx < notifications.length - 1 ? '1px solid var(--glass-border)' : 'none', display: 'flex', gap: '12px', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background = 'var(--glass-bg)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'} onClick={() => { if(notif.id === 'draft') { navigate('/new-admission'); setShowNotifications(false); } }}>
                              <div style={{ marginTop: '2px' }}>
                                {notif.type === 'warning' && <AlertCircle size={18} color="var(--warning)" />}
                                {notif.type === 'error' && <AlertCircle size={18} color="var(--danger)" />}
                                {notif.type === 'info' && <CheckCircle2 size={18} color="var(--success)" />}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{notif.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{notif.message}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px', opacity: 0.7 }}>
                                  {new Date(notif.time).toLocaleDateString()} at {new Date(notif.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <div onClick={() => setShowProfileSidebar(true)} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '4px 8px', borderRadius: '12px', transition: 'background 0.2s' }} className="hover-highlight">
                <div className="hide-on-mobile" style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{authUser.name || 'User'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{authUser.role || 'Role'}</div>
                </div>
                <img src={authUser.photoUrl || `https://ui-avatars.com/api/?name=${authUser.name || 'U'}&background=6366f1&color=fff`} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
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

      <ProfileSidebar isOpen={showProfileSidebar} onClose={() => setShowProfileSidebar(false)} authUser={authUser} />
    </div>
  );
};

export default Layout;
