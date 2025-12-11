import React, { useState } from 'react';
import { BuildChoice, ResourceType, StructureType } from '../types';
import { STRUCTURE_COSTS } from '../constants';

interface BuildMenuProps {
    mode: 'select' | 'building' | 'remove';
    buildChoice: BuildChoice | null;
    resources: Record<ResourceType, number>;
    unlockedSkills: Set<string>;
    onSetMode: (mode: 'select' | 'building' | 'remove', choice?: StructureType) => void;
    onUpgradeClick: () => void;
}

interface BuildButtonProps {
    structure: StructureType;
    icon: string;
    label: string;
    isSelected: boolean;
    bgColor: string;
    onClick: () => void;
}

const BuildButton: React.FC<BuildButtonProps> = ({ structure, icon, label, isSelected, bgColor, onClick }) => {
    const cost = STRUCTURE_COSTS[structure];
    const costString = Object.entries(cost)
        .map(([res, amount]) => {
            switch(res as ResourceType) {
                case 'wood': return `${amount}🌲`;
                case 'stone': return `${amount}⛰️`;
                case 'iron': return `${amount}🔩`;
                case 'iron_ingot': return `${amount}🔗`;
                case 'lithium': return `${amount}🔋`;
                case 'motor': return `${amount}⚙️`;
                default: return '';
            }
        })
        .join(' ');

    return (
        <button
            onClick={onClick}
            className={`build-btn ${bgColor} text-white font-bold p-2 rounded-lg flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 transition shrink-0 ${isSelected ? 'selected' : ''}`}
        >
            <span className="text-2xl sm:text-3xl">{icon}</span>
            <span className="text-xs sm:text-base">{label}</span>
            <small>({costString})</small>
        </button>
    );
};


const BuildMenu: React.FC<BuildMenuProps> = ({ mode, buildChoice, resources, unlockedSkills, onSetMode, onUpgradeClick }) => {
    const [isAdvancedOpen, setAdvancedOpen] = useState(false);
    const showAdvancedToggle = unlockedSkills.has('iron_smelting');

    const handleBuildClick = (type: StructureType) => {
        const cost = STRUCTURE_COSTS[type];
        const canAfford = Object.entries(cost).every(([res, amount]) => resources[res as ResourceType] >= amount!);
        if (canAfford) {
            onSetMode('building', type);
        } else {
            // Optionally add feedback for not enough resources
            console.log("Not enough resources");
        }
    };
    
    return (
        <div className="absolute bottom-4 inset-x-0 mx-auto w-auto max-w-lg flex flex-col items-center gap-2">
             {showAdvancedToggle && (
                <div className={`w-full transition-all duration-300 ease-in-out ${isAdvancedOpen ? 'scale-y-100' : 'scale-y-0 h-0'} origin-bottom`}>
                    <div className="flex justify-center p-2 gap-2 hud-item rounded-t-xl overflow-x-auto">
                        {unlockedSkills.has('iron_smelting') && <BuildButton structure="smelter" icon="🔥" label="Smelter" isSelected={buildChoice === 'smelter'} bgColor="bg-gray-700 hover:bg-gray-800" onClick={() => handleBuildClick('smelter')} />}
                        {unlockedSkills.has('unlock_fishing') && <BuildButton structure="fishing_boat" icon="⛵" label="Fisher" isSelected={buildChoice === 'fishing_boat'} bgColor="bg-sky-500 hover:bg-sky-600" onClick={() => handleBuildClick('fishing_boat')} />}
                        {unlockedSkills.has('electrical_engineering') && <BuildButton structure="assembler" icon="🏭" label="Assembler" isSelected={buildChoice === 'assembler'} bgColor="bg-purple-600 hover:bg-purple-700" onClick={() => handleBuildClick('assembler')} />}
                        {unlockedSkills.has('automation') && <BuildButton structure="vehicle_bay" icon="🚗" label="Vehicle Bay" isSelected={buildChoice === 'vehicle_bay'} bgColor="bg-red-700 hover:bg-red-800" onClick={() => handleBuildClick('vehicle_bay')} />}
                    </div>
                </div>
            )}
            <div className='w-full'>
                {showAdvancedToggle && (
                     <button onClick={() => setAdvancedOpen(!isAdvancedOpen)} className="w-full hud-item rounded-t-lg text-center font-bold py-1">Advanced {isAdvancedOpen ? '🔽' : '🔼'}</button>
                )}
                <div className={`flex justify-center p-2 gap-2 hud-item ${showAdvancedToggle ? 'rounded-b-xl': 'rounded-xl'} overflow-x-auto`}>
                    <BuildButton structure="miner" icon="⛏️" label="Miner" isSelected={buildChoice === 'miner'} bgColor="bg-orange-400 hover:bg-orange-500" onClick={() => handleBuildClick('miner')} />
                    <BuildButton structure="storage" icon="📦" label="Storage" isSelected={buildChoice === 'storage'} bgColor="bg-yellow-600 hover:bg-yellow-700" onClick={() => handleBuildClick('storage')} />
                    <BuildButton structure="research" icon="🔬" label="Research" isSelected={buildChoice === 'research'} bgColor="bg-blue-500 hover:bg-blue-600" onClick={() => handleBuildClick('research')} />
                    
                    <button onClick={onUpgradeClick} className="bg-teal-500 hover:bg-teal-600 text-white font-bold p-2 rounded-lg flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 transition shrink-0">
                        <span className="text-2xl sm:text-3xl">✨</span>
                        <span className="text-xs sm:text-base">Upgrade</span>
                        <small>All Miners</small>
                    </button>
                    
                    <button onClick={() => onSetMode('remove')} className={`build-btn bg-red-500 hover:bg-red-600 text-white font-bold p-2 rounded-lg flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 transition shrink-0 ${mode === 'remove' ? 'selected' : ''}`}>
                        <span className="text-2xl sm:text-3xl">💣</span>
                        <span className="text-xs sm:text-base">Remove</span>
                        <small>Refunds 50%</small>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BuildMenu;