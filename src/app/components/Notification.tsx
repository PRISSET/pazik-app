import React from 'react';

// Общий компонент для отображения всплывающего уведомления
function Notification({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div 
        className={`relative max-w-md w-full p-5 rounded-lg shadow-2xl border transition-all duration-300 animate-fadeIn ${
          type === 'success' 
            ? 'bg-black/80 border-green-500 shadow-[0_0_15px_rgba(0,255,128,0.5)]' 
            : 'bg-black/80 border-red-500 shadow-[0_0_15px_rgba(255,0,76,0.5)]'
        }`}
      >
        <div className="flex items-center">
          <div className="mr-4">
            {type === 'success' ? (
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            ) : (
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
          </div>
          <div className="flex-1 text-white text-lg">{message}</div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Закрыть"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Notification; 