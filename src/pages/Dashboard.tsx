import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, IndianRupee, TrendingUp, Clock, AlertTriangle, FileText, CheckCircle2, BarChart2, Activity, Calendar, PieChart as PieChartIcon, School, UserCheck, Shield } from 'lucide-react';
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

const ChartCard = ({ title, icon: Icon, children, delay }: {title: string, icon: any, children: React.ReactNode, delay: number}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}
  >
    <h4 style={{ margin: '0 0 24px 0', color: 'var(--text-main)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Icon size={18} color="var(--primary)"/> {title}
    </h4>
    <div style={{ flex: 1, height: '280px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {children}
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
      }
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
    let cutoff = new Date(0);
    if (timeRange === '7d') cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (timeRange === '30d') cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (timeRange === '2m') cutoff = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    if (timeRange === '3m') cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    if (timeRange === '6m') cutoff = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    if (timeRange === '1y') cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const filteredTxns = transactions.filter(t => new Date(t.date) >= cutoff);
    const filteredStudents = students.filter(s => s.createdAt ? new Date(s.createdAt) >= cutoff : true);
    
    // Financial Metrics
    let totalIncome = 0;
    let totalExpense = 0;
    let tuitionFee = 0;
    let transportFee = 0;
    let otherIncome = 0;

    const dateMap = new Map();
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
    
    const revenueData = [
      { name: 'Tuition Fee', value: tuitionFee },
      { name: 'Transport Fee', value: transportFee },
      { name: 'Other Income', value: otherIncome }
    ].filter(d => d.value > 0);

    // Demographic Analytics
    let activeStudents = students.filter(s => s.status !== 'Inactive');
    
    // Gender Distribution
    let boys = activeStudents.filter(s => s.gender === 'Male').length;
    let girls = activeStudents.filter(s => s.gender === 'Female').length;
    let otherGender = activeStudents.filter(s => s.gender !== 'Male' && s.gender !== 'Female').length;
    const genderData = [
      { name: 'Boys', value: boys },
      { name: 'Girls', value: girls },
      ...(otherGender > 0 ? [{ name: 'Other', value: otherGender }] : [])
    ];

    // Class Distribution
    const classCountMap = new Map();
    activeStudents.forEach(s => {
      const cls = s.classId || 'Unassigned';
      classCountMap.set(cls, (classCountMap.get(cls) || 0) + 1);
    });
    const classDistData = Array.from(classCountMap.entries()).map(([k, v]) => ({ name: k, Students: v })).sort((a, b) => b.Students - a.Students).slice(0, 8); // Top 8 classes

    // Attendance Analytics (Today)
    let present = 0; let absent = 0; let halfday = 0;
    Object.values(todayAttendance).forEach(status => {
      if (status === 'Present') present++;
      if (status === 'Absent') absent++;
      if (status === 'Half Day') halfday++;
    });
    let unmarked = activeStudents.length - (present + absent + halfday);
    if (unmarked < 0) unmarked = 0;
    
    const attendanceData = [
      { name: 'Present', value: present },
      { name: 'Absent', value: absent },
      { name: 'Half Day', value: halfday },
      { name: 'Unmarked', value: unmarked }
    ].filter(d => d.value > 0);

    // Staff Roles
    const staffRoleMap = new Map();
    staff.filter(s => s.status === 'Active').forEach(s => {
      const roleName = s.role || 'Unassigned';
      staffRoleMap.set(roleName, (staffRoleMap.get(roleName) || 0) + 1);
    });
    const staffRoleData = Array.from(staffRoleMap.entries()).map(([k, v]) => ({ name: k, value: v }));

    // Colors
    const PIE_COLORS_REV = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];
    const PIE_COLORS_GEN = ['#3b82f6', '#ec4899', '#8b5cf6'];
    const PIE_COLORS_ATT = ['#10b981', '#ef4444', '#f59e0b', '#9ca3af'];
    const PIE_COLORS_STAFF = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

    return { 
      totalIncome, totalExpense, chartData, revenueData, genderData, classDistData, attendanceData, staffRoleData,
      PIE_COLORS_REV, PIE_COLORS_GEN, PIE_COLORS_ATT, PIE_COLORS_STAFF,
      newAdmissions: filteredStudents.length
    };
  }, [transactions, students, staff, todayAttendance, timeRange, role]);

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
    if (currentBal > 0) totalPendingDues += currentBal;
  });

  const recentActivities = transactions.slice(0, 5).map(t => {
    let actionLabel = 'Transaction';
    if (t.type === 'Income') actionLabel = 'Fee Collected';
    else if (t.type === 'Charge') actionLabel = 'Dues Generated';
    else if (t.type === 'Expense') actionLabel = 'Expense Logged';
    else if (t.type === 'Discount') actionLabel = 'Discount Given';
    return { time: new Date(t.date).toLocaleDateString(), action: actionLabel, details: `${t.description} (₹${t.amount})` };
  });

  // Teacher Logic
  const teacherFallback = { class: authUser.assignedClass || '', section: authUser.assignedSection || '' };
  const myStudentsList = students.filter(s => s.classId === teacherFallback.class && (!teacherFallback.section || s.sectionId === teacherFallback.section) && s.status !== 'Inactive');
  const myStudentsCount = myStudentsList.length;
  const presentCount = myStudentsList.filter(s => s.id && todayAttendance[s.id] === 'Present').length;
  const absentCount = myStudentsList.filter(s => s.id && todayAttendance[s.id] === 'Absent').length;
  const unmarkedCount = myStudentsCount - presentCount - absentCount;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '40px', paddingTop: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Welcome back, here's what's happening at MN Public School today.</p>
        </div>
      </div>

      {role !== 'Teacher' && (
        <div className="dashboard-grid" style={{ marginBottom: "40px" }}>
          <StatCard title="Total Students" value={loading ? "..." : students.filter(s => s.status !== 'Inactive').length.toString()} icon={Users} bgGradient="linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" delay={0.1} />
          <StatCard title="Staff Members" value={loading ? "..." : staff.filter(s => s.status === 'Active').length.toString()} icon={Shield} bgGradient="linear-gradient(135deg, #db2777 0%, #e11d48 100%)" delay={0.2} />
          <StatCard title="Today's Collection" value={`₹${todaysCollection.toLocaleString()}`} icon={IndianRupee} bgGradient="linear-gradient(135deg, #059669 0%, #10b981 100%)" delay={0.3} />
          <StatCard title="Pending Dues" value={loading ? "..." : `₹${totalPendingDues.toLocaleString()}`} icon={TrendingUp} bgGradient="linear-gradient(135deg, #d97706 0%, #f59e0b 100%)" delay={0.4} />
        </div>
      )}

      {role === 'Teacher' ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-main)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={20} color="var(--primary)" /> Today's Attendance ({new Date().toLocaleDateString('en-GB')})</h3>
            <div className="dashboard-grid">
              <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.2)' }}><div style={{ fontSize: '0.85rem', color: '#6366f1', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>My Students</div><div style={{ fontSize: '2rem', fontWeight: 800, color: '#6366f1' }}>{myStudentsCount}</div></div>
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)' }}><div style={{ fontSize: '0.85rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Present</div><div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{presentCount}</div></div>
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.2)' }}><div style={{ fontSize: '0.85rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Absent</div><div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>{absentCount}</div></div>
              <div style={{ background: 'rgba(107, 114, 128, 0.08)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(107,114,128,0.2)' }}><div style={{ fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Unmarked</div><div style={{ fontSize: '2rem', fontWeight: 800, color: '#6b7280' }}>{unmarkedCount}</div></div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', padding: '32px', borderRadius: '16px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 10px 25px rgba(99,102,241,0.2)' }}><h2 style={{ margin: '0 0 16px 0', fontSize: '1.8rem', fontWeight: 800 }}>Welcome to your Dashboard!</h2><p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.95, lineHeight: 1.6 }}>Manage your class efficiently.</p></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}><h4 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 700 }}>Quick Actions</h4><a href="/attendance" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.6)', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontWeight: 600 }}><div style={{ background: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '12px' }}><CheckCircle2 size={24} /></div><span style={{ fontSize: '1.1rem' }}>Mark Daily Attendance</span></a></div>
          </div>
        </motion.div>
      ) : (
        <>
          {analyticsData && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              
              {/* --- DEMOGRAPHICS & ATTENDANCE SECTION --- */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <School size={24} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-main)' }}>Demographics & Attendance</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <ChartCard title="Today's Attendance" icon={UserCheck} delay={0.6}>
                  {analyticsData.attendanceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={analyticsData.attendanceData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                          {analyticsData.attendanceData.map((e, i) => <Cell key={i} fill={analyticsData.PIE_COLORS_ATT[i % analyticsData.PIE_COLORS_ATT.length]} />)}
                        </Pie>
                        <RechartsTooltip formatter={(val) => [val, 'Students']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}/>
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div style={{ color: 'var(--text-muted)' }}>No data</div>}
                </ChartCard>

                <ChartCard title="Class Distribution (Top 8)" icon={Users} delay={0.7}>
                  {analyticsData.classDistData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.classDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                        <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} width={110} tickFormatter={(val) => val.length > 15 ? val.substring(0,12)+'..' : val} />
                        <RechartsTooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}/>
                        <Bar dataKey="Students" fill="#6366f1" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div style={{ color: 'var(--text-muted)' }}>No data</div>}
                </ChartCard>

                <ChartCard title="Gender Ratio" icon={PieChartIcon} delay={0.8}>
                  {analyticsData.genderData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={analyticsData.genderData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {analyticsData.genderData.map((e, i) => <Cell key={i} fill={analyticsData.PIE_COLORS_GEN[i % analyticsData.PIE_COLORS_GEN.length]} />)}
                        </Pie>
                        <RechartsTooltip formatter={(val) => [val, 'Students']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div style={{ color: 'var(--text-muted)' }}>No data</div>}
                </ChartCard>
              </div>

              {/* --- FINANCIAL ANALYTICS SECTION --- */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)' }}>
                  <BarChart2 size={24} color="var(--primary)" /> Financial Analytics
                </h3>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.7)', padding: '6px', borderRadius: '12px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                  {['7d', '30d', '2m', '3m', '6m', '1y', 'all'].map(r => (
                    <button key={r} onClick={() => setTimeRange(r)} style={{ padding: '8px 16px', background: timeRange === r ? 'var(--primary)' : 'transparent', color: timeRange === r ? 'white' : 'var(--text-main)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s', fontSize: '0.85rem' }}>{r.toUpperCase()}</button>
                  ))}
                </div>
              </div>

              <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
                <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '0.85rem', color: '#059669', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={16}/> Period Income</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#059669' }}>₹{analyticsData.totalIncome.toLocaleString()}</div>
                </div>
                <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '0.85rem', color: '#b91c1c', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={16} style={{transform: 'scaleY(-1)'}}/> Period Expense</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#b91c1c' }}>₹{analyticsData.totalExpense.toLocaleString()}</div>
                </div>
                <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '0.85rem', color: '#4338ca', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={16}/> Net Profit</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#4338ca' }}>₹{(analyticsData.totalIncome - analyticsData.totalExpense).toLocaleString()}</div>
                </div>
                <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '0.85rem', color: '#b45309', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={16}/> New Admissions</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#b45309' }}>{analyticsData.newAdmissions}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <ChartCard title="Income vs Expense Trend" icon={IndianRupee} delay={0.9}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                      <RechartsTooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                      <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Revenue Breakdown" icon={PieChartIcon} delay={1.0}>
                  {analyticsData.revenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={analyticsData.revenueData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                          {analyticsData.revenueData.map((e, i) => <Cell key={i} fill={analyticsData.PIE_COLORS_REV[i % analyticsData.PIE_COLORS_REV.length]} />)}
                        </Pie>
                        <RechartsTooltip formatter={(val) => `₹${val}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}/>
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div style={{ color: 'var(--text-muted)' }}>No income data for this period</div>}
                </ChartCard>
              </div>

              {/* --- STAFF & ACTIVITIES SECTION --- */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <Shield size={24} color="var(--primary)" />
                    <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-main)' }}>Staff Distribution</h3>
                  </div>
                  <div style={{ height: '320px', width: '100%', display: 'flex' }}><ChartCard title="Staff by Role" icon={UserCheck} delay={1.1}>
                    {analyticsData.staffRoleData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={analyticsData.staffRoleData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {analyticsData.staffRoleData.map((e, i) => <Cell key={i} fill={analyticsData.PIE_COLORS_STAFF[i % analyticsData.PIE_COLORS_STAFF.length]} />)}
                          </Pie>
                          <RechartsTooltip formatter={(val) => [val, 'Staff']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}/>
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <div style={{ color: 'var(--text-muted)' }}>No data</div>}
                  </ChartCard></div></div><div><div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <Clock size={24} color="var(--primary)" />
                    <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-main)' }}>Timeline & Recent Activities</h3>
                  </div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', height: '360px', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '23px', top: '20px', bottom: '20px', width: '2px', background: 'rgba(99,102,241,0.2)', zIndex: 0 }}></div>
                      {recentActivities.length > 0 ? recentActivities.map((act, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', position: 'relative', zIndex: 1 }}>
                          <div style={{ padding: '12px', borderRadius: '50%', background: act.action === 'Fee Collected' ? '#dcfce7' : act.action === 'Expense Logged' ? '#fee2e2' : '#e0e7ff', color: act.action === 'Fee Collected' ? '#166534' : act.action === 'Expense Logged' ? '#991b1b' : '#3730a3', flexShrink: 0, border: '4px solid white' }}>
                            {act.action === 'Fee Collected' ? <IndianRupee size={18} /> : act.action === 'Expense Logged' ? <TrendingUp size={18} style={{transform: 'scaleY(-1)'}}/> : <FileText size={18} />}
                          </div>
                          <div style={{ flex: 1, padding: '16px', background: 'rgba(249,250,251,0.5)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>{act.action}</div>
                              <div style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 600 }}>{act.time}</div>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{act.details}</div>
                          </div>
                        </div>
                      )) : <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No activities.</div>}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
