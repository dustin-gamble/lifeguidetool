
import React from 'react';

interface GaugeProps {
  value: number;
  max?: number;
  label: string;
  unit: string;
  colorStops?: { stop: number; color: string }[];
}

const Gauge: React.FC<GaugeProps> = ({ value, max = 100, label, unit, colorStops = [] }) => {
  const clampedValue = Math.max(0, Math.min(value, max));
  const percentage = max > 0 ? clampedValue / max : 0;
  const angle = -90 + percentage * 180;
  const radius = 50;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage);

  const getColor = () => {
    if (colorStops.length === 0) return 'text-sky-400';
    const sortedStops = [...colorStops].sort((a, b) => a.stop - b.stop);
    for (const stop of sortedStops) {
      if (clampedValue <= stop.stop) {
        return stop.color;
      }
    }
    return sortedStops[sortedStops.length - 1]?.color || 'text-sky-400';
  };

  const colorClass = getColor();

  return (
    <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center text-center shadow-inner">
      <svg viewBox="0 0 120 70" className="w-full h-auto -mb-2">
        {/* Background Arc */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          strokeWidth="12"
          className="stroke-slate-600"
          strokeLinecap="round"
        />
        {/* Value Arc */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          strokeWidth="12"
          className={`stroke-current ${colorClass} transition-all duration-500 ease-out`}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="relative -top-4">
        <span className={`text-3xl font-bold ${colorClass}`}>
          {value.toFixed(value % 1 !== 0 ? 1 : 0)}
        </span>
        <span className="text-lg text-slate-400 ml-1">{unit}</span>
      </div>
      <p className="text-sm font-semibold text-slate-300 -mt-2">{label}</p>
    </div>
  );
};

export default Gauge;
