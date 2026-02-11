
import React, { useEffect } from 'react';
import { Notification } from '../types';

interface ToastContainerProps {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {notifications.map((note) => (
        <Toast key={note.id} note={note} onDismiss={() => removeNotification(note.id)} />
      ))}
    </div>
  );
};

const Toast: React.FC<{ note: Notification; onDismiss: () => void }> = ({ note, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getStyles = () => {
    switch (note.type) {
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/10';
      case 'error':
        return 'bg-red-500/10 border-red-500/20 text-red-400 shadow-red-500/10';
      case 'info':
      default:
        return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 shadow-indigo-500/10';
    }
  };

  const getIcon = () => {
    switch (note.type) {
      case 'success': return 'fa-circle-check';
      case 'error': return 'fa-circle-exclamation';
      default: return 'fa-circle-info';
    }
  };

  return (
    <div className={`pointer-events-auto min-w-[300px] p-4 rounded-xl border backdrop-blur-md shadow-lg animate-slide-up flex items-center gap-3 ${getStyles()}`}>
      <i className={`fa-solid ${getIcon()} text-lg`}></i>
      <p className="text-sm font-semibold text-white">{note.message}</p>
      <button onClick={onDismiss} className="ml-auto text-white/50 hover:text-white transition-colors">
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
};

export default ToastContainer;
