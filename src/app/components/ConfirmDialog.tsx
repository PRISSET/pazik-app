import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type = 'danger'
}) => {
  if (!isOpen) return null;
  
  const getBorderColor = () => {
    switch (type) {
      case 'danger':
        return 'border-red-500 shadow-[0_0_15px_rgba(255,0,76,0.5)]';
      case 'warning':
        return 'border-yellow-500 shadow-[0_0_15px_rgba(255,204,0,0.5)]';
      case 'info':
        return 'border-blue-500 shadow-[0_0_15px_rgba(0,195,255,0.5)]';
      default:
        return 'border-red-500 shadow-[0_0_15px_rgba(255,0,76,0.5)]';
    }
  };
  
  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-700 hover:bg-red-800';
      case 'warning':
        return 'bg-yellow-700 hover:bg-yellow-800';
      case 'info':
        return 'bg-blue-700 hover:bg-blue-800';
      default:
        return 'bg-red-700 hover:bg-red-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel}></div>
      <div className={`relative max-w-md w-full p-6 rounded-lg bg-black/80 border ${getBorderColor()} animate-fadeIn`}>
        <div className="flex flex-col items-center mb-4">
          {getIcon()}
          <h3 className="mt-4 text-xl font-bold text-white neon-text">{title}</h3>
        </div>
        
        <div className="my-4 text-gray-300 text-center">
          {message}
        </div>
        
        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={onCancel}
            className="btn px-5 py-2"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`btn-primary ${getConfirmButtonStyle()} px-5 py-2`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 