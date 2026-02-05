import React from 'react';

export enum MessageType {
  SYSTEM = 'SYSTEM',
  PERSONAL = 'PERSONAL',
  BROADCAST = 'BROADCAST'
}

export enum Priority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH'
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
  avatar: string;
  email: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string; // 'ALL' for broadcast
  subject: string;
  content: string;
  type: MessageType;
  priority: Priority;
  isRead: boolean;
  createdAt: string; // ISO Date string
  tags?: string[];
}

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}