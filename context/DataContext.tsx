import React, { createContext, useContext, useState, useEffect } from 'react';
import { Message, User, MessageType, Priority, Template } from '../types';

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

interface DataContextType {
  currentUser: User;
  users: User[];
  messages: Message[];
  templates: Template[];
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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[1]); // Default to Alice (User)
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);

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

  return (
    <DataContext.Provider value={{
      currentUser,
      users,
      messages,
      templates,
      switchUser,
      sendMessage,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      toggleStar,
      deleteMessage,
      getUnreadCount,
      addTemplate,
      deleteTemplate
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