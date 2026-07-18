import React from 'react';
import { motion } from 'framer-motion';
import { Bus, MapPin, Users, Plus, AlertCircle } from 'lucide-react';

const Transport: React.FC = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title"><Bus size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Transport & Fleet</h1>
          <p className="page-subtitle">Manage school buses, assigned routes, and transport fees.</p>
        </div>
        <button className="btn-primary"><Plus size={18} /> Add New Vehicle</button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-card stat-card" style={{ padding: '24px' }}>
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}><Bus size={24} /></div>
          <h3>Total Vehicles</h3>
          <div className="value">12 Buses</div>
        </div>
        <div className="glass-card stat-card" style={{ padding: '24px' }}>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}><MapPin size={24} /></div>
          <h3>Active Routes</h3>
          <div className="value">8 Routes</div>
        </div>
        <div className="glass-card stat-card" style={{ padding: '24px' }}>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}><Users size={24} /></div>
          <h3>Students Enrolled</h3>
          <div className="value">340</div>
        </div>
        <div className="glass-card stat-card" style={{ padding: '24px', borderLeft: '4px solid var(--danger)' }}>
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}><AlertCircle size={24} /></div>
          <h3>Maintenance Due</h3>
          <div className="value">Bus #4</div>
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
              {[
                { no: 'UP 14 AB 1234', route: 'Route 1 - Civil Lines', driver: 'Raju (9876543210)', occ: '45/50', fee: '₹1500', status: 'Running' },
                { no: 'UP 14 AB 5678', route: 'Route 2 - Station Road', driver: 'Mohan (9876543211)', occ: '50/50', fee: '₹1200', status: 'Running' },
                { no: 'UP 14 CD 9012', route: 'Route 3 - MG Road', driver: 'Suresh (9876543212)', occ: '30/40', fee: '₹1800', status: 'Maintenance' },
              ].map(bus => (
                <tr key={bus.no}>
                  <td style={{ fontWeight: 600 }}>{bus.no}</td>
                  <td>{bus.route}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{bus.driver}</td>
                  <td>{bus.occ}</td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{bus.fee}</td>
                  <td>
                    <span className={`badge ${bus.status === 'Running' ? 'success' : 'danger'}`}>
                      {bus.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Transport;
