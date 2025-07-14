import React from 'react';
import { Loader } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-black text-white">
      {/* Você pode substituir este SVG pelo seu logo, se preferir */}
      <svg
        className="w-24 h-24 mb-6 text-emerald-500"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L12 22M2 12L22 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-50"
        />
        <path
          d="M7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12C17 13.8565 15.9221 15.4367 14.4892 16.3251"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 17C10.3431 17 9 15.6569 9 14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="animate-pulse"
        />
      </svg>
      
      <div className="flex items-center gap-3">
        <Loader className="animate-spin h-5 w-5" />
        <p className="text-lg font-semibold text-neutral-300">Carregando...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
