
import React from 'react';
import Modal from './Modal';
import { ResourceType } from '../types';
import { GLOBAL_MINER_UPGRADES } from '../constants';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    level: number;
    resources: Record<ResourceType, number>;
    onUpgrade: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, level, resources, onUpgrade }) => {
    const nextUpgrade = GLOBAL_MINER_UPGRADES[level];
    const canAfford = nextUpgrade ? resources.wood >= nextUpgrade.cost.wood && resources.stone >= nextUpgrade.cost.stone : false;

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm">
            <div className="text-center">
                <h2 className="text-2xl font-fredoka text-cyan-800 mb-2">Global Miner Upgrade</h2>
                <p className="mb-4 text-gray-600">Current Level: {level}</p>
                <div className="mb-6 text-gray-700 bg-gray-100 p-4 rounded-lg">
                    {nextUpgrade ? (
                        <p dangerouslySetInnerHTML={{ __html: `<b>Next Level:</b> ${nextUpgrade.description}` }} />
                    ) : (
                        <p>You've reached the maximum miner level!</p>
                    )}
                </div>
                {nextUpgrade && (
                    <>
                        <div className="mb-4">
                            <h3 className="font-bold mb-2">Next Upgrade Cost:</h3>
                            <p className="text-lg">{nextUpgrade.cost.wood} 🌲 & {nextUpgrade.cost.stone} ⛰️</p>
                        </div>
                        <button
                            onClick={onUpgrade}
                            disabled={!canAfford}
                            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg w-full mb-2 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Upgrade All Miners
                        </button>
                    </>
                )}
                <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg w-full">Close</button>
            </div>
        </Modal>
    );
};

export default UpgradeModal;
