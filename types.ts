
export interface BookItem {
  id: string;
  title: string;
  publisher: string; // The normalized publisher name
  originalPublisherString: string; // What was actually on the list
  grade: string;
  quantity: number;
  subject: string;
  schoolId: string;
  createdAt?: Date; // Optional in type, but we will ensure it's handled as string/date in logic
}

export interface School {
  id: string;
  name: string;
  contact?: string;
}

export interface ProcessingStatus {
  isProcessing: boolean;
  message: string;
  progress: number;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export enum ViewMode {
  SETUP = 'SETUP',
  CONFIG = 'CONFIG',
  DASHBOARD = 'DASHBOARD',
  SCHOOLS = 'SCHOOLS',
  UPLOAD = 'UPLOAD',
  INVENTORY = 'INVENTORY',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE'
}

export interface AnalysisResult {
  schoolName: string;
  items: Array<{
    title: string;
    publisher: string;
    grade: string;
    quantity: number;
    subject: string;
  }>;
}

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}
