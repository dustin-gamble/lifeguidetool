
import React from 'react';

interface SliderFieldProps {
  label: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

const SliderField: React.FC<SliderFieldProps> = ({ label, name, value, onChange, min, max, step, unit }) => {
  
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Create a synthetic event to match the structure onChange expects
    const { name, value } = e.target;
    const syntheticEvent = {
      target: { name, value, type: 'number' },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  return (
    <div>
      <label htmlFor={`${name}-slider`} className="block text-sm font-medium text-slate-400 mb-1">
        {label} {unit && `(${unit})`}
      </label>
      <div className="flex items-center gap-3">
        <input
          id={`${name}-slider`}
          name={name}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-sky-500"
        />
        <input
          id={`${name}-number`}
          name={name}
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={handleNumberInputChange}
          // Hide spinner buttons for a cleaner look
          className="w-24 bg-slate-700 border border-slate-600 text-white rounded-md px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
    </div>
  );
};

export default SliderField;
