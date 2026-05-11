import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/training/Dashboard';
import ModuleViewer from './components/training/ModuleViewer';
import AdminDashboard from './components/admin/AdminDashboard';
import type { Driver } from './services/dataService';

const App: React.FC = () => {
  const [driver, setDriver] = useState<Driver | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('onboarding_driver');
    if (saved) {
      try {
        setDriver(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('onboarding_driver');
      }
    }
  }, []);

  const handleLogin = (d: Driver) => {
    setDriver(d);
    localStorage.setItem('onboarding_driver', JSON.stringify(d));
  };

  const handleLogout = () => {
    setDriver(null);
    localStorage.removeItem('onboarding_driver');
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-display">
        <Navbar driver={driver} onLogout={handleLogout} />
        <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={
              driver ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/register" element={
              driver ? <Navigate to="/dashboard" /> : <Register onRegister={handleLogin} />
            } />
            <Route path="/dashboard" element={
              driver ? <Dashboard driver={driver} /> : <Navigate to="/" />
            } />
            <Route path="/module/:id" element={
              driver ? <ModuleViewer driver={driver} /> : <Navigate to="/" />
            } />
            <Route path="/admin" element={
              <AdminDashboard />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
