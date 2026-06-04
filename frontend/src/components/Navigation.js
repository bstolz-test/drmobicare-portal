import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Package, CheckSquare, LogOut, BarChart3, Lock, Building2, ShoppingCart } from 'lucide-react';

function Navigation({ user, onLogout }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="nav-logo">
        <div className="nav-logo-circle">M</div>
        <div className="nav-logo-text">
          <h1>Dr. MobiCare</h1>
          <p>Portal</p>
        </div>
      </div>

      <ul className="nav-menu">
        <li className="nav-item">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <Home size={18} />
            Dashboard
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/employees" className={`nav-link ${isActive('/employees') ? 'active' : ''}`}>
            <Users size={18} />
            Employees
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/onboarding" className={`nav-link ${isActive('/onboarding') ? 'active' : ''}`}>
            <CheckSquare size={18} />
            Onboarding
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/offboarding" className={`nav-link ${isActive('/offboarding') ? 'active' : ''}`}>
            <CheckSquare size={18} />
            Offboarding
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/equipment" className={`nav-link ${isActive('/equipment') ? 'active' : ''}`}>
            <Package size={18} />
            Equipment
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/facilities" className={`nav-link ${isActive('/facilities') ? 'active' : ''}`}>
            <Building2 size={18} />
            Facilities
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/procurement" className={`nav-link ${isActive('/procurement') ? 'active' : ''}`}>
            <ShoppingCart size={18} />
            Procurement
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/analytics" className={`nav-link ${isActive('/analytics') ? 'active' : ''}`}>
            <BarChart3 size={18} />
            Analytics
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/vault" className={`nav-link ${isActive('/vault') ? 'active' : ''}`}>
            <Lock size={18} />
            Password Vault
          </Link>
        </li>
      </ul>

      <div className="nav-user">
        <div className="nav-user-info">
          <p style={{ fontWeight: 500 }}>{user?.first_name} {user?.last_name}</p>
          <p style={{ fontSize: '12px', color: '#999' }}>{user?.role}</p>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={16} style={{ marginRight: '4px' }} />
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navigation;
