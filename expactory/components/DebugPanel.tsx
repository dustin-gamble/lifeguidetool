
import React, { useState } from 'react';

interface DebugPanelProps {
    timeScale: number;
    autoMode: boolean;
    onTimeScaleChange: (scale: number) => void;
    onAutoModeToggle: () => void;
    onPopulateIslands: () => void;
    onPopulateFull: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ timeScale, autoMode, onTimeScaleChange, onAutoModeToggle, onPopulateIslands, onPopulateFull }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`absolute top-0 right-0 h-full bg-gray-800 bg-opacity-80 text-white p-4 shadow-lg w-72 backdrop-filter backdrop-blur-md transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <button onClick={() => setIsOpen(!isOpen)} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-gray-700 text-white p-2 rounded-l-lg font-mono">
                {isOpen ? '>' : '<'}
            </button>
            <h2 className="text-xl font-bold mb-4 font-fredoka">Debug Menu</h2>
            
            <div className="space-y-4">
                <div>
                    <label htmlFor="time-slider" className="font-bold">Time Speed: <span>{timeScale.toFixed(1)}x</span></label>
                    <input
                        type="range"
                        id="time-slider"
                        min="1"
                        max="20"
                        value={timeScale}
                        step="1"
                        onChange={(e) => onTimeScaleChange(parseFloat(e.target.value))}
                        className="w-full"
                    />
                </div>

                <div className="flex items-center justify-between bg-gray-700 p-2 rounded">
                    <label htmlFor="auto-mode-toggle" className="font-bold">Auto Mode</label>
                    <input
                        type="checkbox"
                        id="auto-mode-toggle"
                        checked={autoMode}
                        onChange={onAutoModeToggle}
                        className="form-checkbox h-5 w-5 text-blue-600"
                    />
                </div>

                <div>
                    <button onClick={onPopulateIslands} className="w-full bg-cyan-500 hover:bg-cyan-600 p-2 rounded mb-2">Populate Islands Only</button>
                    <button onClick={onPopulateFull} className="w-full bg-indigo-500 hover:bg-indigo-600 p-2 rounded">Populate Full World</button>
                </div>
            </div>
        </div>
    );
};

export default DebugPanel;
