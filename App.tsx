import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import UserInbox from './pages/UserInbox';
import AdminDashboard from './pages/AdminDashboard';
import UserChatWidget from './components/UserChatWidget';
import { DataProvider, useData } from './context/DataContext';

const AppContent: React.FC = () => {
  const { currentUser } = useData();
  const location = useLocation();

  // Simple protection logic for demo
  if (location.pathname.startsWith('/admin') && currentUser.role !== 'admin') {
     return <Navigate to="/inbox" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden relative">
        <Routes>
          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/inbox" replace />} />
          
          {/* User Inbox Routes */}
          <Route path="/inbox" element={<UserInbox />} />
          <Route path="/inbox/:messageId" element={<UserInbox />} />
          
          {/* Admin Routes - using parameter for tab switching */}
          <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
          <Route path="/admin/:tab" element={<AdminDashboard />} />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/inbox" replace />} />
        </Routes>
        
        {/* Chat Widget (Only visible to normal users) */}
        <UserChatWidget />
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