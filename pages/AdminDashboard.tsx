import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { MessageType, Priority } from '../types';
import { draftAnnouncement } from '../services/geminiService';
import { Users, Send, Bell, BarChart3, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const { messages, users, sendMessage } = useData();
  const [activeTab, setActiveTab] = useState<'overview' | 'compose'>('overview');

  // Compose State
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.NORMAL);
  const [targetGroup, setTargetGroup] = useState<'ALL' | 'users'>('ALL');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  // Stats Logic
  const totalMessages = messages.length;
  const broadcastCount = messages.filter(m => m.type === MessageType.BROADCAST).length;
  const activeUsers = users.length;
  const readRate = Math.round((messages.filter(m => m.isRead).length / totalMessages) * 100) || 0;

  const chartData = [
    { name: 'Total', value: totalMessages },
    { name: 'Broadcasts', value: broadcastCount },
    { name: 'System', value: messages.filter(m => m.type === MessageType.SYSTEM).length },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if(!subject || !content) {
        setNotification({ type: 'error', msg: 'Please fill in all fields.' });
        return;
    }

    sendMessage({
        senderId: 'admin-1',
        receiverId: targetGroup,
        subject,
        content,
        type: targetGroup === 'ALL' ? MessageType.BROADCAST : MessageType.PERSONAL,
        priority,
        tags: ['Announcement']
    });

    setNotification({ type: 'success', msg: 'Message sent successfully!' });
    setSubject('');
    setContent('');
    setAiPrompt('');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAIDraft = async () => {
    if (!aiPrompt) return;
    setIsDrafting(true);
    const result = await draftAnnouncement(aiPrompt, 'formal');
    setSubject(result.subject);
    setContent(result.content);
    setIsDrafting(false);
  };

  return (
    <div className="p-8 h-screen overflow-y-auto bg-gray-50 w-full">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage station letters and system broadcasts.</p>
          </div>
          <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('compose')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'compose' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Compose Broadcast
            </button>
          </div>
        </header>

        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Bell size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{totalMessages}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Read Rate</p>
                <p className="text-2xl font-bold text-gray-900">{readRate}%</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
              </div>
            </div>
             {/* Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm col-span-1 md:col-span-2 lg:col-span-1 h-40 flex flex-col justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis dataKey="name" hide />
                        <Tooltip />
                        <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#4f46e5', '#8b5cf6', '#ec4899'][index % 3]} />
                            ))}
                        </Bar>
                    </BarChart>
                 </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Compose Form */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                     <Send size={20} className="text-indigo-600" /> New Broadcast
                  </h2>
               </div>
               
               <form onSubmit={handleSend} className="p-6 space-y-6">
                  {notification && (
                      <div className={`p-4 rounded-lg flex items-center gap-2 text-sm font-medium ${notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          {notification.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
                          {notification.msg}
                      </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Target Audience</label>
                          <select 
                            value={targetGroup} 
                            onChange={(e) => setTargetGroup(e.target.value as any)}
                            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                          >
                            <option value="ALL">All Users (Broadcast)</option>
                            <option value="user-1">Specific User (Alice - Demo)</option>
                          </select>
                      </div>
                      <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Priority Level</label>
                          <div className="flex gap-2">
                             {Object.values(Priority).map(p => (
                                 <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPriority(p)}
                                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg border transition-all ${
                                        priority === p 
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                                 >
                                    {p}
                                 </button>
                             ))}
                          </div>
                      </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-700">Subject</label>
                     <input 
                        type="text" 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Enter message subject"
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-700">Message Content</label>
                     <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={8}
                        placeholder="Type your message here..."
                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                     ></textarea>
                  </div>

                  <div className="flex justify-end pt-2">
                      <button 
                        type="submit" 
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                      >
                         <Send size={18} /> Send Message
                      </button>
                  </div>
               </form>
            </div>

            {/* AI Assistant Panel */}
            <div className="bg-gradient-to-b from-indigo-50 to-white rounded-xl shadow-sm border border-indigo-100 p-6 h-fit">
               <div className="flex items-center gap-2 mb-4 text-indigo-900">
                  <Sparkles className="text-indigo-600" />
                  <h3 className="font-bold">AI Writing Assistant</h3>
               </div>
               <p className="text-sm text-gray-600 mb-4">
                  Struggling to find the right words? Let Gemini draft the announcement for you.
               </p>
               
               <div className="space-y-4">
                  <textarea
                     value={aiPrompt}
                     onChange={(e) => setAiPrompt(e.target.value)}
                     placeholder="e.g., Scheduled maintenance next Sunday at 2am for database upgrades..."
                     className="w-full p-3 bg-white border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none placeholder:text-gray-400"
                  ></textarea>
                  
                  <button 
                     onClick={handleAIDraft}
                     disabled={isDrafting || !aiPrompt}
                     className="w-full py-2.5 bg-white border border-indigo-200 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                     {isDrafting ? (
                         <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                     ) : (
                         <>Generate Draft <Sparkles size={16}/></>
                     )}
                  </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;