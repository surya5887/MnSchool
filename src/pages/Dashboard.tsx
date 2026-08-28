import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, IndianRupee, TrendingUp, Clock } from 'lucide-react';
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
    style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}
  >
    <div style={{ padding: '16px', borderRadius: '16px', background: `rgba(${color}, 0.1)`, color: `rgb(${color})`, flexShrink: 0 }}>
      <Icon size={32} />
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</p>
      <h3 style={{ fontSize: '1.8rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</h3>
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

  // Calculate real Pending Dues dynamically
  let totalPendingDues = 0;

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
      <div className="dashboard-grid" style={{ marginBottom: "40px" }}>
        <StatCard title="Total Students" value={loading ? "..." : students.length.toString()} icon={Users} color="99, 102, 241" delay={0.1} />
        <StatCard title="Teachers" value={loading ? "..." : staff.length.toString()} icon={GraduationCap} color="168, 85, 247" delay={0.2} />
        <StatCard title="Today's Collection" value={`₹${todaysCollection.toLocaleString()}`} icon={IndianRupee} color="16, 185, 129" delay={0.3} />
        <StatCard title="Pending Dues" value={loading ? "..." : `₹${totalPendingDues.toLocaleString()}`} icon={TrendingUp} color="245, 158, 11" delay={0.4} />
      </div>

      <div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-panel"
          style={{ padding: '32px' }}
        >
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
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
