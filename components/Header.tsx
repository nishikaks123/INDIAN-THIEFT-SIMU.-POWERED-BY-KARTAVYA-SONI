
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/50 backdrop-blur-md border-b border-blue-500/20 shadow-lg sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-white tracking-wider">
          GDD<span className="text-blue-400">.ai</span>
        </h1>
        <p className="text-sm text-gray-400">Your AI-Powered Game Design Partner</p>
      </div>
    </header>
  );
};
