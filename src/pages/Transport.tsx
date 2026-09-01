import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, MapPin, Users, Plus, AlertCircle, Trash2, Edit, Save, X, Phone, CheckCircle2, TrendingDown, IndianRupee, FileText, UserCircle2 } from 'lucide-react';
import Modal from '../components/Modal';
import { getVehicles, addVehicle, updateVehicle, deleteVehicle, logTransportExpense, type VehicleData } from '../services/transportService';
import { getStudents, type StudentData } from '../services/studentService';
import { getTransactions, type TransactionData } from '../services/financeService';

const Transport: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'fleet' | 'ledger'>('fleet');

  // Modals
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [viewStudentsForRoute, setViewStudentsForRoute] = useState<string | null>(null);

  // Form States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [vehicleForm, setVehicleForm] = useState<Omit<VehicleData, 'id'>>({
    vehicleNo: '', route: '', driverName: '', driverPhone: '', capacity: 40, monthlyFee: 0, status: 'Running'
  });
  const [expenseForm, setExpenseForm] = useState({
    vehicleId: '', amount: 0, category: 'Transport Fuel' as 'Transport Fuel' | 'Transport Maintenance' | 'Driver Salary', description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [v, s, t] = await Promise.all([
        getVehicles(),
        getStudents(),
        getTransactions({ type: 'Expense' })
      ]);
      setVehicles(v);
      setStudents(s);
      
      const transportTxns = t.filter(txn => txn.category.includes('Transport') || txn.category === 'Driver Salary');
      setTransactions(transportTxns);
    } catch (error) {
      console.error("Error fetching transport data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateVehicle(editingId, vehicleForm);
      } else {
        await addVehicle(vehicleForm);
      }
      setIsVehicleModalOpen(false);
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Error saving vehicle');
    }
  };

  const handleLogExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.vehicleId) return alert('Select a vehicle');
    try {
      const v = vehicles.find(v => v.id === expenseForm.vehicleId);
      if(!v) return;
      await logTransportExpense(v.id!, v.vehicleNo, expenseForm.amount, expenseForm.category, expenseForm.description, new Date().toISOString().split('T')[0]);
      setIsExpenseModalOpen(false);
      alert('Expense logged successfully to Master Ledger!');
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Error logging expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this vehicle/route?")) {
      await deleteVehicle(id);
      fetchData();
    }
  };

  const studentsOnTransport = useMemo(() => students.filter(s => s.transportRoute && s.transportRoute !== 'Not Required'), [students]);
  const totalMonthlyRevenue = useMemo(() => {
    return studentsOnTransport.reduce((sum, s) => {
      const routeVehicle = vehicles.find(v => v.route === s.transportRoute);
      return sum + (routeVehicle?.monthlyFee || 0);
    }, 0);
  }, [studentsOnTransport, vehicles]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Transport Fleet...</div>;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '2.4rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', padding: '12px', borderRadius: '16px', color: 'white', display: 'flex', boxShadow: '0 8px 15px rgba(236,72,153,0.3)' }}>
              <Bus size={32} />
            </div>
            Transport Fleet
          </h1>
          <p className="page-subtitle" style={{ fontSize: '1.1rem', marginTop: '8px' }}>Manage school buses, assigned routes, fees, and expenditures.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary hover-scale" onClick={() => { setExpenseForm({ vehicleId: '', amount: 0, category: 'Transport Fuel', description: '' }); setIsExpenseModalOpen(true); }} style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--glass-bg)', borderRadius: '12px' }}>
            <TrendingDown size={18} color="var(--danger)" /> Log Expense
          </button>
          <button className="btn-primary hover-scale" onClick={() => { setEditingId(null); setVehicleForm({ vehicleNo: '', route: '', driverName: '', driverPhone: '', capacity: 40, monthlyFee: 0, status: 'Running' }); setIsVehicleModalOpen(true); }} style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', border: 'none' }}>
            <Plus size={18} /> Add New Vehicle
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '50%' }}><Bus size={28} color="#3b82f6" /></div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Vehicles</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{vehicles.length}</div>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '50%' }}><MapPin size={28} color="#10b981" /></div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Routes</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{new Set(vehicles.map(v => v.route)).size}</div>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '50%' }}><Users size={28} color="#f59e0b" /></div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Students Enrolled</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{studentsOnTransport.length}</div>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ background: '#f5f3ff', padding: '16px', borderRadius: '50%' }}><IndianRupee size={28} color="#8b5cf6" /></div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Expected Monthly Rev</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>₹{totalMonthlyRevenue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('fleet')}
          style={{ padding: '12px 24px', borderRadius: '12px', background: activeTab === 'fleet' ? 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)' : 'var(--glass-bg)', color: activeTab === 'fleet' ? 'white' : 'var(--text-main)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '1rem', transition: 'all 0.3s' }}
        >
          <Bus size={20} /> Fleet & Routes
        </button>
        <button 
          onClick={() => setActiveTab('ledger')}
          style={{ padding: '12px 24px', borderRadius: '12px', background: activeTab === 'ledger' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'var(--glass-bg)', color: activeTab === 'ledger' ? 'white' : 'var(--text-main)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '1rem', transition: 'all 0.3s' }}
        >
          <FileText size={20} /> Transport Ledger
        </button>
      </div>

      {activeTab === 'fleet' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {vehicles.length === 0 ? (
            <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No vehicles added yet. Click "Add New Vehicle" to setup transport routes.
            </div>
          ) : vehicles.map(vehicle => {
            const routeStudents = students.filter(s => s.transportRoute === vehicle.route);
            const occupancyRatio = routeStudents.length / (vehicle.capacity || 1);
            
            return (
              <motion.div key={vehicle.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel hover-scale" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Card Header (Vehicle No & Status) */}
                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'var(--primary-color)', color: 'white', padding: '8px', borderRadius: '10px' }}>
                      <Bus size={24} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-main)' }}>{vehicle.vehicleNo}</h3>
                    </div>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', padding: '4px 10px', borderRadius: '20px', background: vehicle.status === 'Running' ? '#dcfce7' : vehicle.status === 'Off-Duty' ? '#f3f4f6' : '#fee2e2', color: vehicle.status === 'Running' ? '#16a34a' : vehicle.status === 'Off-Duty' ? '#4b5563' : '#ef4444', fontWeight: 600 }}>
                    {vehicle.status === 'Running' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {vehicle.status}
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Route & Fee Pill */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass-bg)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={18} color="#8b5cf6" />
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{vehicle.route}</span>
                    </div>
                    <div style={{ fontWeight: 700, color: '#10b981' }}>₹{vehicle.monthlyFee}/mo</div>
                  </div>

                  {/* Driver Details */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '50%', border: '1px solid #e2e8f0' }}>
                      <UserCircle2 size={28} color="#64748b" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned Driver</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>{vehicle.driverName}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><Phone size={14}/> {vehicle.driverPhone || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Occupancy */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Occupancy</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{routeStudents.length} / {vehicle.capacity}</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--glass-border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: occupancyRatio > 0.9 ? '#ef4444' : occupancyRatio > 0.6 ? '#f59e0b' : '#3b82f6', width: `${Math.min(100, occupancyRatio * 100)}%`, transition: 'width 0.5s ease-out' }}></div>
                    </div>
                  </div>

                </div>

                {/* Card Footer (Actions) */}
                <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.02)', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => setViewStudentsForRoute(vehicle.route)} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} /> View Students
                  </button>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setVehicleForm({ vehicleNo: vehicle.vehicleNo, route: vehicle.route, driverName: vehicle.driverName, driverPhone: vehicle.driverPhone, capacity: vehicle.capacity, monthlyFee: vehicle.monthlyFee, status: vehicle.status }); setEditingId(vehicle.id!); setIsVehicleModalOpen(true); }} className="btn-secondary" style={{ padding: '8px', borderRadius: '8px' }} title="Edit Vehicle">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(vehicle.id!)} className="btn-secondary" style={{ padding: '8px', borderRadius: '8px', color: 'var(--danger)', background: '#fee2e2', borderColor: '#fca5a5' }} title="Delete Vehicle">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.4)' }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingDown size={20} color="#ef4444" /> Transport Ledger (Expenses)
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>All fuel, maintenance, and salary expenses linked to Master Ledger.</p>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ef4444' }}>
              Total: ₹{transactions.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.02)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <th style={{ padding: '16px 24px', fontWeight: 600 }}>DATE</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600 }}>VEHICLE NO / DETAILS</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600 }}>CATEGORY</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, textAlign: 'right' }}>AMOUNT (₹)</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No transport expenses logged yet.
                    </td>
                  </tr>
                ) : transactions.map(txn => (
                  <tr key={txn.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 500 }}>{txn.date}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ color: 'var(--text-main)' }}>{txn.description}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ display: 'inline-block', padding: '4px 10px', background: txn.category.includes('Fuel') ? '#fef3c7' : txn.category.includes('Maintenance') ? '#fee2e2' : '#e0e7ff', color: txn.category.includes('Fuel') ? '#b45309' : txn.category.includes('Maintenance') ? '#b91c1c' : '#4338ca', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                        {txn.category}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 700, color: '#ef4444' }}>
                      ₹{txn.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {viewStudentsForRoute && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-panel" style={{ background: 'rgba(255,255,255,0.95)', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                <h3 style={{ margin: 0, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={20} /> Students on {viewStudentsForRoute}
                </h3>
                <button onClick={() => setViewStudentsForRoute(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
              </div>
              <div style={{ overflowY: 'auto', padding: '16px 0', flex: 1 }}>
                {students.filter(s => s.transportRoute === viewStudentsForRoute).length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No students assigned to this route.</div>
                ) : (
                  students.filter(s => s.transportRoute === viewStudentsForRoute).map((student, i) => (
                    <div key={student.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', ':hover': { background: 'rgba(0,0,0,0.02)' } }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
                          {i+1}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{student.firstName} {student.lastName}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Class {student.classId} {student.sectionId} • Adm No: {student.admissionNo}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--primary-color)', background: 'var(--glass-bg)', padding: '4px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12}/> {student.phone || student.parentPhone || 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Modal isOpen={isVehicleModalOpen} onClose={() => setIsVehicleModalOpen(false)} title={editingId ? "Edit Vehicle & Route" : "Add New Vehicle & Route"}>
        <form onSubmit={handleSaveVehicle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Route Name *</label>
              <input type="text" value={vehicleForm.route} onChange={e => setVehicleForm({...vehicleForm, route: e.target.value})} className="glass-input" required placeholder="e.g. Route 1 - City Center" style={{ background: '#f8fafc' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Vehicle No. *</label>
              <input type="text" value={vehicleForm.vehicleNo} onChange={e => setVehicleForm({...vehicleForm, vehicleNo: e.target.value})} className="glass-input" required placeholder="UP 14 AB 1234" style={{ background: '#f8fafc' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Max Capacity *</label>
              <input type="number" value={vehicleForm.capacity} onChange={e => setVehicleForm({...vehicleForm, capacity: Number(e.target.value)})} className="glass-input" required style={{ background: '#f8fafc' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Driver Name *</label>
              <input type="text" value={vehicleForm.driverName} onChange={e => setVehicleForm({...vehicleForm, driverName: e.target.value})} className="glass-input" required placeholder="e.g. Ramesh" style={{ background: '#f8fafc' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Driver Phone</label>
              <input type="text" value={vehicleForm.driverPhone} onChange={e => setVehicleForm({...vehicleForm, driverPhone: e.target.value})} className="glass-input" placeholder="+91..." style={{ background: '#f8fafc' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Monthly Fee (₹) *</label>
              <input type="number" value={vehicleForm.monthlyFee} onChange={e => setVehicleForm({...vehicleForm, monthlyFee: Number(e.target.value)})} className="glass-input" required placeholder="e.g. 1500" style={{ background: '#f8fafc' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Status</label>
              <select value={vehicleForm.status} onChange={e => setVehicleForm({...vehicleForm, status: e.target.value as any})} className="glass-input" style={{ background: '#f8fafc' }}>
                <option value="Running">Running</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Off-Duty">Off-Duty</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={() => setIsVehicleModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Save size={18} /> {editingId ? 'Update Vehicle' : 'Save Vehicle'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Log Transport Expense">
        <form onSubmit={handleLogExpense}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Select Vehicle *</label>
              <select value={expenseForm.vehicleId} onChange={e => setExpenseForm({...expenseForm, vehicleId: e.target.value})} className="glass-input" required style={{ background: '#f8fafc' }}>
                <option value="">-- Choose Vehicle --</option>
                {vehicles.map(v => <option key={v.id} value={v.id!}>{v.vehicleNo} ({v.route})</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Expense Category *</label>
              <select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value as any})} className="glass-input" required style={{ background: '#f8fafc' }}>
                <option value="Transport Fuel">Fuel (Diesel/Petrol/CNG)</option>
                <option value="Transport Maintenance">Maintenance & Repair</option>
                <option value="Driver Salary">Driver Salary</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Amount (₹) *</label>
              <input type="number" value={expenseForm.amount || ''} onChange={e => setExpenseForm({...expenseForm, amount: Number(e.target.value)})} className="glass-input" required min="1" placeholder="e.g. 2000" style={{ background: '#f8fafc' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Description</label>
              <input type="text" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} className="glass-input" required placeholder="e.g. 50L Diesel / Tyre replacement" style={{ background: '#f8fafc' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--danger)', border: 'none' }}><TrendingDown size={18} /> Log Expense</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Transport;
