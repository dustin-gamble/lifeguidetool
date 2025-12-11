
import React from 'react';
import { PlaneIcon } from './Icons.tsx';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between pb-4 border-b border-slate-700">
      <div className="flex items-center gap-4">
        <div className="bg-sky-500 p-3 rounded-lg">
          <PlaneIcon className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">AeroCalc AI</h1>
          <p className="text-sm sm:text-base text-slate-400">e-Flight Performance Calculator</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
