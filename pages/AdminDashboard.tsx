import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { MessageType, Priority, Template } from '../types';
import { draftAnnouncement } from '../services/geminiService';
import { 
  Users, Send, Bell, CheckCircle2, AlertCircle, 
  History, FileText, Trash2, Copy, Clock, CalendarDays,
  Sparkles, Eye, Undo2
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type AdminTab = 'overview' | 'compose' | 'history' | 'templates';

const AdminDashboard: React.FC = () => {
  const { messages, users, sendMessage, deleteMessage, templates, addTemplate, deleteTemplate, currentUser } = useData();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Compose State
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.NORMAL);
  const [targetGroup, setTargetGroup] = useState<string>('ALL');
  const [scheduledTime, setScheduledTime] = useState('');
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  
  // UI State
  const [notification, setNotification] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  // Derived Data
  const totalMessages = messages.length;
  const broadcastCount = messages.filter(m => m.type === MessageType.BROADCAST).length;
  const activeUsers = users.length;
  const readRate = Math.round((messages.filter(m => m.isRead).length / (totalMessages || 1)) * 100) || 0;
  
  const mySentMessages = messages.filter(m => m.senderId === currentUser.id);

  const chartData = [
    { name: 'Total', value: totalMessages },
    { name: 'Broadcasts', value: broadcastCount },
    { name: 'System', value: messages.filter(m => m.type === MessageType.SYSTEM).length },
  ];

  // Logic
  const showNotification = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if(!subject || !content) {
        showNotification('error', 'Please fill in subject and content.');
        return;
    }

    const type = targetGroup === 'ALL' ? MessageType.BROADCAST : MessageType.PERSONAL; // Simplified for demo
    
    sendMessage({
        senderId: currentUser.id,
        receiverId: targetGroup,
        subject,
        content,
        type,
        priority,
        tags: ['Announcement'],
        scheduledFor: scheduledTime || undefined
    });

    showNotification('success', scheduledTime ? 'Message scheduled successfully!' : 'Message sent successfully!');
    resetForm();
  };

  const handleSaveTemplate = () => {
    if(!subject || !content) {
      showNotification('error', 'Fill content to save as template');
      return;
    }
    addTemplate({
      name: subject,
      subject,
      content,
      priority
    });
    showNotification('success', 'Template saved!');
  };

  const handleUseTemplate = (tpl: Template) => {
    setSubject(tpl.subject);
    setContent(tpl.content);
    setPriority(tpl.priority);
    setActiveTab('compose');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setSubject('');
    setContent('');
    setAiPrompt('');
    setScheduledTime('');
    setTargetGroup('ALL');
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
      <div className="max-w-6xl mx-auto pb-12">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Console</h1>
            <p className="text-gray-500 mt-1">Messaging Center & Analytics</p>
          </div>
          <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart size={16}/> },
              { id: 'compose', label: 'Compose', icon: <Send size={16}/> },
              { id: 'history', label: 'History', icon: <History size={16}/> },
              { id: 'templates', label: 'Templates', icon: <FileText size={16}/> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {notification && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in ${
            notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
          }`}>
             {notification.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
             <span className="font-medium">{notification.msg}</span>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Bell size={24} /></div>
                   <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                </div>
                <p className="text-sm text-gray-500 font-medium">Total Messages</p>
                <p className="text-3xl font-bold text-gray-900">{totalMessages}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><Eye size={24} /></div>
                </div>
                <p className="text-sm text-gray-500 font-medium">Global Read Rate</p>
                <p className="text-3xl font-bold text-gray-900">{readRate}%</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Users size={24} /></div>
                </div>
                <p className="text-sm text-gray-500 font-medium">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">{activeUsers}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><FileText size={24} /></div>
                </div>
                <p className="text-sm text-gray-500 font-medium">Templates</p>
                <p className="text-3xl font-bold text-gray-900">{templates.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
                 <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
                 <div className="space-y-4">
                    {mySentMessages.slice(0, 4).map(msg => (
                      <div key={msg.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                         <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${msg.type === MessageType.BROADCAST ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                            <div>
                               <p className="text-sm font-semibold text-gray-900">{msg.subject}</p>
                               <p className="text-xs text-gray-500">To: {msg.receiverId === 'ALL' ? 'Everyone' : msg.receiverId} • {new Date(msg.createdAt).toLocaleDateString()}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="text-right">
                               <p className="text-xs font-medium text-gray-500">Status</p>
                               <p className="text-xs font-bold text-green-600">Delivered</p>
                            </div>
                         </div>
                      </div>
                    ))}
                    {mySentMessages.length === 0 && <p className="text-gray-400 text-center py-4">No recent activity.</p>}
                 </div>
               </div>
               
               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
                 <h3 className="text-lg font-bold text-gray-800 mb-6 self-start">Message Types</h3>
                 <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" tick={{fontSize: 12}} />
                            <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#4f46e5', '#f97316', '#10b981'][index % 3]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* COMPOSE TAB */}
        {activeTab === 'compose' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
             <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                   <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Send size={20} className="text-indigo-600" /> New Broadcast
                   </h2>
                   <div className="flex gap-2">
                      <button 
                         type="button" 
                         onClick={handleSaveTemplate}
                         className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-gray-200"
                      >
                         <Copy size={16} /> Save as Template
                      </button>
                   </div>
                </div>
                
                <form onSubmit={handleSend} className="p-6 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                           <label className="text-sm font-medium text-gray-700">Target Audience</label>
                           <select 
                             value={targetGroup} 
                             onChange={(e) => setTargetGroup(e.target.value)}
                             className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                           >
                             <option value="ALL">All Users (Broadcast)</option>
                             <optgroup label="Departments">
                               <option value="Engineering">Engineering Team</option>
                               <option value="Marketing">Marketing Team</option>
                             </optgroup>
                             <optgroup label="Specific Users">
                               {users.filter(u => u.role !== 'admin').map(u => (
                                 <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                               ))}
                             </optgroup>
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
                                         ? 'bg-indigo-600 text-white border-indigo-600' 
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
                         placeholder="e.g. System Maintenance Notification"
                         className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                      />
                   </div>
 
                   <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Message Content</label>
                      <textarea 
                         value={content}
                         onChange={(e) => setContent(e.target.value)}
                         rows={8}
                         placeholder="Type your message using Markdown..."
                         className="w-full p-4 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-sm"
                      ></textarea>
                   </div>

                   <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                       <div className="flex-1">
                          <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-indigo-600 transition-colors">
                             <CalendarDays size={18} />
                             <input 
                                type="datetime-local" 
                                className="bg-transparent border-none focus:ring-0 text-sm p-0 text-gray-700"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                             />
                          </label>
                       </div>
                       <div className="flex gap-3">
                          <button 
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            Clear
                          </button>
                          <button 
                            type="submit" 
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                          >
                             <Send size={18} /> 
                             {scheduledTime ? 'Schedule Send' : 'Send Now'}
                          </button>
                       </div>
                   </div>
                </form>
             </div>
 
             {/* AI Assistant */}
             <div className="bg-gradient-to-b from-indigo-50 to-white rounded-xl shadow-sm border border-indigo-100 p-6 h-fit">
                <div className="flex items-center gap-2 mb-4 text-indigo-900">
                   <Sparkles className="text-indigo-600" />
                   <h3 className="font-bold">AI Writer</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                   Describe what you want to say, and I'll draft a formal announcement for you.
                </p>
                <div className="space-y-4">
                   <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g., Scheduled maintenance next Sunday at 2am for database upgrades..."
                      className="w-full p-3 bg-white border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
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

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                 <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <History size={20} className="text-gray-500" /> Message Log
                 </h2>
                 <span className="text-sm text-gray-500">{mySentMessages.length} messages sent</span>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                          <th className="px-6 py-4">Subject</th>
                          <th className="px-6 py-4">Recipient</th>
                          <th className="px-6 py-4">Sent Date</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {mySentMessages.length === 0 ? (
                          <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No sent messages found</td></tr>
                       ) : (
                          mySentMessages.map(msg => (
                             <tr key={msg.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                   <div className="font-medium text-gray-900 truncate max-w-xs">{msg.subject}</div>
                                   <div className="text-xs text-gray-500 mt-1 flex gap-2">
                                      <span className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{msg.type}</span>
                                      {msg.priority === Priority.HIGH && <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100">High</span>}
                                   </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                   {msg.receiverId === 'ALL' ? 'Everyone' : msg.receiverId}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                   {new Date(msg.createdAt).toLocaleString()}
                                   {msg.scheduledFor && <div className="text-xs text-indigo-600 font-medium flex items-center gap-1 mt-1"><Clock size={12}/> Scheduled</div>}
                                </td>
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-2">
                                      <div className="w-full bg-gray-200 rounded-full h-1.5 w-24">
                                         <div className="bg-green-500 h-1.5 rounded-full" style={{width: `${Math.random() * 100}%`}}></div>
                                      </div>
                                      <span className="text-xs text-gray-500">Sent</span>
                                   </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <button 
                                      onClick={() => {
                                         if(confirm('Recall this message? It will be removed from all inboxes.')) {
                                            deleteMessage(msg.id);
                                            showNotification('success', 'Message recalled successfully');
                                         }
                                      }}
                                      className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 ml-auto text-sm"
                                   >
                                      <Undo2 size={16} /> Recall
                                   </button>
                                </td>
                             </tr>
                          ))
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && (
           <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-gray-800">Saved Templates</h2>
                 <button onClick={() => setActiveTab('compose')} className="text-sm text-indigo-600 font-medium hover:underline">+ Create New via Compose</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {templates.map(tpl => (
                    <div key={tpl.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                       <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-gray-900">{tpl.name}</h3>
                          {tpl.priority === Priority.HIGH && <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">High Priority</span>}
                       </div>
                       <p className="text-sm text-gray-500 font-medium mb-1">Subject: {tpl.subject}</p>
                       <p className="text-sm text-gray-400 line-clamp-3 mb-6 bg-gray-50 p-3 rounded-lg flex-1 italic border border-gray-100">
                          "{tpl.content}"
                       </p>
                       <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-auto">
                          <button 
                             onClick={() => handleUseTemplate(tpl)}
                             className="flex-1 bg-indigo-50 text-indigo-700 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                          >
                             Use Template
                          </button>
                          <button 
                             onClick={() => deleteTemplate(tpl.id)}
                             className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </div>
                 ))}
                 
                 {/* Empty State Card */}
                 <div 
                    onClick={() => setActiveTab('compose')}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-indigo-300 hover:text-indigo-500 transition-all min-h-[250px]"
                 >
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                       <FileText size={24} />
                    </div>
                    <p className="font-medium">Create New Template</p>
                    <p className="text-xs mt-1 opacity-70">Go to Compose &gt; Save as Template</p>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;