
import React from 'react';
import { ResourceType } from '../types';

interface HudProps {
    resources: Record<ResourceType, number>;
    storage: Record<ResourceType, number>;
    dayCyclePercent: number;
    unlockedSkills: Set<string>;
    isBoostActive: boolean;
    onInfoClick: () => void;
    onResearchClick: () => void;
    onBoostClick: () => void;
}

const ResourceItem: React.FC<{ icon: string, value: number, capacity?: number }> = ({ icon, value, capacity }) => (
    <div className="flex items-center gap-2">
        <span className="text-xl sm:text-2xl">{icon}</span>
        <span className="font-bold">{Math.floor(value)}{capacity !== undefined && ` / ${capacity}`}</span>
    </div>
);

const Hud: React.FC<HudProps> = ({ resources, storage, dayCyclePercent, unlockedSkills, isBoostActive, onInfoClick, onResearchClick, onBoostClick }) => {
    return (
        <div className="absolute top-0 left-0 p-2 sm:p-4 w-full">
            <div className="flex justify-between items-start">
                {/* Resources HUD */}
                <div className="hud-item p-2 sm:p-3 rounded-xl shadow-lg flex flex-col gap-1 text-base sm:text-lg w-48 sm:w-64">
                    <h1 className="font-fredoka text-xl sm:text-2xl text-cyan-800">Expactory</h1>
                    <div className="space-y-1">
                        <ResourceItem icon="🌲" value={resources.wood} capacity={storage.wood} />
                        <ResourceItem icon="⛰️" value={resources.stone} capacity={storage.stone} />
                        {unlockedSkills.has('unlock_iron') && <ResourceItem icon="🔩" value={resources.iron} capacity={storage.iron} />}
                        {unlockedSkills.has('iron_smelting') && <ResourceItem icon="🔗" value={resources.iron_ingot} capacity={storage.iron_ingot} />}
                        {unlockedSkills.has('advanced_geology') && <ResourceItem icon="🔋" value={resources.lithium} capacity={storage.lithium} />}
                        {unlockedSkills.has('electrical_engineering') && <ResourceItem icon="⚙️" value={resources.motor} capacity={storage.motor} />}
                        {unlockedSkills.has('unlock_fishing') && <ResourceItem icon="🐟" value={resources.fish} capacity={storage.fish} />}
                        <ResourceItem icon="🔬" value={resources.research} />
                    </div>
                    <div className="mt-2 text-center">
                        <label className="text-xs font-bold text-gray-600">Day: {Math.floor(dayCyclePercent * 100)}%</label>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${dayCyclePercent * 100}%` }}></div>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-end">
                    {unlockedSkills.has('unlock_fishing') && (
                        <button onClick={onBoostClick} disabled={resources.fish < 20 || isBoostActive} className={`bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-3 sm:py-3 sm:px-6 rounded-xl shadow-lg transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed ${isBoostActive ? 'animate-pulse' : ''}`}>
                            🐟<span className="hidden sm:inline"> Boost (20)</span>
                        </button>
                    )}
                    <button onClick={onInfoClick} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-3 sm:py-3 sm:px-6 rounded-xl shadow-lg transition-transform transform hover:scale-105">
                        ℹ️<span className="hidden sm:inline"> Info</span>
                    </button>
                    <button onClick={onResearchClick} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 sm:py-3 sm:px-6 rounded-xl shadow-lg transition-transform transform hover:scale-105">
                        🔬<span className="hidden sm:inline"> Research</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Hud;
