import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bus, MapPin, Users, Plus, AlertCircle } from 'lucide-react';
import Modal from '../components/Modal';
import { getVehicles, addVehicle, type VehicleData } from '../services/transportService';
import { getStudents } from '../services/studentService';

const Transport: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [transportStudentCount, setTransportStudentCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vehicleNo: '',
    route: '',
    driver: '',
    occupancy: '',
    monthlyFee: '',
    status: 'Running' as const
  });

  const fetchVehicles = async () => {
    try {
      const data = await getVehicles();
      setVehicles(data);
      
      const students = await getStudents();
      const count = students.filter(s => s.transportRoute && s.transportRoute !== 'Not Required').length;
      setTransportStudentCount(count);
    } catch (error) {
      console.error("Error fetching transport data", error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addVehicle(newVehicle);
      setIsModalOpen(false);
      setNewVehicle({ vehicleNo: '', route: '', driver: '', occupancy: '', monthlyFee: '', status: 'Running' });
      fetchVehicles();
    } catch (error) {
      console.error("Error adding vehicle", error);
    }
  };

  const activeRoutes = new Set(vehicles.map(v => v.route)).size;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title"><Bus size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Transport & Fleet</h1>
          <p className="page-subtitle">Manage school buses, assigned routes, and transport fees.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={18} /> Add New Vehicle</button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-card stat-card" style={{ padding: '24px' }}>
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}><Bus size={24} /></div>
          <h3>Total Vehicles</h3>
          <div className="value">{vehicles.length} Buses</div>
        </div>
        <div className="glass-card stat-card" style={{ padding: '24px' }}>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}><MapPin size={24} /></div>
          <h3>Active Routes</h3>
          <div className="value">{activeRoutes} Routes</div>
        </div>
        <div className="glass-card stat-card" style={{ padding: '24px' }}>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}><Users size={24} /></div>
          <h3>Students Enrolled</h3>
          <div className="value">{transportStudentCount}</div>
        </div>
        <div className="glass-card stat-card" style={{ padding: '24px', borderLeft: '4px solid var(--danger)' }}>
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}><AlertCircle size={24} /></div>
          <h3>Maintenance Due</h3>
          <div className="value">{vehicles.filter(v => v.status === 'Maintenance').length} Buses</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)' }}>
          <h3 style={{ margin: 0 }}>Fleet Overview</h3>
        </div>
        <div className="glass-table-container">
          <table>
            <thead>
              <tr>
                <th>Vehicle No.</th>
                <th>Assigned Route</th>
                <th>Driver Info</th>
                <th>Occupancy</th>
                <th>Monthly Fee</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(bus => (
                <tr key={bus.id}>
                  <td style={{ fontWeight: 600 }}>{bus.vehicleNo}</td>
                  <td>{bus.route}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{bus.driver}</td>
                  <td>{bus.occupancy}</td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{bus.monthlyFee}</td>
                  <td>
                    <span className={`badge ${bus.status === 'Running' ? 'success' : 'danger'}`}>
                      {bus.status}
                    </span>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No vehicles added yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Vehicle">
        <form onSubmit={handleAddVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Vehicle Number</label>
            <input required type="text" className="glass-input" value={newVehicle.vehicleNo} onChange={e => setNewVehicle({...newVehicle, vehicleNo: e.target.value})} placeholder="e.g. UP 14 AB 1234" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Route Description</label>
            <input required type="text" className="glass-input" value={newVehicle.route} onChange={e => setNewVehicle({...newVehicle, route: e.target.value})} placeholder="e.g. Route 1 - Civil Lines" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Driver Info</label>
            <input required type="text" className="glass-input" value={newVehicle.driver} onChange={e => setNewVehicle({...newVehicle, driver: e.target.value})} placeholder="e.g. Raju (9876543210)" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Occupancy</label>
              <input required type="text" className="glass-input" value={newVehicle.occupancy} onChange={e => setNewVehicle({...newVehicle, occupancy: e.target.value})} placeholder="e.g. 45/50" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Monthly Fee (₹)</label>
              <input required type="text" className="glass-input" value={newVehicle.monthlyFee} onChange={e => setNewVehicle({...newVehicle, monthlyFee: e.target.value})} placeholder="e.g. ₹1500" />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Status</label>
            <select className="glass-input" value={newVehicle.status} onChange={e => setNewVehicle({...newVehicle, status: e.target.value as any})}>
              <option value="Running">Running</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Vehicle</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Transport;
