import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SelectionPage from './pages/SelectionPage';
import ExamPage from './pages/ExamPage';
import ResultPage from './pages/ResultPage';
import ReviewPage from './pages/ReviewPage';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gate_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('gate_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gate_user');
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/select" />} 
          />
          <Route 
            path="/select" 
            element={user ? <SelectionPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/exam/:qpName" 
            element={user ? <ExamPage user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/result/:qpName" 
            element={user ? <ResultPage user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/review/:qpName" 
            element={user ? <ReviewPage user={user} /> : <Navigate to="/login" />} 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
