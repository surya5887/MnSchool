import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, IndianRupee, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getStudents, type StudentData } from '../services/studentService';
import { getTransactions, type TransactionData } from '../services/financeService';
import { getStaff, type StaffData } from '../services/staffService';
import { getClasses, type ClassData } from '../services/classService';

const StatCard = ({ title, value, icon: Icon, color, delay }: {title: string, value: string, icon: any, color: string, delay: number}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-panel" 
    style={{ display: 'flex', alignItems: 'center', gap: '20px' }}
  >
    <div style={{ padding: '16px', borderRadius: '16px', background: `rgba(${color}, 0.1)`, color: `rgb(${color})` }}>
      <Icon size={32} />
    </div>
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>{title}</p>
      <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{value}</h3>
    </div>
  </motion.div>
);

const Dashboard: React.FC = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [staff, setStaff] = useState<StaffData[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsData, staffData, txnsData, classesData] = await Promise.all([
          getStudents(),
          getStaff(),
          getTransactions(),
          getClasses()
        ]);
        setStudents(studentsData);
        setStaff(staffData);
        setTransactions(txnsData);
        setClasses(classesData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todaysCollection = transactions
    .filter(t => t.type === 'Income' && t.date.startsWith(today))
    .reduce((sum, t) => sum + t.amount, 0);

  // Generate dynamic recent activities from transactions
  const recentActivities = transactions.slice(0, 5).map(t => ({
    time: new Date(t.date).toLocaleDateString(),
    action: t.type === 'Income' ? 'Fee Collected' : 'Expense Logged',
    details: `${t.description} (₹${t.amount})`
  }));

  // Generate dynamic revenue data by month
  const monthMap: Record<string, { revenue: number, expenses: number }> = {};
  transactions.forEach(t => {
    const month = new Date(t.date).toLocaleString('default', { month: 'short' });
    if (!monthMap[month]) monthMap[month] = { revenue: 0, expenses: 0 };
    if (t.type === 'Income') monthMap[month].revenue += t.amount;
    if (t.type === 'Expense') monthMap[month].expenses += t.amount;
  });
  
  const revenueData = Object.keys(monthMap).map(key => ({
    name: key,
    revenue: monthMap[key].revenue,
    expenses: monthMap[key].expenses
  }));
  
  // If empty, put dummy data for empty state
  if (revenueData.length === 0) {
    revenueData.push({ name: 'Current', revenue: 0, expenses: 0 });
  }

  // Calculate real Pending Dues dynamically
  let totalPendingDues = 0;
  let defaultersCount = 0;

  students.forEach(student => {
    const studentClass = classes.find(c => c.id === student.classId);
    let baseFeeTotal = 0;
    if (studentClass && studentClass.fees) {
      baseFeeTotal = studentClass.fees.reduce((sum, f) => sum + f.amount, 0);
    }
    
    const studentTxns = transactions.filter(t => t.studentId === student.id);
    const totalPaid = studentTxns.filter(t => t.type === 'Income' && t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const customCharges = studentTxns.filter(t => t.type === 'Income' && t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const pending = (baseFeeTotal + customCharges) - totalPaid;
    if (pending > 0) {
      totalPendingDues += pending;
      if (pending > 2000) defaultersCount++; // Arbitrary defaulter threshold
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <StatCard title="Total Students" value={loading ? "..." : students.length.toString()} icon={Users} color="99, 102, 241" delay={0.1} />
        <StatCard title="Teachers" value={loading ? "..." : staff.length.toString()} icon={GraduationCap} color="168, 85, 247" delay={0.2} />
        <StatCard title="Today's Collection" value={`₹${todaysCollection.toLocaleString()}`} icon={IndianRupee} color="16, 185, 129" delay={0.3} />
        <StatCard title="Pending Dues" value={loading ? "..." : `₹${totalPendingDues.toLocaleString()}`} icon={TrendingUp} color="245, 158, 11" delay={0.4} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Chart & Quick Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="glass-panel"
          >
            <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Revenue & Expenses (YTD)</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--glass-shadow)', background: 'rgba(255,255,255,0.9)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-panel"
            style={{ borderLeft: '4px solid var(--danger)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertCircle color="var(--danger)" />
              <h3 style={{ margin: 0 }}>Action Required: Defaulters</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>There are {defaultersCount} students who have not paid fees for over 2 months. Please generate the defaulter list and hand it over to class teachers.</p>
            <button className="btn-primary" style={{ background: 'var(--danger)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}>
              Download Defaulter List (PDF)
            </button>
          </motion.div>
        </div>

        {/* Right Sidebar: Feed & Transactions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="glass-panel"
          >
            <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Recent Activities</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {recentActivities.map((act, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ padding: '8px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', color: 'var(--primary-color)', height: 'fit-content' }}>
                    <Clock size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{act.action}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{act.details}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary-color)' }}>{act.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
