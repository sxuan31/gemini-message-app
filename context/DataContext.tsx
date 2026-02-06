import React, { createContext, useContext, useState, useEffect } from 'react';
import { Message, User, MessageType, Priority, Template, ChatSession, ChatMessage } from '../types';

// Mock Data
const MOCK_USERS: User[] = [
  { id: 'admin-1', name: 'System Admin', role: 'admin', avatar: 'https://picsum.photos/id/1/200/200', email: 'admin@nexus.com' },
  { id: 'user-1', name: 'Alice Chen', role: 'user', avatar: 'https://picsum.photos/id/64/200/200', email: 'alice@nexus.com', department: 'Engineering' },
  { id: 'user-2', name: 'Bob Smith', role: 'user', avatar: 'https://picsum.photos/id/91/200/200', email: 'bob@nexus.com', department: 'Marketing' },
  { id: 'user-3', name: 'Charlie Kim', role: 'user', avatar: 'https://picsum.photos/id/12/200/200', email: 'charlie@nexus.com', department: 'Engineering' },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    senderId: 'admin-1',
    receiverId: 'user-1',
    subject: 'Welcome to NexusMail',
    content: 'Hi Alice,\n\nWelcome to the new internal messaging system. Please update your profile settings when you have a moment.\n\nBest,\nAdmin',
    type: MessageType.SYSTEM,
    priority: Priority.NORMAL,
    isRead: false,
    isStarred: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    tags: ['Onboarding']
  },
  {
    id: 'msg-2',
    senderId: 'admin-1',
    receiverId: 'ALL',
    subject: 'Maintenance Scheduled',
    content: '**Attention All Users**,\n\nServer maintenance is scheduled for this Saturday at 2:00 AM UTC. Expect downtime of approximately 30 minutes.\n\nThank you for your patience.',
    type: MessageType.BROADCAST,
    priority: Priority.HIGH,
    isRead: true,
    isStarred: false,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    tags: ['System']
  },
  {
    id: 'msg-3',
    senderId: 'admin-1',
    receiverId: 'user-1',
    subject: 'Project Update Required',
    content: 'Please submit your weekly project status report by end of day Friday.',
    type: MessageType.PERSONAL,
    priority: Priority.NORMAL,
    isRead: false,
    isStarred: false,
    createdAt: new Date().toISOString(),
    tags: ['Work']
  }
];

const INITIAL_TEMPLATES: Template[] = [
  {
    id: 'tpl-1',
    name: 'Server Maintenance',
    subject: 'Scheduled System Maintenance',
    content: 'We will be performing scheduled maintenance on [Date] at [Time]. During this period, the service may be unavailable for approximately [Duration].',
    priority: Priority.HIGH
  },
  {
    id: 'tpl-2',
    name: 'Weekly Newsletter',
    subject: 'Weekly Company Updates',
    content: 'Here are the highlights for this week:\n\n1. Project A Updates\n2. New Team Members\n3. Upcoming Events\n\nHave a great weekend!',
    priority: Priority.NORMAL
  }
];

// Mock Chat Data
const INITIAL_SESSIONS: ChatSession[] = [
  {
    id: 'session-1',
    userId: 'user-1',
    lastMessage: 'I have a question about the VPN.',
    lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 1,
    status: 'active'
  }
];

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'cm-1',
    sessionId: 'session-1',
    senderId: 'user-1',
    content: 'Hi, I have a question about the VPN.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isRead: false
  }
];

interface DataContextType {
  currentUser: User;
  users: User[];
  messages: Message[];
  templates: Template[];
  chatSessions: ChatSession[];
  chatMessages: ChatMessage[];
  switchUser: (role: 'admin' | 'user') => void;
  sendMessage: (msg: Omit<Message, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  markAllAsRead: () => void;
  toggleStar: (id: string) => void;
  deleteMessage: (id: string) => void;
  getUnreadCount: () => number;
  addTemplate: (tpl: Omit<Template, 'id'>) => void;
  deleteTemplate: (id: string) => void;
  // Chat Methods
  sendChatMessage: (sessionId: string, senderId: string, content: string) => void;
  createChatSession: (userId: string) => string; // returns sessionId
  markSessionRead: (sessionId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[1]); // Default to Alice (User)
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  
  // Chat State
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(INITIAL_SESSIONS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);

  const switchUser = (role: 'admin' | 'user') => {
    const user = users.find(u => u.role === role);
    if (user) setCurrentUser(user);
  };

  const sendMessage = (msg: Omit<Message, 'id' | 'createdAt' | 'isRead'>) => {
    const newMessage: Message = {
      ...msg,
      id: `msg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
      isStarred: false,
    };
    setMessages(prev => [newMessage, ...prev]);
  };

  const markAsRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
  };

  const markAsUnread = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: false } : m));
  };

  const markAllAsRead = () => {
     setMessages(prev => prev.map(m => 
       (m.receiverId === currentUser.id || m.receiverId === 'ALL') ? { ...m, isRead: true } : m
     ));
  };

  const toggleStar = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isStarred: !m.isStarred } : m));
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const addTemplate = (tpl: Omit<Template, 'id'>) => {
    const newTemplate = { ...tpl, id: `tpl-${Date.now()}` };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const getUnreadCount = () => {
    return messages.filter(m => 
      (m.receiverId === currentUser.id || m.receiverId === 'ALL') && !m.isRead
    ).length;
  };

  // --- Chat Implementation ---

  const createChatSession = (userId: string): string => {
    const existing = chatSessions.find(s => s.userId === userId);
    if (existing) return existing.id;

    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      userId,
      lastMessage: 'Chat started',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      status: 'active'
    };
    setChatSessions(prev => [newSession, ...prev]);
    return newSession.id;
  };

  const sendChatMessage = (sessionId: string, senderId: string, content: string) => {
    const newMsg: ChatMessage = {
      id: `cm-${Date.now()}`,
      sessionId,
      senderId,
      content,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    setChatMessages(prev => [...prev, newMsg]);

    setChatSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        // If sender is NOT admin, increment unread count for admin
        // If sender IS admin, unread count is irrelevant here (or 0)
        const isUserSender = users.find(u => u.id === senderId)?.role === 'user';
        return {
          ...s,
          lastMessage: content,
          lastMessageTime: new Date().toISOString(),
          unreadCount: isUserSender ? s.unreadCount + 1 : s.unreadCount
        };
      }
      return s;
    }));
  };

  const markSessionRead = (sessionId: string) => {
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, unreadCount: 0 } : s
    ));
    setChatMessages(prev => prev.map(m => 
      m.sessionId === sessionId ? { ...m, isRead: true } : m
    ));
  };

  return (
    <DataContext.Provider value={{
      currentUser,
      users,
      messages,
      templates,
      chatSessions,
      chatMessages,
      switchUser,
      sendMessage,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      toggleStar,
      deleteMessage,
      getUnreadCount,
      addTemplate,
      deleteTemplate,
      sendChatMessage,
      createChatSession,
      markSessionRead
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};