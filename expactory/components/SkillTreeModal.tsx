
import React from 'react';
import Modal from './Modal';
import { SKILL_TREE } from '../constants';

interface SkillTreeModalProps {
    isOpen: boolean;
    onClose: () => void;
    researchPoints: number;
    unlockedSkills: Set<string>;
    onUnlock: (skillId: string) => void;
}

const SkillNode: React.FC<{ skillId: string, researchPoints: number, unlockedSkills: Set<string>, onUnlock: (skillId: string) => void }> = ({ skillId, researchPoints, unlockedSkills, onUnlock }) => {
    const skill = SKILL_TREE[skillId];
    if (!skill) return null;

    const isUnlocked = unlockedSkills.has(skillId);
    const dependenciesMet = skill.dependencies.every(depId => unlockedSkills.has(depId));
    const canAfford = researchPoints >= skill.cost;
    const isAvailable = !isUnlocked && dependenciesMet;

    let statusClasses = 'bg-gray-500 text-gray-200 cursor-not-allowed'; // Locked
    if (isUnlocked) statusClasses = 'bg-blue-500 text-white'; // Unlocked
    else if (isAvailable) statusClasses = 'bg-green-600 text-white cursor-pointer hover:scale-105'; // Available

    return (
        <div
            onClick={() => isAvailable && canAfford && onUnlock(skillId)}
            className={`p-4 rounded-lg shadow-md flex flex-col items-center text-center transition ${statusClasses}`}
            style={{ opacity: isAvailable && !canAfford ? 0.7 : 1 }}
        >
            <h3 className="font-bold text-lg">{skill.name}</h3>
            <p className="text-sm my-2 flex-grow">{skill.description}</p>
            {!isUnlocked && <p className="font-bold mt-auto">Cost: {skill.cost}🔬</p>}
        </div>
    );
};

const SkillTreeModal: React.FC<SkillTreeModalProps> = ({ isOpen, onClose, researchPoints, unlockedSkills, onUnlock }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-fredoka text-cyan-800">Research & Development</h2>
                <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg">Close</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.keys(SKILL_TREE).map(skillId => (
                    <SkillNode key={skillId} skillId={skillId} researchPoints={researchPoints} unlockedSkills={unlockedSkills} onUnlock={onUnlock} />
                ))}
            </div>
        </Modal>
    );
};

export default SkillTreeModal;
