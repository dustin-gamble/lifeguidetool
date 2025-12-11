
import React from 'react';

interface ResultCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ icon, label, value }) => {
  return (
    <div className="bg-slate-700/50 p-3 rounded-lg flex items-center gap-3 shadow-inner">
      <div className="flex-shrink-0 text-sky-400">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-base font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

export default ResultCard;
