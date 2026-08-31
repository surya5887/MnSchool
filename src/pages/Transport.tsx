import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, MapPin, Users, Plus, AlertCircle, Trash2, Edit, Save, X, Phone, CheckCircle2, TrendingDown, IndianRupee } from 'lucide-react';
import Modal from '../components/Modal';
import { getVehicles, addVehicle, updateVehicle, deleteVehicle, logTransportExpense, type VehicleData } from '../services/transportService';
import { getStudents, type StudentData } from '../services/studentService';

const Transport: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  
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
      const v = await getVehicles();
      const s = await getStudents();
      setVehicles(v);
      setStudents(s);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
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

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Fleet & Routes Overview</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>VEHICLE NO. & STATUS</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>ASSIGNED ROUTE</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>DRIVER INFO</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>OCCUPANCY</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>MONTHLY FEE</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No vehicles added yet. Add a vehicle to setup transport routes.
                  </td>
                </tr>
              ) : vehicles.map(vehicle => {
                const routeStudents = students.filter(s => s.transportRoute === vehicle.route);
                return (
                  <tr key={vehicle.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{vehicle.vehicleNo}</div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', padding: '2px 8px', borderRadius: '12px', background: vehicle.status === 'Running' ? '#dcfce7' : '#fee2e2', color: vehicle.status === 'Running' ? '#16a34a' : '#ef4444', marginTop: '4px' }}>
                        {vehicle.status === 'Running' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {vehicle.status}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: 500 }}>{vehicle.route}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 500 }}>{vehicle.driverName}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12}/> {vehicle.driverPhone || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '8px', background: 'var(--glass-border)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: (routeStudents.length / (vehicle.capacity || 1)) > 0.9 ? '#ef4444' : '#3b82f6', width: `${Math.min(100, (routeStudents.length / (vehicle.capacity || 1)) * 100)}%` }}></div>
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{routeStudents.length}/{vehicle.capacity}</span>
                      </div>
                      <button onClick={() => setViewStudentsForRoute(vehicle.route)} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.8rem', cursor: 'pointer', padding: 0, marginTop: '4px' }}>View Students</button>
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                      ₹{vehicle.monthlyFee}/mo
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => { setVehicleForm({ vehicleNo: vehicle.vehicleNo, route: vehicle.route, driverName: vehicle.driverName, driverPhone: vehicle.driverPhone, capacity: vehicle.capacity, monthlyFee: vehicle.monthlyFee, status: vehicle.status }); setEditingId(vehicle.id!); setIsVehicleModalOpen(true); }} className="btn-secondary" style={{ padding: '6px', borderRadius: '8px' }} title="Edit Vehicle">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(vehicle.id!)} className="btn-secondary" style={{ padding: '6px', borderRadius: '8px', color: 'var(--danger)' }} title="Delete Vehicle">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {viewStudentsForRoute && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-panel" style={{ background: 'white', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>Students on {viewStudentsForRoute}</h3>
                <button onClick={() => setViewStudentsForRoute(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div style={{ overflowY: 'auto', padding: '16px 0', flex: 1 }}>
                {students.filter(s => s.transportRoute === viewStudentsForRoute).length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No students assigned to this route.</div>
                ) : (
                  students.filter(s => s.transportRoute === viewStudentsForRoute).map((student, i) => (
                    <div key={student.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{i+1}. {student.firstName} {student.lastName}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Class {student.classId} {student.sectionId} • Adm No: {student.admissionNo}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem' }}><Phone size={12}/> {student.phone || student.parentPhone}</div>
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
