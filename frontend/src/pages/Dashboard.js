import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Package, CheckCircle, TrendingUp } from 'lucide-react';

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    equipment: 0,
    onboardingInProgress: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const employeeRes = await axios.get('/api/employees', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const equipmentRes = await axios.get('/api/equipment/inventory', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        setStats({
          totalEmployees: employeeRes.data.length,
          activeEmployees: employeeRes.data.filter(e => e.status === 'active').length,
          equipment: equipmentRes.data.length,
          onboardingInProgress: 0
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <div className="card-header">
        <h2 className="card-title">Welcome, {user?.first_name}!</h2>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.activeEmployees}</div>
          <div className="stat-label">Active Employees</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💻</div>
          <div className="stat-value">{stats.equipment}</div>
          <div className="stat-label">Equipment Items</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">0</div>
          <div className="stat-label">Pending Onboardings</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">0</div>
          <div className="stat-label">Orders This Month</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Start Guide</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div style={{ padding: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>👤 Employee Management</h4>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '1rem' }}>Create and manage employee profiles with all their information in one place.</p>
            <a href="/employees" style={{ color: '#5BADE2', textDecoration: 'none', fontWeight: 500 }}>Go to Employees →</a>
          </div>

          <div style={{ padding: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>🚀 Onboarding</h4>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '1rem' }}>Start the onboarding process with automated checklists for each role.</p>
            <a href="/onboarding" style={{ color: '#5BADE2', textDecoration: 'none', fontWeight: 500 }}>Go to Onboarding →</a>
          </div>

          <div style={{ padding: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>📦 Equipment Tracking</h4>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '1rem' }}>Track all equipment with serial numbers and shipment status.</p>
            <a href="/equipment" style={{ color: '#5BADE2', textDecoration: 'none', fontWeight: 500 }}>Go to Equipment →</a>
          </div>

          <div style={{ padding: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>🏥 Facilities & Scheduling</h4>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '1rem' }}>Manage nursing homes and provider schedules.</p>
            <a href="/facilities" style={{ color: '#5BADE2', textDecoration: 'none', fontWeight: 500 }}>Go to Facilities →</a>
          </div>

          <div style={{ padding: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>🛒 Procurement Orders</h4>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '1rem' }}>Submit and track supply orders from your team.</p>
            <a href="/procurement" style={{ color: '#5BADE2', textDecoration: 'none', fontWeight: 500 }}>Go to Procurement →</a>
          </div>

          <div style={{ padding: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>📊 Analytics</h4>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '1rem' }}>View hiring, turnover, and spending analytics.</p>
            <a href="/analytics" style={{ color: '#5BADE2', textDecoration: 'none', fontWeight: 500 }}>Go to Analytics →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
