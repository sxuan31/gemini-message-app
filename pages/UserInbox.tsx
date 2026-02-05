import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Message, Priority, MessageType } from '../types';
import { Search, Star, Trash2, Mail, MailOpen, Sparkles, X, ChevronLeft } from 'lucide-react';
import { summarizeMessage } from '../services/geminiService';

const UserInbox: React.FC = () => {
  const { messages, currentUser, markAsRead, deleteMessage } = useData();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'system'>('all');
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
    if (activeTab === 'system') result = result.filter(m => m.type === MessageType.SYSTEM || m.type === MessageType.BROADCAST);
    return result;
  }, [myMessages, searchTerm, activeTab]);

  const handleSelectMessage = (msg: Message) => {
    setSelectedMessage(msg);
    setSummary(null); // Reset summary
    if (!msg.isRead) {
      markAsRead(msg.id);
    }
  };

  const handleSummarize = async () => {
    if (!selectedMessage) return;
    setIsSummarizing(true);
    const result = await summarizeMessage(selectedMessage.content);
    setSummary(result);
    setIsSummarizing(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 w-full">
      {/* Message List */}
      <div className={`${selectedMessage ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-2/5 lg:w-1/3 border-r border-gray-200 bg-white`}>
        <div className="p-4 border-b border-gray-100 space-y-4">
          <h1 className="text-2xl font-bold text-gray-800">Inbox</h1>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
             {['all', 'unread', 'system'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full capitalize transition-colors ${
                    activeTab === tab 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
             ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <MailOpen size={48} className="mb-2 opacity-50" />
              <p>No messages found</p>
            </div>
          ) : (
            filteredMessages.map(msg => (
              <div 
                key={msg.id}
                onClick={() => handleSelectMessage(msg)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedMessage?.id === msg.id ? 'bg-indigo-50 border-indigo-100' : ''
                } ${!msg.isRead ? 'bg-white' : 'bg-gray-50/50'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    {!msg.isRead && <div className="w-2 h-2 rounded-full bg-indigo-600"></div>}
                    <span className={`text-sm ${!msg.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {msg.senderId === 'admin-1' ? 'System Admin' : msg.senderId}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className={`text-sm mb-1 truncate ${!msg.isRead ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                  {msg.subject}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2">{msg.content}</p>
                <div className="mt-2 flex items-center gap-2">
                  {msg.priority === Priority.HIGH && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600 border border-red-200">
                      High Priority
                    </span>
                  )}
                  {msg.tags?.map(tag => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">
                      {tag}
                    </span>
                  ))}
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
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <button className="md:hidden text-gray-500" onClick={() => setSelectedMessage(null)}>
                  <ChevronLeft />
                </button>
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-gray-900">{selectedMessage.subject}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                     <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                        {selectedMessage.type}
                     </span>
                     <span>•</span>
                     <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleSummarize()}
                  disabled={isSummarizing}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Sparkles size={16} />
                  {isSummarizing ? 'Thinking...' : 'AI Summary'}
                </button>
                <button 
                  onClick={() => {
                      deleteMessage(selectedMessage.id);
                      setSelectedMessage(null);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* AI Summary Section */}
            {summary && (
              <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 animate-fade-in relative group">
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
            )}

            {/* Message Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-slate max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
                {selectedMessage.content}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 bg-slate-50">
            <Mail size={64} className="mb-4 text-gray-200" />
            <p className="text-lg font-medium text-gray-400">Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInbox;