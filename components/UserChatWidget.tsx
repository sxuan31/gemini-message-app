import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Paperclip, ImageIcon, Minimize2 } from 'lucide-react';
import { useData } from '../context/DataContext';

const UserChatWidget: React.FC = () => {
  const { currentUser, chatSessions, chatMessages, sendChatMessage, createChatSession, getUserUnreadChatCount, markSessionRead } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false); // Simulated Admin Typing
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSession = chatSessions.find(s => s.userId === currentUser.id);
  const messages = currentSession 
    ? chatMessages.filter(m => m.sessionId === currentSession.id) 
    : [];

  const unreadCount = getUserUnreadChatCount(currentUser.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
        scrollToBottom();
        // Clear unread when opening
        if(currentSession && unreadCount > 0) {
             const userMsgs = chatMessages.filter(m => m.sessionId === currentSession.id && m.senderId !== currentUser.id);
             userMsgs.forEach(m => (m.isRead = true)); // Direct mutation for demo, ideally via context method
        }
    }
  }, [messages, isOpen, currentSession]);

  // Simulate Admin Typing when user sends message
  useEffect(() => {
      if (messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          if (lastMsg.senderId === currentUser.id && currentSession?.status === 'active') {
              setIsTyping(true);
              const timer = setTimeout(() => setIsTyping(false), 2000); // Stop typing after 2s (simulated)
              return () => clearTimeout(timer);
          }
      }
  }, [messages.length]);

  // Don't show for admins
  if (currentUser.role === 'admin') return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    let sessionId = currentSession?.id;
    if (!sessionId) {
      sessionId = createChatSession(currentUser.id);
    }

    sendChatMessage(sessionId, currentUser.id, inputValue);
    setInputValue('');
  };

  const handleSendAttachment = () => {
      let sessionId = currentSession?.id;
      if (!sessionId) {
        sessionId = createChatSession(currentUser.id);
      }
      // Simulate image upload
      sendChatMessage(sessionId, currentUser.id, "", "image", "https://picsum.photos/300/200");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-fade-in origin-bottom-right h-[550px]">
          {/* Header */}
          <div className="bg-indigo-600 p-4 flex justify-between items-center text-white shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <User size={20} />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-indigo-600 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-base">Support Team</h3>
                <p className="text-xs text-indigo-100 opacity-90">Usually replies in minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                <Minimize2 size={18} />
                </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                    <MessageSquare size={32} className="text-gray-400"/>
                </div>
                <p>Hello! How can we help you today?</p>
              </div>
            )}
            
            {messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              const isSystem = msg.type === 'system';
              
              if (isSystem) {
                  return (
                      <div key={msg.id} className="flex justify-center my-4">
                          <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">{msg.content}</span>
                      </div>
                  )
              }

              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {msg.type === 'image' ? (
                          <div className={`p-1 rounded-xl border ${isMe ? 'bg-indigo-100 border-indigo-200' : 'bg-white border-gray-200'}`}>
                              <img src={msg.attachmentUrl} alt="Attachment" className="rounded-lg max-w-full h-auto" />
                          </div>
                      ) : (
                        <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                            isMe 
                            ? 'bg-indigo-600 text-white rounded-br-none' 
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                        }`}>
                            {msg.content}
                        </div>
                      )}
                      <span className="text-[10px] text-gray-400 mt-1 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                  </div>
                </div>
              );
            })}
            
            {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {currentSession?.status === 'closed' ? (
              <div className="p-4 bg-gray-100 text-center border-t border-gray-200">
                  <p className="text-sm text-gray-500 font-medium">This conversation has ended.</p>
                  <button 
                    onClick={() => sendChatMessage(currentSession.id, currentUser.id, "Re-opening chat")}
                    className="mt-2 text-xs text-indigo-600 font-bold hover:underline"
                  >
                      Start New Message
                  </button>
              </div>
          ) : (
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-2 py-1 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                    <button 
                        type="button" 
                        onClick={handleSendAttachment}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-gray-200"
                        title="Attach File"
                    >
                        <Paperclip size={18} />
                    </button>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 text-gray-700 placeholder-gray-400"
                    />
                    <button 
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </form>
          )}
        </div>
      )}

      {/* Floating Button */}
      <div className="relative">
        <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 ${
            isOpen ? 'bg-gray-700 text-white rotate-90' : 'bg-indigo-600 text-white'
            }`}
        >
            {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
        {!isOpen && unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                {unreadCount}
            </div>
        )}
      </div>
    </div>
  );
};

export default UserChatWidget;