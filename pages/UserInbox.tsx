import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Message, Priority, MessageType } from '../types';
import { 
  Search, Star, Trash2, Mail, MailOpen, Sparkles, X, ChevronLeft, 
  CheckCheck, Inbox, Reply 
} from 'lucide-react';
import { summarizeMessage } from '../services/geminiService';
import { useParams, useNavigate } from 'react-router-dom';

const UserInbox: React.FC = () => {
  const { messages, currentUser, markAsRead, markAsUnread, markAllAsRead, toggleStar, deleteMessage } = useData();
  const { messageId } = useParams<{messageId: string}>();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'starred' | 'system'>('all');
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Filter messages for current user
  const myMessages = useMemo(() => {
    return messages.filter(m => m.receiverId === currentUser.id || m.receiverId === 'ALL')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [messages, currentUser]);

  const filteredMessages = useMemo(() => {
    let result = myMessages;
    if (searchTerm) {
      result = result.filter(m => 
        m.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (activeTab === 'unread') result = result.filter(m => !m.isRead);
    if (activeTab === 'starred') result = result.filter(m => m.isStarred);
    if (activeTab === 'system') result = result.filter(m => m.type === MessageType.SYSTEM || m.type === MessageType.BROADCAST);
    return result;
  }, [myMessages, searchTerm, activeTab]);

  const selectedMessage = useMemo(() => {
      return myMessages.find(m => m.id === messageId) || null;
  }, [myMessages, messageId]);

  // Mark read when opening a message via URL
  useEffect(() => {
    if (selectedMessage && !selectedMessage.isRead) {
        markAsRead(selectedMessage.id);
    }
    // Reset summary when message changes
    setSummary(null);
  }, [selectedMessage?.id]);

  const handleSelectMessage = (msg: Message) => {
    navigate(`/inbox/${msg.id}`);
  };

  const handleCloseMessage = () => {
    navigate('/inbox');
  };

  const handleSummarize = async () => {
    if (!selectedMessage) return;
    setIsSummarizing(true);
    const result = await summarizeMessage(selectedMessage.content);
    setSummary(result);
    setIsSummarizing(false);
  };

  const handleToggleStar = (e: React.MouseEvent, msgId: string) => {
      e.stopPropagation();
      toggleStar(msgId);
  };

  const handleDelete = (id: string) => {
      if(confirm('Are you sure you want to delete this message?')) {
          deleteMessage(id);
          if (selectedMessage?.id === id) {
             navigate('/inbox');
          }
      }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 w-full">
      {/* Message List Sidebar */}
      <div className={`${selectedMessage ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-2/5 lg:w-1/3 border-r border-gray-200 bg-white`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Inbox</h1>
            <button 
              onClick={() => {
                if(confirm('Mark all messages as read?')) markAllAsRead();
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
            >
              Mark all read
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
             {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'starred', label: 'Starred' },
                { id: 'system', label: 'System' }
             ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
                    activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
             ))}
          </div>
        </div>

        {/* Message List Items */}
        <div className="flex-1 overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Inbox size={48} className="mb-2 opacity-30" />
              <p>No messages found</p>
            </div>
          ) : (
            filteredMessages.map(msg => (
              <div 
                key={msg.id}
                onClick={() => handleSelectMessage(msg)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 group relative ${
                  selectedMessage?.id === msg.id ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    {!msg.isRead && (
                       <span className="w-2 h-2 rounded-full bg-indigo-600 shadow-sm shadow-indigo-200"></span>
                    )}
                    <span className={`text-sm truncate max-w-[120px] ${!msg.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {msg.senderId === 'admin-1' ? 'System Admin' : msg.senderId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] text-gray-400">
                        {new Date(msg.createdAt).toLocaleDateString()}
                     </span>
                     <button 
                        onClick={(e) => handleToggleStar(e, msg.id)}
                        className={`transition-colors ${msg.isStarred ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400 opacity-0 group-hover:opacity-100'}`}
                     >
                        <Star size={16} fill={msg.isStarred ? "currentColor" : "none"} />
                     </button>
                  </div>
                </div>
                
                <h3 className={`text-sm mb-1 truncate pr-6 ${!msg.isRead ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                  {msg.subject}
                </h3>
                
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{msg.content}</p>
                
                <div className="mt-2.5 flex items-center gap-2">
                  {msg.type === MessageType.BROADCAST && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-100">
                      Broadcast
                    </span>
                  )}
                  {msg.priority === Priority.HIGH && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span> High Priority
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Detail View */}
      <div className={`${selectedMessage ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-white h-full relative`}>
        {selectedMessage ? (
          <>
            {/* Detail Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button className="md:hidden text-gray-500 hover:bg-gray-100 p-1 rounded-lg" onClick={handleCloseMessage}>
                  <ChevronLeft />
                </button>
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                   {selectedMessage.senderId === 'admin-1' ? 'SA' : selectedMessage.senderId.substring(0,2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                   <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{selectedMessage.senderId === 'admin-1' ? 'System Admin' : selectedMessage.senderId}</span>
                      <span className="text-xs text-gray-400">&lt;admin@nexus.com&gt;</span>
                   </div>
                   <span className="text-xs text-gray-500">
                      To: {selectedMessage.receiverId === 'ALL' ? 'Everyone' : 'Me'} • {new Date(selectedMessage.createdAt).toLocaleString()}
                   </span>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-1">
                 <button 
                   onClick={() => toggleStar(selectedMessage.id)}
                   className="p-2 text-gray-400 hover:bg-yellow-50 hover:text-yellow-500 rounded-lg transition-colors"
                   title="Star Message"
                 >
                   <Star size={18} fill={selectedMessage.isStarred ? "#eab308" : "none"} className={selectedMessage.isStarred ? "text-yellow-500" : ""} />
                 </button>
                 <button 
                   onClick={() => {
                      markAsUnread(selectedMessage.id);
                      navigate('/inbox');
                   }}
                   className="p-2 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                   title="Mark as Unread"
                 >
                   <Mail size={18} />
                 </button>
                 <button 
                   onClick={() => handleDelete(selectedMessage.id)}
                   className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                   title="Delete"
                 >
                   <Trash2 size={18} />
                 </button>
              </div>
            </div>

            {/* Subject Line Area */}
            <div className="px-8 pt-8 pb-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{selectedMessage.subject}</h1>
                <div className="flex gap-2">
                    {selectedMessage.type === MessageType.SYSTEM && <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">System</span>}
                    {selectedMessage.type === MessageType.BROADCAST && <span className="bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">Announcement</span>}
                    {selectedMessage.priority === Priority.HIGH && <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">High Priority</span>}
                </div>
            </div>

            {/* AI Action Area */}
            <div className="px-8 mb-4">
                {summary ? (
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 animate-fade-in relative group shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-indigo-800 font-semibold text-sm">
                        <Sparkles size={14} className="text-indigo-600" /> AI Summary
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
                        <button 
                        onClick={() => setSummary(null)} 
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                        <X size={14} />
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={handleSummarize}
                        disabled={isSummarizing}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors w-fit"
                    >
                        <Sparkles size={14} />
                        {isSummarizing ? 'Generating Summary...' : 'Summarize with AI'}
                    </button>
                )}
            </div>

            {/* Message Content */}
            <div className="flex-1 overflow-y-auto px-8 pb-8">
              <div className="prose prose-slate max-w-none text-gray-800 whitespace-pre-wrap leading-7 text-[15px]">
                {selectedMessage.content}
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                {selectedMessage.type === MessageType.BROADCAST ? (
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm shadow-green-200">
                        <CheckCheck size={18} /> I have read and understood
                    </button>
                ) : (
                    <a 
                      href={`mailto:admin@nexus.com?subject=Re: ${selectedMessage.subject}`} 
                      className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        <Reply size={18} /> Reply
                    </a>
                )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MailOpen size={32} className="text-gray-300" />
            </div>
            <p className="text-lg font-medium text-gray-500">Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInbox;