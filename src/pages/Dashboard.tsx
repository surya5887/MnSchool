import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, IndianRupee, TrendingUp, Clock, AlertTriangle, FileText, CheckCircle2, BarChart2, Activity, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
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

  
  const [timeRange, setTimeRange] = useState('30d');

  const analyticsData = useMemo(() => {
    if (role === 'Teacher') return null;

    const now = new Date();
    let cutoff = new Date(0); // lifetime
    if (timeRange === '7d') cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (timeRange === '30d') cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (timeRange === '2m') cutoff = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    if (timeRange === '3m') cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    if (timeRange === '6m') cutoff = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    if (timeRange === '1y') cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const filteredTxns = transactions.filter(t => new Date(t.date) >= cutoff);
    
    let totalIncome = 0;
    let totalExpense = 0;
    const dateMap = new Map();
    
    filteredTxns.forEach(t => {
      if (t.type === 'Income') totalIncome += t.amount;
      if (t.type === 'Expense') totalExpense += t.amount;

      const dateObj = new Date(t.date);
      const key = (timeRange === '6m' || timeRange === '1y' || timeRange === 'all') 
        ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`
        : dateObj.toISOString().split('T')[0];

      if (!dateMap.has(key)) dateMap.set(key, { name: key, Income: 0, Expense: 0 });
      const entry = dateMap.get(key);
      if (t.type === 'Income') entry.Income += t.amount;
      if (t.type === 'Expense') entry.Expense += t.amount;
    });

    const chartData = Array.from(dateMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    return { totalIncome, totalExpense, chartData };
  }, [transactions, timeRange, role]);

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
              <StatCard title="Total Students" value={loading ? "..." : students.length.toString()} icon={Users} bgGradient="linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" delay={0.1} />
              <StatCard title="Teachers" value={loading ? "..." : staff.length.toString()} icon={GraduationCap} bgGradient="linear-gradient(135deg, #db2777 0%, #e11d48 100%)" delay={0.2} />
              <StatCard title="Today's Collection" value={`₹${todaysCollection.toLocaleString()}`} icon={IndianRupee} bgGradient="linear-gradient(135deg, #059669 0%, #10b981 100%)" delay={0.3} />
              <StatCard title="Pending Dues" value={loading ? "..." : `₹${totalPendingDues.toLocaleString()}`} icon={TrendingUp} bgGradient="linear-gradient(135deg, #d97706 0%, #f59e0b 100%)" delay={0.4} />
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
              {/* Premium Analytics Engine */}
              {analyticsData && (
                <div style={{ marginBottom: '40px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                      <Activity size={24} color="var(--primary)" /> Financial Analytics Overview
                    </h3>
                    
                    {/* Time Range Selector */}
                    <div style={{ display: 'flex', background: 'var(--glass-bg)', padding: '4px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                      {['7d', '30d', '2m', '3m', '6m', '1y', 'all'].map(r => (
                        <button 
                          key={r}
                          onClick={() => setTimeRange(r)}
                          style={{
                            padding: '6px 16px',
                            background: timeRange === r ? 'var(--primary)' : 'transparent',
                            color: timeRange === r ? 'white' : 'var(--text-muted)',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                            fontSize: '0.9rem'
                          }}
                        >
                          {r.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                    <div style={{ background: 'rgba(16,185,129,0.1)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <div style={{ fontSize: '0.85rem', color: '#059669', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Period Income</div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669' }}>₹{analyticsData.totalIncome.toLocaleString()}</div>
                    </div>
                    <div style={{ background: 'rgba(239,68,68,0.1)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <div style={{ fontSize: '0.85rem', color: '#b91c1c', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Period Expense</div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#b91c1c' }}>₹{analyticsData.totalExpense.toLocaleString()}</div>
                    </div>
                    <div style={{ background: 'rgba(99,102,241,0.1)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <div style={{ fontSize: '0.85rem', color: '#4338ca', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Net Profit</div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4338ca' }}>₹{(analyticsData.totalIncome - analyticsData.totalExpense).toLocaleString()}</div>
                    </div>
                  </div>

                  <div style={{ height: '350px', width: '100%', background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid var(--glass-border)' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                          formatter={(value) => [`₹${value}`, undefined]}
                        />
                        <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                        <Area type="monotone" dataKey="Expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={24} color="var(--primary)" /> Timeline & Activities
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '23px', top: '20px', bottom: '20px', width: '2px', background: 'rgba(99,102,241,0.2)', zIndex: 0 }}></div>
                {recentActivities.map((act, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', position: 'relative', zIndex: 1 }}>
                    <div style={{ padding: '12px', borderRadius: '50%', background: act.action === 'Fee Collected' ? '#dcfce7' : act.action === 'Expense Logged' ? '#fee2e2' : '#e0e7ff', color: act.action === 'Fee Collected' ? '#166534' : act.action === 'Expense Logged' ? '#991b1b' : '#3730a3', flexShrink: 0, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                      {act.action === 'Fee Collected' ? <IndianRupee size={20} /> : act.action === 'Expense Logged' ? <TrendingUp size={20} /> : <FileText size={20} />}
                    </div>
                    <div style={{ flex: 1, padding: '16px 20px', background: 'white', borderRadius: '16px', border: '1px solid var(--glass-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>{act.action}</div>
                        <div style={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: 600, background: 'rgba(99,102,241,0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                          <Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                          {act.time}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>{act.details}</div>
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












