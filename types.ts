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
  department?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string; // 'ALL' for broadcast, or specific ID, or Group Name
  subject: string;
  content: string;
  type: MessageType;
  priority: Priority;
  isRead: boolean;
  isStarred?: boolean; // New: For favorite messages
  createdAt: string; // ISO Date string
  tags?: string[];
  scheduledFor?: string; // For scheduled messages
}

export interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  priority: Priority;
}

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}