import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import {
  EmployeeManagement,
  EquipmentTracker,
  Onboarding,
  Offboarding,
  Facilities,
  Procurement,
  Analytics,
  PasswordVault,
  Profile
} from './pages/index';

// Navigation
import Navigation from './components/Navigation';

function PrivateRoute({ children, token }) {
  return token ? children : <Navigate to="/login" />;
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      // Fetch current user
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(err => {
          console.error(err);
          setToken(null);
          localStorage.removeItem('token');
        });
    }
  }, [token]);

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        
        <Route
          path="/*"
          element={
            <PrivateRoute token={token}>
              <div className="app-layout">
                <Navigation user={user} onLogout={handleLogout} />
                <main className="app-main">
                  <Routes>
                    <Route path="/" element={<Dashboard user={user} />} />
                    <Route path="/employees" element={<EmployeeManagement token={token} user={user} />} />
                    <Route path="/equipment" element={<EquipmentTracker token={token} user={user} />} />
                    <Route path="/onboarding" element={<Onboarding token={token} user={user} />} />
                    <Route path="/offboarding" element={<Offboarding token={token} user={user} />} />
                    <Route path="/facilities" element={<Facilities token={token} user={user} />} />
                    <Route path="/procurement" element={<Procurement token={token} user={user} />} />
                    <Route path="/analytics" element={<Analytics token={token} user={user} />} />
                    <Route path="/vault" element={<PasswordVault token={token} user={user} />} />
                    <Route path="/profile" element={<Profile token={token} user={user} />} />
                  </Routes>
                </main>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
