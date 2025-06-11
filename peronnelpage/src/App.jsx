import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeaderManager from './layout/HeaderManager';
import Dashboard from './pages/manager/Dashboard';
import ConsultantManagement from './pages/manager/ConsultantManagement';
import ContentReview from './pages/manager/ContentReview';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <HeaderManager userName="Manager" />
        <main className="content">
          <Routes>
            <Route path="/manager/dashboard" element={<Dashboard />} />
            <Route path="/manager/consultants" element={<ConsultantManagement />} />
            <Route path="/manager/content-review" element={<ContentReview />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
