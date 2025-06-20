import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    
    // Auto-close timer
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(closeTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const baseClasses = `
    fixed top-4 right-4 z-100 max-w-sm w-full bg-white rounded-lg shadow-lg border
    transform transition-all duration-300 ease-in-out
    ${isVisible && !isLeaving 
      ? 'translate-x-0 opacity-100 scale-100' 
      : 'translate-x-full opacity-0 scale-95'
    }
  `;

  const typeClasses = {
    success: 'border-success-green',
    error: 'border-red-500',
  };

  const iconClasses = {
    success: 'text-success-green',
    error: 'text-red-500',
  };

  const Icon = type === 'success' ? CheckCircle : XCircle;

  return (
    <div className={`${baseClasses} ${typeClasses[type]} pointer-events-auto`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${iconClasses[type]}`} />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            {message && (
              <p className="mt-1 text-sm text-gray-500">{message}</p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast Container Component
export interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-0 right-0 z-[100] p-4 space-y-4 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const showToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id, onClose: removeToast }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  };

  const showError = (title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  };

  return {
    toasts,
    showSuccess,
    showError,
    removeToast,
  };
}; 