import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Inbox, Send, Shield, User as UserIcon, LayoutDashboard, Settings, MessageSquareText } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { currentUser, switchUser, getUnreadCount, chatSessions } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const unreadCount = getUnreadCount();
  
  // Calculate total unread chat messages for admin
  const unreadChatCount = chatSessions.reduce((acc, session) => acc + session.unreadCount, 0);

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname.startsWith('/admin') && !location.pathname.includes('compose') && !location.pathname.includes('chat');
    return location.pathname.startsWith(path);
  };

  const handleSwitchUser = (role: 'admin' | 'user') => {
    switchUser(role);
    // Redirect to appropriate home page after switch
    if (role === 'admin') {
      navigate('/admin/overview');
    } else {
      navigate('/inbox');
    }
  };

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">N</span>
        </div>
        <span className="text-xl font-bold text-gray-800">NexusMail</span>
      </div>

      <div className="px-6 mb-6">
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
          <img src={currentUser.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
            <p className="text-xs text-gray-500 truncate capitalize">{currentUser.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {currentUser.role === 'user' ? (
          <>
            <Link to="/inbox" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/inbox') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Inbox size={18} />
              <span className="flex-1">Inbox</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </Link>
            <Link to="/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/settings') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Settings size={18} />
              Settings
            </Link>
          </>
        ) : (
          <>
            <Link to="/admin/overview" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/admin/overview' || location.pathname === '/admin' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link to="/admin/compose" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/admin/compose' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Send size={18} />
              Broadcast Message
            </Link>
            <Link to="/admin/chat" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/admin/chat' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <MessageSquareText size={18} />
              <span className="flex-1">Support Chat</span>
              {unreadChatCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadChatCount}</span>
              )}
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">Demo Controls</p>
        <button 
          onClick={() => handleSwitchUser(currentUser.role === 'admin' ? 'user' : 'admin')}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
        >
          {currentUser.role === 'admin' ? <UserIcon size={18} /> : <Shield size={18} />}
          Switch to {currentUser.role === 'admin' ? 'User' : 'Admin'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;