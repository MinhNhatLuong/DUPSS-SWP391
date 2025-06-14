import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HeaderManager from './layout/HeaderManager';
import HeaderAdmin from './layout/Header';
import Dashboard from './pages/manager/Dashboard';
import ConsultantManagement from './pages/manager/ConsultantManagement';
import ContentReview from './pages/manager/ContentReview';
import Login from './pages/Login';
import AdminPage from './pages/admin/AdminPage';
import HeaderConsultant from './layout/HeaderConsultant';
import ConsultantDashboard from './pages/consultant/Dashboard';
import Schedule from './pages/consultant/Schedule';
import BookingRequests from './pages/consultant/BookingRequests';
import ConsultantProfile from './pages/consultant/Profile';
import History from './pages/consultant/History';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <>
                <HeaderAdmin userName="Admin" />
                <main className="content">
                  <Routes>
                    <Route path="dashboard" element={<AdminPage />} />
                  </Routes>
                </main>
              </>
            }
          />

          {/* Manager Routes */}
          <Route
            path="/manager/*"
            element={
              <>
                <HeaderManager userName="Manager" />
                <main className="content">
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="consultants" element={<ConsultantManagement />} />
                    <Route path="content-review" element={<ContentReview />} />
                  </Routes>
                </main>
              </>
            }
          />

          {/* Consultant Routes */}
          <Route
            path="/consultant/*"
            element={
              <>
                <HeaderConsultant userName="Consultant" />
                <main className="content">
                  <Routes>
                    <Route path="dashboard" element={<ConsultantDashboard />} />
                    <Route path="schedule" element={<Schedule />} />
                    <Route path="requests" element={<BookingRequests />} />
                    <Route path="profile" element={<ConsultantProfile />} />
                    <Route path="history" element={<History />} />
                  </Routes>
                </main>
              </>
            }
          />

          {/* Default Route: chuyển hướng về /login nếu không khớp */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
