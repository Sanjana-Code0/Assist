
import React from 'react';

export const SidebarHeader: React.FC = () => {
  return (
    <div className="p-6 border-b bg-indigo-600 text-white flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <span className="text-xl">🌙</span>
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none">ShadowLight</h1>
          <p className="text-[10px] text-indigo-200 mt-1 uppercase tracking-widest font-semibold">AI Assistant</p>
        </div>
      </div>
      <button className="p-1 hover:bg-white/10 rounded-full transition">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};
