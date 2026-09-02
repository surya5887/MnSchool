import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, IndianRupee, TrendingUp, Clock, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { getStudents, type StudentData } from '../services/studentService';
import { getTransactions, type TransactionData } from '../services/financeService';
import { getStaff, type StaffData } from '../services/staffService';
import { getClasses, type ClassData } from '../services/classService';
import { getAttendance } from '../services/attendanceService';
import { getSchoolSettings, saveSchoolSettings, type SchoolSettingsData } from '../services/settingsService';
import { getVehicles, type VehicleData } from '../services/transportService';
import { addTransaction } from '../services/financeService';


const StatCard = ({ title, value, icon: Icon, color, delay }: {title: string, value: string, icon: any, color: string, delay: number}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-panel" 
    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 16px' }}
  >
    <div style={{ padding: '12px', borderRadius: '16px', background: `rgba(${color}, 0.1)`, color: `rgb(${color})`, flexShrink: 0 }}>
      <Icon size={32} />
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</p>
      <h3 style={{ fontSize: '1.8rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</h3>
    </div>
  </motion.div>
);

const Dashboard: React.FC = () => {
  const authUser = JSON.parse(sessionStorage.getItem('authUser') || localStorage.getItem('authUser') || '{}');
  const role = authUser.role || '';
  const [students, setStudents] = useState<StudentData[]>([]);
  const [staff, setStaff] = useState<StaffData[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SchoolSettingsData | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<Record<string, string>>({});
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingDone, setBillingDone] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsData, staffData, txnsData, classesData, settingsData, vehiclesData] = await Promise.all([
          getStudents(),
          getStaff(),
          getTransactions(),
          getClasses(),
          getSchoolSettings(),
          getVehicles()
        ]);
        setStudents(studentsData);
        setStaff(staffData);
        setTransactions(txnsData);
        setClasses(classesData);
        setSettings(settingsData);
        setVehicles(vehiclesData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const currentMonthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const needsBilling = settings && settings.lastBillingMonth !== currentMonthStr;

  const handleGenerateMonthlyFees = async () => {
    if (!window.confirm(`Are you sure you want to generate automated fees for ${currentMonthStr}?`)) return;
    setBillingLoading(true);
    try {
      let feesGenerated = 0;
      
      for (const student of students) {
        if (student.status === 'Inactive') continue;

        // 1. Generate Tuition Fee
        const studentClass = classes.find(c => c.className === student.classId);
        if (studentClass && studentClass.monthlyFee > 0) {
          await addTransaction({
            type: 'Charge',
            category: 'Monthly Tuition Fee',
            amount: studentClass.monthlyFee,
            date: new Date().toISOString().split('T')[0],
            description: `Tuition Fee for ${currentMonthStr}`,
            studentId: student.id,
            chargeType: 'Tuition Fee'
          });
          feesGenerated++;
        }

        // 2. Generate Transport Fee (if applicable)
        if (student.transportRoute && student.transportRoute !== 'Not Required') {
          const bus = vehicles.find(v => v.route === student.transportRoute);
          if (bus && bus.monthlyFee > 0) {
            await addTransaction({
              type: 'Charge',
              category: 'Transport Fee',
              amount: bus.monthlyFee,
              date: new Date().toISOString().split('T')[0],
              description: `Transport Fee (${bus.route}) for ${currentMonthStr}`,
              studentId: student.id,
              chargeType: 'Transport Fee'
            });
            feesGenerated++;
          }
        }
      }

      if (settings) {
        await saveSchoolSettings({ ...settings, lastBillingMonth: currentMonthStr });
        setSettings({ ...settings, lastBillingMonth: currentMonthStr });
      }
      setBillingDone(true);
      alert(`Successfully generated ${feesGenerated} fee charges for ${currentMonthStr}!`);
      // Reload txns (optional, but a hard refresh works too)
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Error generating fees. Please check console.');
    } finally {
      setBillingLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todaysCollection = transactions
    .filter(t => t.type === 'Income' && t.date.startsWith(today))
    .reduce((sum, t) => sum + t.amount, 0);

  // Generate dynamic recent activities from transactions
  const recentActivities = transactions.slice(0, 5).map(t => {
    let actionLabel = 'Transaction';
    if (t.type === 'Income') actionLabel = 'Fee Collected';
    else if (t.type === 'Charge') actionLabel = 'Dues Generated';
    else if (t.type === 'Expense') actionLabel = 'Expense Logged';
    else if (t.type === 'Discount') actionLabel = 'Discount Given';
    
    return {
      time: new Date(t.date).toLocaleDateString(),
      action: actionLabel,
      details: `${t.description} (₹${t.amount})`
    };
  });

  // Calculate real Pending Dues dynamically
  let totalPendingDues = 0;

  const myClassByMapping = classes.find(c => c.classTeacher === authUser.name);
    const isValidAssigned = authUser.assignedClass && classes.some(c => c.className === authUser.assignedClass);
    const teacherFallback = {
      class: isValidAssigned ? authUser.assignedClass : (myClassByMapping?.className || authUser.assignedClass || ''),
      section: authUser.assignedSection || (myClassByMapping?.sections?.[0] || '')
    };
    
    // Filter students strictly by BOTH class and section
    const myStudentsList = students.filter(s => {
      const matchClass = s.classId === teacherFallback.class;
      const matchSection = (!teacherFallback.section || s.sectionId === teacherFallback.section);
      const matchStatus = s.status !== 'Inactive';
      return matchClass && matchSection && matchStatus;
    });
    
    const myStudentsCount = myStudentsList.length;
    
    const presentCount = myStudentsList.filter(s => s.id && todayAttendance[s.id] === 'Present').length;
    const absentCount = myStudentsList.filter(s => s.id && todayAttendance[s.id] === 'Absent').length;
    const unmarkedCount = myStudentsCount - presentCount - absentCount;

  students.forEach(student => {
    const studentTxns = transactions.filter(t => t.studentId === student.id);
    let currentBal = 0;
    studentTxns.forEach(t => {
      if (t.type === 'Charge') currentBal += t.amount;
      else if (t.type === 'Income' || t.type === 'Discount') currentBal -= t.amount;
    });
    if (currentBal > 0) {
      totalPendingDues += currentBal;
    }
  });
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Welcome back, here's what's happening at MN Public School today.</p>
        </div>
      </div>

      {/* Stats Grid */}
        {role !== 'Teacher' && (
          <div className="dashboard-grid" style={{ marginBottom: "40px" }}>
            <StatCard title="Total Students" value={loading ? "..." : students.length.toString()} icon={Users} color="99, 102, 241" delay={0.1} />
            <StatCard title="Teachers" value={loading ? "..." : staff.length.toString()} icon={GraduationCap} color="168, 85, 247" delay={0.2} />
            <StatCard title="Today's Collection" value={`₹${todaysCollection.toLocaleString()}`} icon={IndianRupee} color="16, 185, 129" delay={0.3} />
            <StatCard title="Pending Dues" value={loading ? "..." : `₹${totalPendingDues.toLocaleString()}`} icon={TrendingUp} color="245, 158, 11" delay={0.4} />
          </div>
        )}

      <div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-panel"
          style={{ padding: '32px' }}
        >
          {role === 'Teacher' ? (
            <>
              {/* Teacher Today's Stats */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-main)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={20} color="var(--primary)" /> Today's Attendance ({new Date().toLocaleDateString('en-GB')})
                </h3>
                <div className="dashboard-grid">
                  <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <div style={{ fontSize: '0.85rem', color: '#6366f1', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>My Students</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6366f1' }}>{myStudentsCount}</div>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div style={{ fontSize: '0.85rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Present</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{presentCount}</div>
                  </div>
                  <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <div style={{ fontSize: '0.85rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Absent</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>{absentCount}</div>
                  </div>
                  <div style={{ background: 'rgba(107, 114, 128, 0.08)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(107,114,128,0.2)' }}>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Unmarked</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6b7280' }}>{unmarkedCount}</div>
                  </div>
                </div>
              </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', padding: '32px', borderRadius: '16px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 10px 25px rgba(99,102,241,0.2)' }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '1.8rem', fontWeight: 800 }}>Welcome to your Dashboard!</h2>
                <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.95, lineHeight: 1.6 }}>Manage your class efficiently. You can mark daily attendance, check your timetable, and add new students directly from the sidebar.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 700 }}>Quick Actions</h4>
                <a href="/attendance" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.6)', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }} className="hover-scale">
                  <div style={{ background: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '12px' }}><CheckCircle2 size={24} /></div>
                  <span style={{ fontSize: '1.1rem' }}>Mark Daily Attendance</span>
                </a>
                <a href="/admission" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.6)', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }} className="hover-scale">
                  <div style={{ background: '#e0e7ff', color: '#3730a3', padding: '12px', borderRadius: '12px' }}><Users size={24} /></div>
                  <span style={{ fontSize: '1.1rem' }}>Admit New Student</span>
                  </a>
                </div>
              </div>
              

              </>
          ) : (
            <>
              <h3 style={{ marginTop: 0, marginBottom: '32px', fontSize: '1.5rem' }}>Recent Activities</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentActivities.map((act, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ padding: '10px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', color: 'var(--primary-color)', flexShrink: 0 }}>
                      <Clock size={20} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>{act.action}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{act.details}</div>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 500 }}>
                        {act.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;











