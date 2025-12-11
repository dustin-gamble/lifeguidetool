
import React from 'react';
import { SettingsIcon } from './Icons.tsx';

interface InputSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onSettingsClick?: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({ title, icon, children, onSettingsClick }) => {
  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
        <h3 className="text-lg font-semibold text-sky-400 flex items-center gap-2">
          {icon}
          {title}
        </h3>
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="text-slate-400 hover:text-sky-400 transition-colors duration-200 p-1 rounded-full"
            aria-label={`Settings for ${title}`}
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default InputSection;
