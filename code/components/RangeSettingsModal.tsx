
import React, { useState, useEffect } from 'react';
import { InputRanges } from '../types.ts';

interface RangeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newRanges: Partial<InputRanges>) => void;
  targets: string[];
  currentRanges: InputRanges;
}

const RangeSettingsModal: React.FC<RangeSettingsModalProps> = ({ isOpen, onClose, onSave, targets, currentRanges }) => {
  const [localRanges, setLocalRanges] = useState<InputRanges>({});

  useEffect(() => {
    if (isOpen) {
      const relevantRanges = targets.reduce((acc, key) => {
        if (currentRanges[key]) {
          acc[key] = currentRanges[key];
        }
        return acc;
      }, {} as InputRanges);
      setLocalRanges(relevantRanges);
    }
  }, [isOpen, targets, currentRanges]);

  if (!isOpen) return null;

  const handleInputChange = (key: string, field: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setLocalRanges(prev => ({
        ...prev,
        [key]: { ...prev[key], [field]: numValue },
      }));
    }
  };

  const handleSave = () => {
    onSave(localRanges);
    onClose();
  };
  
  const toTitleCase = (str: string) => {
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Adjust Slider Ranges</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          {targets.map(key => localRanges[key] && (
            <div key={key}>
              <h3 className="font-medium text-slate-300 mb-2">{toTitleCase(key)}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`${key}-min`} className="block text-sm text-slate-400 mb-1">Min</label>
                  <input
                    type="number"
                    id={`${key}-min`}
                    value={localRanges[key]?.min ?? ''}
                    onChange={(e) => handleInputChange(key, 'min', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label htmlFor={`${key}-max`} className="block text-sm text-slate-400 mb-1">Max</label>
                  <input
                    type="number"
                    id={`${key}-max`}
                    value={localRanges[key]?.max ?? ''}
                    onChange={(e) => handleInputChange(key, 'max', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-700 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-md transition">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-md transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default RangeSettingsModal;
