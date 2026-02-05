import React, { createContext, useContext, useState, useEffect } from 'react';
import { Message, User, MessageType, Priority } from '../types';

// Mock Data
const MOCK_USERS: User[] = [
  { id: 'admin-1', name: 'System Admin', role: 'admin', avatar: 'https://picsum.photos/id/1/200/200', email: 'admin@nexus.com' },
  { id: 'user-1', name: 'Alice Chen', role: 'user', avatar: 'https://picsum.photos/id/64/200/200', email: 'alice@nexus.com' },
  { id: 'user-2', name: 'Bob Smith', role: 'user', avatar: 'https://picsum.photos/id/91/200/200', email: 'bob@nexus.com' },
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
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    tags: ['System']
  }
];

interface DataContextType {
  currentUser: User;
  users: User[];
  messages: Message[];
  switchUser: (role: 'admin' | 'user') => void;
  sendMessage: (msg: Omit<Message, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  deleteMessage: (id: string) => void;
  getUnreadCount: () => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[1]); // Default to Alice (User)
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);

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
    };
    setMessages(prev => [newMessage, ...prev]);
  };

  const markAsRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
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
      switchUser,
      sendMessage,
      markAsRead,
      deleteMessage,
      getUnreadCount
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