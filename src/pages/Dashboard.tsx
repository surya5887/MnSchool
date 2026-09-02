import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, IndianRupee, TrendingUp, Clock, AlertTriangle, FileText, CheckCircle2, BarChart2, Activity, Calendar, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getStudents, type StudentData } from '../services/studentService';
import { getTransactions, type TransactionData } from '../services/financeService';
import { getStaff, type StaffData } from '../services/staffService';
import { getClasses, type ClassData } from '../services/classService';
import { getAttendance } from '../services/attendanceService';
import { getSchoolSettings, saveSchoolSettings, type SchoolSettingsData } from '../services/settingsService';
import { getVehicles, type VehicleData } from '../services/transportService';
import { addTransaction } from '../services/financeService';

const StatCard = ({ title, value, icon: Icon, bgGradient, delay }: {title: string, value: string, icon: any, bgGradient: string, delay: number}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px 20px', background: bgGradient, color: 'white', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
  >
    <div style={{ padding: '12px', borderRadius: '16px', background: 'rgba(255,255,255,0.2)', color: 'white', flexShrink: 0 }}>
      <Icon size={36} />
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</p>
      <h3 style={{ fontSize: '2.2rem', margin: 0, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</h3>
    </div>
  </motion.div>
);

const Dashboard: React.FC = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [staff, setStaff] = useState<StaffData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<SchoolSettingsData | null>(null);
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingLoading, setBillingLoading] = useState(false);

  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
  const role = authUser.role || 'Admin';

  const [timeRange, setTimeRange] = useState('30d');

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

        const today = new Date().toISOString().split('T')[0];
        const attendanceData = await getAttendance(today);
        
        const attendanceMap: Record<string, string> = {};
        attendanceData.forEach(record => {
          if (record.studentId) {
            attendanceMap[record.studentId] = record.status;
          }
        });
        setTodayAttendance(attendanceMap);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGenerateMonthlyFees = async () => {
    const currentMonthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!window.confirm(`Are you sure you want to generate automated fees for ${currentMonthStr}?`)) return;
    setBillingLoading(true);
    try {
      let feesGenerated = 0;
      for (const student of students) {
        if (student.status === 'Inactive') continue;
        const studentClass = classes.find(c => c.className === student.classId);
        if (studentClass && studentClass.monthlyBaseFee) {
          await addTransaction({
            type: 'Charge',
            category: 'Monthly Tuition Fee',
            amount: studentClass.monthlyBaseFee,
            date: new Date().toISOString().split('T')[0],
            description: `Tuition Fee for ${currentMonthStr}`,
            studentId: student.id,
            chargeType: 'Tuition Fee'
          });
          feesGenerated++;
        }
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
      
      const newSettings = { ...(settings || { schoolName: 'MN Public School', address: '', phone: '', email: '' }), lastBillingMonth: currentMonthStr };
      await saveSchoolSettings(newSettings);
      setSettings(newSettings);
      
      alert(`Successfully generated ${feesGenerated} fee records for ${currentMonthStr}.`);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Error generating fees');
    } finally {
      setBillingLoading(false);
    }
  };

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
    const filteredStudents = students.filter(s => s.createdAt ? new Date(s.createdAt) >= cutoff : true);
    
    let totalIncome = 0;
    let totalExpense = 0;
    
    // Revenue Breakdown
    let tuitionFee = 0;
    let transportFee = 0;
    let otherIncome = 0;

    const dateMap = new Map();
    const admissionMap = new Map();
    
    filteredStudents.forEach(s => {
       if (!s.createdAt) return;
       const dateObj = new Date(s.createdAt);
       const key = (timeRange === '6m' || timeRange === '1y' || timeRange === 'all') 
        ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`
        : dateObj.toISOString().split('T')[0];
       if (!admissionMap.has(key)) admissionMap.set(key, 0);
       admissionMap.set(key, admissionMap.get(key) + 1);
    });

    filteredTxns.forEach(t => {
      if (t.type === 'Income') {
         totalIncome += t.amount;
         if (t.category.toLowerCase().includes('tuition')) tuitionFee += t.amount;
         else if (t.category.toLowerCase().includes('transport')) transportFee += t.amount;
         else otherIncome += t.amount;
      }
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
    const admissionChartData = Array.from(admissionMap.entries()).map(([k, v]) => ({ name: k, Admissions: v })).sort((a, b) => a.name.localeCompare(b.name));

    const pieData = [
      { name: 'Tuition Fee', value: tuitionFee },
      { name: 'Transport Fee', value: transportFee },
      { name: 'Other Income', value: otherIncome }
    ].filter(d => d.value > 0);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b'];

    return { totalIncome, totalExpense, chartData, admissionChartData, pieData, COLORS, newAdmissions: filteredStudents.length };
  }, [transactions, students, timeRange, role]);

  // General Metrics
  const today = new Date().toISOString().split('T')[0];
  const todaysCollection = transactions
    .filter(t => t.type === 'Income' && t.date.startsWith(today))
    .reduce((sum, t) => sum + t.amount, 0);

  let totalPendingDues = 0;
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

  // Teacher specific logic
  const myClassByMapping = classes.find(c => c.classTeacher === authUser.name);
  const isValidAssigned = authUser.assignedClass && classes.some(c => c.className === authUser.assignedClass);
  const teacherFallback = {
    class: isValidAssigned ? authUser.assignedClass : (myClassByMapping?.className || authUser.assignedClass || ''),
    section: authUser.assignedSection || (myClassByMapping?.sections?.[0] || '')
  };
  
  const myStudentsList = students.filter(s => {
    const matchClass = s.classId === teacherFallback.class;
    const matchSection = (!teacherFallback.section || s.sectionId === teacherFallback.section);
    return matchClass && matchSection && s.status !== 'Inactive';
  });
  
  const myStudentsCount = myStudentsList.length;
  const presentCount = myStudentsList.filter(s => s.id && todayAttendance[s.id] === 'Present').length;
  const absentCount = myStudentsList.filter(s => s.id && todayAttendance[s.id] === 'Absent').length;
  const unmarkedCount = myStudentsCount - presentCount - absentCount;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Welcome back, here's what's happening at MN Public School today.</p>
        </div>
      </div>

      {role !== 'Teacher' && (
        <div className="dashboard-grid" style={{ marginBottom: "40px" }}>
          <StatCard title="Total Students" value={loading ? "..." : students.length.toString()} icon={Users} bgGradient="linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" delay={0.1} />
          <StatCard title="Teachers" value={loading ? "..." : staff.length.toString()} icon={GraduationCap} bgGradient="linear-gradient(135deg, #db2777 0%, #e11d48 100%)" delay={0.2} />
          <StatCard title="Today's Collection" value={`₹${todaysCollection.toLocaleString()}`} icon={IndianRupee} bgGradient="linear-gradient(135deg, #059669 0%, #10b981 100%)" delay={0.3} />
          <StatCard title="Pending Dues" value={loading ? "..." : `₹${totalPendingDues.toLocaleString()}`} icon={TrendingUp} bgGradient="linear-gradient(135deg, #d97706 0%, #f59e0b 100%)" delay={0.4} />
        </div>
      )}

      {role === 'Teacher' ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ padding: '32px' }}>
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
        </motion.div>
      ) : (
        <>
          {analyticsData && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ marginBottom: '40px', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)' }}>
                  <BarChart2 size={28} color="var(--primary)" /> Comprehensive Analytics Suite
                </h3>
                
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.5)', padding: '6px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  {['7d', '30d', '2m', '3m', '6m', '1y', 'all'].map(r => (
                    <button 
                      key={r}
                      onClick={() => setTimeRange(r)}
                      style={{
                        padding: '8px 20px',
                        background: timeRange === r ? 'var(--primary)' : 'transparent',
                        color: timeRange === r ? 'white' : 'var(--text-main)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        transition: 'all 0.2s',
                        fontSize: '0.9rem'
                      }}
                    >
                      {r.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
                <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div style={{ fontSize: '0.85rem', color: '#059669', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={16}/> Period Income</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#059669' }}>₹{analyticsData.totalIncome.toLocaleString()}</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.05) 100%)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <div style={{ fontSize: '0.85rem', color: '#b91c1c', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={16} style={{transform: 'scaleY(-1)'}}/> Period Expense</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#b91c1c' }}>₹{analyticsData.totalExpense.toLocaleString()}</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.05) 100%)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <div style={{ fontSize: '0.85rem', color: '#4338ca', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={16}/> Net Profit</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#4338ca' }}>₹{(analyticsData.totalIncome - analyticsData.totalExpense).toLocaleString()}</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.05) 100%)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div style={{ fontSize: '0.85rem', color: '#b45309', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={16}/> New Admissions</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#b45309' }}>{analyticsData.newAdmissions}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
                <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid var(--glass-border)' }}>
                  <h4 style={{ margin: '0 0 24px 0', color: 'var(--text-main)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><IndianRupee size={18} color="#10b981"/> Income vs Expense Trend</h4>
                  <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                        <RechartsTooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                        <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid var(--glass-border)' }}>
                  <h4 style={{ margin: '0 0 24px 0', color: 'var(--text-main)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><PieChartIcon size={18} color="#6366f1"/> Revenue Breakdown</h4>
                  <div style={{ height: '300px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {analyticsData.pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={analyticsData.pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                            {analyticsData.pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={analyticsData.COLORS[index % analyticsData.COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value) => `₹${value}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}/>
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No income data for this period</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={24} color="var(--primary)" /> Timeline & Recent Activities
              </h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '23px', top: '20px', bottom: '20px', width: '2px', background: 'rgba(99,102,241,0.2)', zIndex: 0 }}></div>
              {recentActivities.length > 0 ? recentActivities.map((act, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', position: 'relative', zIndex: 1 }}>
                  <div style={{ padding: '14px', borderRadius: '50%', background: act.action === 'Fee Collected' ? '#dcfce7' : act.action === 'Expense Logged' ? '#fee2e2' : '#e0e7ff', color: act.action === 'Fee Collected' ? '#166534' : act.action === 'Expense Logged' ? '#991b1b' : '#3730a3', flexShrink: 0, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '4px solid white' }}>
                    {act.action === 'Fee Collected' ? <IndianRupee size={20} /> : act.action === 'Expense Logged' ? <TrendingUp size={20} style={{transform: 'scaleY(-1)'}}/> : <FileText size={20} />}
                  </div>
                  <div style={{ flex: 1, padding: '20px 24px', background: 'white', borderRadius: '16px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>{act.action}</div>
                      <div style={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: 600, background: 'rgba(99,102,241,0.1)', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} />
                        {act.time}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>{act.details}</div>
                  </div>
                </div>
              )) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No recent activities found.</div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
