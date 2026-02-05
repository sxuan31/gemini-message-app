import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import UserInbox from './pages/UserInbox';
import AdminDashboard from './pages/AdminDashboard';
import { DataProvider, useData } from './context/DataContext';

const AppContent: React.FC = () => {
  const { currentUser } = useData();
  const location = useLocation();

  // Simple protection logic for demo
  if (location.pathname.startsWith('/admin') && currentUser.role !== 'admin') {
     return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<UserInbox />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/compose" element={<AdminDashboard />} /> {/* Re-using dashboard for demo simplicity, logic inside component */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <Router>
        <AppContent />
      </Router>
    </DataProvider>
  );
};

export default App;